import { nanoid } from 'nanoid';
import type { Server } from 'socket.io';
import {
  GAME,
  type ChatMessage,
  type ClientToServerEvents,
  type GamePhase,
  type InterServerEvents,
  type Player,
  type RoomSettings,
  type RoomState,
  type ServerToClientEvents,
  type SocketData,
  type Stroke,
} from '@doodle/shared';
import { pickWords } from './words.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
];

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

export class Room {
  readonly code: string;
  private readonly io: IO;
  private settings: RoomSettings;

  private players = new Map<string, Player>();
  private spectators = new Map<string, { id: string; name: string }>();
  private hostId = '';

  private phase: GamePhase = 'lobby';
  private round = 0;

  private drawOrder: string[] = [];
  private drawIndex = -1;
  private currentDrawerId: string | null = null;
  private currentWord: string | null = null;
  private wordChoices: string[] = [];
  private correctThisTurn = new Set<string>();

  private timeRemaining = 0;
  private tickHandle: NodeJS.Timeout | null = null;
  private phaseHandle: NodeJS.Timeout | null = null;

  private strokes: Stroke[] = [];

  private lastActivityTime = Date.now();
  private emptyGraceTimer: NodeJS.Timeout | null = null;

  constructor(io: IO, code: string, settings: RoomSettings) {
    this.io = io;
    this.code = code;
    this.settings = settings;
  }

  markActivity(): void {
    this.lastActivityTime = Date.now();
  }

  getLastActivityTime(): number {
    return this.lastActivityTime;
  }

  startEmptyGracePeriod(onExpire: () => void): void {
    if (this.emptyGraceTimer) clearTimeout(this.emptyGraceTimer);
    this.emptyGraceTimer = setTimeout(() => {
      this.emptyGraceTimer = null;
      onExpire();
    }, 10000);
  }

  cancelEmptyGracePeriod(): void {
    if (this.emptyGraceTimer) {
      clearTimeout(this.emptyGraceTimer);
      this.emptyGraceTimer = null;
    }
  }

  get playerCount(): number {
    return this.players.size;
  }

  get connectedCount(): number {
    return [...this.players.values()].filter((p) => p.connected).length;
  }

  get spectatorCount(): number {
    return this.spectators.size;
  }

  isEmpty(): boolean {
    return this.players.size === 0 && this.spectators.size === 0;
  }

  addSpectator(socketId: string, name: string): void {
    this.cancelEmptyGracePeriod();
    this.spectators.set(socketId, { id: socketId, name: name.slice(0, 20) || 'Spectator' });
    this.broadcastState();
  }

  removeSpectator(socketId: string): void {
    if (this.spectators.delete(socketId)) this.broadcastState();
  }

  isSpectator(socketId: string): boolean {
    return this.spectators.has(socketId);
  }

  addPlayer(socketId: string, name: string, customColor?: string, customUrl?: string): Player {
    this.cancelEmptyGracePeriod();
    const isHost = this.players.size === 0;
    if (isHost) this.hostId = socketId;

    const color = customColor || AVATAR_COLORS[this.players.size % AVATAR_COLORS.length];
    const defaultUrl = `https://api.dicebear.com/10.x/croodles/svg?seed=${encodeURIComponent(name || socketId)}&backgroundColor=${color.replace('#', '')}`;

    const player: Player = {
      id: socketId,
      userId: null,
      name: name.slice(0, 20) || `Player ${this.players.size + 1}`,
      avatarColor: color,
      avatarUrl: customUrl || defaultUrl,
      score: 0,
      isHost,
      isDrawing: false,
      hasGuessed: false,
      connected: true,
    };
    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId: string): void {
    const player = this.players.get(socketId);
    if (!player) return;
    this.players.delete(socketId);
    this.drawOrder = this.drawOrder.filter((id) => id !== socketId);

    // Reassign host if needed.
    if (this.hostId === socketId) {
      const next = [...this.players.values()][0];
      if (next) {
        next.isHost = true;
        this.hostId = next.id;
      }
    }

    // If the drawer left mid-turn, end the turn immediately.
    if (this.currentDrawerId === socketId && this.phase !== 'lobby') {
      this.endTurn();
      return;
    }

    if (this.players.size > 0) this.broadcastState();
  }

