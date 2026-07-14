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
}
