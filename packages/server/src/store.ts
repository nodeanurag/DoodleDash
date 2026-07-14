import type { Server } from 'socket.io';
import {
  GAME,
  ROOM_CODE_LENGTH,
  type ClientToServerEvents,
  type InterServerEvents,
  type RoomSettings,
  type ServerToClientEvents,
  type SocketData,
} from '@doodle/shared';
import { Room } from './room.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars

export interface RoomStore {
  get(code: string): Room | undefined;
  set(code: string, room: Room): void;
  delete(code: string): void;
  has(code: string): boolean;
  values(): IterableIterator<Room>;
}