  startGame(requesterId: string): { ok: true } | { error: string } {
    if (requesterId !== this.hostId) return { error: 'Only the host can start the game.' };
    if (this.phase !== 'lobby' && this.phase !== 'game-end')
      return { error: 'Game already in progress.' };
    if (this.connectedCount < GAME.MIN_PLAYERS)
      return { error: `Need at least ${GAME.MIN_PLAYERS} players.` };

    for (const p of this.players.values()) p.score = 0;
    this.round = 0;
    this.drawOrder = [...this.players.keys()];
    this.drawIndex = -1;
    this.system('The game is starting!');
    this.nextTurn();
    return { ok: true };
  }

  private nextTurn(): void {
    this.clearTimers();
    this.drawIndex += 1;

    if (this.drawIndex >= this.drawOrder.length) {
      this.round += 1;
      this.drawIndex = 0;
      if (this.round > this.settings.rounds) {
        this.endGame();
        return;
      }
    }
    if (this.round === 0) this.round = 1;

    let guard = 0;
    while (guard < this.drawOrder.length) {
      const candidate = this.drawOrder[this.drawIndex];
      const player = candidate ? this.players.get(candidate) : undefined;
      if (player && player.connected) break;
      this.drawIndex += 1;
      guard += 1;
      if (this.drawIndex >= this.drawOrder.length) {
        this.round += 1;
        this.drawIndex = 0;
        if (this.round > this.settings.rounds) {
          this.endGame();
          return;
        }
      }
    }

    const drawerId = this.drawOrder[this.drawIndex];
    if (!drawerId || !this.players.get(drawerId)?.connected) {
      this.endGame();
      return;
    }

    this.beginChoosing(drawerId);
  }

  private beginChoosing(drawerId: string): void {
    this.phase = 'choosing';
    this.currentDrawerId = drawerId;
    this.currentWord = null;
    this.strokes = [];
    this.correctThisTurn.clear();
    this.wordChoices = pickWords(GAME.WORD_CHOICE_COUNT);

    for (const p of this.players.values()) {
      p.isDrawing = p.id === drawerId;
      p.hasGuessed = false;
    }

    this.io.to(this.code).emit('draw:clear');
    this.broadcastState();

    this.io.to(drawerId).emit('word:choices', { words: this.wordChoices });
    this.system(`${this.players.get(drawerId)?.name ?? 'Someone'} is choosing a word.`);

    this.startCountdown(GAME.WORD_CHOICE_TIME_SECONDS, () => {
      this.chooseWord(drawerId, this.wordChoices[0]);
    });
  }

  chooseWord(drawerId: string, word: string): void {
    if (this.phase !== 'choosing' || drawerId !== this.currentDrawerId) return;
    if (!this.wordChoices.includes(word)) return;
    this.clearTimers();

    this.currentWord = word;
    this.wordChoices = [];
    this.phase = 'drawing';
    this.broadcastState();

    this.io.to(drawerId).emit('word:reveal', { word });

    this.startCountdown(this.settings.drawTimeSeconds, () => this.endTurn());
  }

  private endTurn(): void {
    this.clearTimers();
    if (this.phase === 'lobby' || this.phase === 'game-end') return;

    this.phase = 'round-end';
    const word = this.currentWord;
    for (const p of this.players.values()) p.isDrawing = false;

    if (word) {
      this.io.to(this.code).emit('word:reveal', { word });
      this.system(`The word was "${word}".`);
    }
    this.broadcastState();

    this.startCountdown(GAME.ROUND_END_DELAY_SECONDS, () => this.nextTurn());
  }

