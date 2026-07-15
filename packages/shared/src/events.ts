/**
 * Typed Socket.IO event contract. Both the server (`Server<...>`) and the
 * client (`io<...>`) import these interfaces so event names and payloads
 * stay in sync.
 */

import type { ChatMessage, RoomSettings, RoomState, Stroke } from './types.js';

export interface ServerToClientEvents {
  /** Authoritative room snapshot. The client renders purely from this. */
  'room:state': (state: RoomState) => void;
  /** Full stroke history for the current turn (late-join / turn catch-up). */
  'room:catchup': (strokes: Stroke[]) => void;
  'chat:message': (message: ChatMessage) => void;
  'draw:stroke': (stroke: Stroke) => void;
  'draw:clear': () => void;
  'draw:undo': (payload: { id: string }) => void;
  /** Per-second countdown so we don't broadcast full state every tick. */
  'timer:tick': (payload: { timeRemaining: number }) => void;
  /** Sent ONLY to the active drawer at the start of their turn. */
  'word:choices': (payload: { words: string[] }) => void;
  /**
   * Reveals the secret word — to the drawer when their turn begins, and to
   * everyone at round end. Never sent to guessers mid-turn.
   */
  'word:reveal': (payload: { word: string }) => void;
  'game:error': (payload: { message: string }) => void;
  'online-players:count': (payload: { count: number }) => void;
  pong: (payload: { time: number }) => void;
}

export interface ClientToServerEvents {
  'room:create': (
    payload: { name: string; avatarColor?: string; avatarUrl?: string; settings?: Partial<RoomSettings> },
    ack: (result: { code: string } | { error: string }) => void,
  ) => void;
  'room:join': (
    payload: { name: string; code: string; avatarColor?: string; avatarUrl?: string; spectate?: boolean },
    ack: (result: { ok: true } | { error: string }) => void,
  ) => void;
  'room:leave': () => void;
  /** Host-only: transition the room from lobby into the first turn. */
  'game:start': (ack?: (result: { ok: true } | { error: string }) => void) => void;
  /** Drawer-only: pick one of the three offered words. */
  'word:choose': (payload: { word: string }) => void;
  'chat:send': (payload: { text: string }) => void;
  'draw:stroke': (stroke: Stroke) => void;
  'draw:clear': () => void;
  'draw:undo': (payload: { id: string }) => void;
  ping: (payload: { time: number }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string | null;
  playerName: string;
  roomCode: string | null;
}
