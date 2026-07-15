/** Singleton, fully-typed Socket.IO client shared across the app. */

import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@doodle/shared';

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000';

export const socket: GameSocket = io(SERVER_URL, {
  autoConnect: false,
  transports: ['websocket'],
});