  private endGame(): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Game Ended] Room ${this.code} finished loop.`);
    }
    this.clearTimers();
    this.phase = 'game-end';
    this.currentDrawerId = null;
    this.currentWord = null;
    this.wordChoices = []; // Clear word choices
    this.strokes = []; // Clear stroke history
    for (const p of this.players.values()) p.isDrawing = false;

    const winner = [...this.players.values()].sort((a, b) => b.score - a.score)[0];
    if (winner) this.system(`Game over! ${winner.name} wins with ${winner.score} points.`);
    this.broadcastState();
  }

  private startCountdown(seconds: number, onDone: () => void): void {
    this.timeRemaining = seconds;
    this.io.to(this.code).emit('timer:tick', { timeRemaining: this.timeRemaining });

    this.tickHandle = setInterval(() => {
      this.timeRemaining -= 1;
      this.io.to(this.code).emit('timer:tick', { timeRemaining: Math.max(0, this.timeRemaining) });
      if (this.timeRemaining <= 0 && this.tickHandle) {
        clearInterval(this.tickHandle);
        this.tickHandle = null;
      }
    }, 1000);

    this.phaseHandle = setTimeout(onDone, seconds * 1000);
  }

  private clearTimers(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
    if (this.phaseHandle) clearTimeout(this.phaseHandle);
    this.tickHandle = null;
    this.phaseHandle = null;
  }

  dispose(): void {
    this.clearTimers();
    this.wordChoices = [];
    this.strokes = [];
    this.players.clear();
    this.spectators.clear();
  }

  addStroke(playerId: string, stroke: Stroke): boolean {
    if (this.phase !== 'drawing' || playerId !== this.currentDrawerId) return false;
    if (!this.players.has(playerId)) return false;
    if (this.strokes.length >= 2000) {
      return false;
    }
    this.strokes.push(stroke);
    this.io.to(this.code).except(playerId).emit('draw:stroke', stroke);
    return true;
  }

  clearCanvas(playerId: string): boolean {
    if (this.phase !== 'drawing' || playerId !== this.currentDrawerId) return false;
    if (!this.players.has(playerId)) return false;
    this.strokes = [];
    this.io.to(this.code).emit('draw:clear');
    return true;
  }

  undoStroke(playerId: string, strokeId?: string): boolean {
    if (this.phase !== 'drawing' || playerId !== this.currentDrawerId) return false;
    if (!this.players.has(playerId)) return false;
    let idToUndo = strokeId;
    if (!idToUndo) {
      const last = this.strokes[this.strokes.length - 1];
      if (!last) return false;
      idToUndo = last.id;
    }
    const exists = this.strokes.some((s) => s.id === idToUndo);
    if (!exists) return false;

    this.strokes = this.strokes.filter((s) => s.id !== idToUndo);
    this.io.to(this.code).emit('draw:undo', { id: idToUndo });
    return true;
  }

  sendCatchup(socketId: string): void {
    if (this.strokes.length > 0) {
      this.io.to(socketId).emit('room:catchup', this.strokes);
    }
  }

  handleChat(playerId: string, rawText: string): void {
    const text = rawText.slice(0, 120).trim();
    if (!text) return;

    // Spectators may chat but can never guess. Their messages still must not
    // leak the secret word back to the room.
    const spectator = this.spectators.get(playerId);
    if (spectator) {
      if (this.currentWord && normalize(text) === normalize(this.currentWord)) return;
      this.broadcastChat({
        id: nanoid(8),
        playerId,
        playerName: `${spectator.name} 👀`,
        text,
        type: 'chat',
        timestamp: Date.now(),
      });
      return;
    }

    const player = this.players.get(playerId);
    if (!player) return;

    // The drawer (and players who already guessed) can't broadcast the answer.
    const isGuessingPhase = this.phase === 'drawing';
    const canGuess = isGuessingPhase && playerId !== this.currentDrawerId && !player.hasGuessed;

    if (canGuess && this.currentWord && normalize(text) === normalize(this.currentWord)) {
      this.acceptGuess(player);
      return;
    }

    // Hide near-miss spoilers: if a guesser typed the exact word but isn't
    // allowed to score (already guessed / is drawer) we still must not echo it.
    if (this.currentWord && normalize(text) === normalize(this.currentWord)) {
      // Quietly drop — never reveal the secret word in plain chat.
      return;
    }

    this.broadcastChat({
      id: nanoid(8),
      playerId,
      playerName: player.name,
      text,
      type: 'chat',
      timestamp: Date.now(),
    });
  }

  acceptGuess(player: Player): void {
    // dummy method for compilation/completeness
  }

  broadcastChat(message: ChatMessage): void {
    // dummy method for compilation/completeness
  }

  broadcastState(): void {
    // dummy method for compilation/completeness
  }

  system(text: string): void {
    // dummy method for compilation/completeness
  }
}
