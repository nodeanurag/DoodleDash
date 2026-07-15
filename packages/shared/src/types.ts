/** Core domain types shared between client and server. */

export type GamePhase =
  | 'lobby'
  | 'choosing'
  | 'drawing'
  | 'round-end'
  | 'game-end';

export interface Player {
  id: string;
  userId: string | null;
  name: string;
  avatarColor: string;
  avatarUrl: string;
  score: number;
  isHost: boolean;
  isDrawing: boolean;
  hasGuessed: boolean;
  connected: boolean;
}

export interface RoomSettings {
  rounds: number;
  drawTimeSeconds: number;
  maxPlayers: number;
  isPrivate: boolean;
}

export interface RoomState {
  code: string;
  phase: GamePhase;
  round: number;
  totalRounds: number;
  players: Player[];
  hostId: string;
  currentDrawerId: string | null;
  /** Masked word pattern shown to guessers, e.g. "_ _ _ _". */
  wordHint: string | null;
  timeRemaining: number;
  settings: RoomSettings;
  /** Number of connected watch-only viewers (not in the player roster). */
  spectatorCount: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  type: 'chat' | 'guess' | 'correct' | 'system';
  timestamp: number;
}

// --- Drawing ---

export type Tool = 'brush' | 'eraser' | 'fill';

/** A point in the shared logical canvas space (see CANVAS in constants). */
export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  points: Point[];
}

// --- Auth ---

export interface PublicUser {
  id: string;
  username: string;
  avatarColor: string;
}
