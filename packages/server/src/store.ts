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

export class InMemoryRoomStore implements RoomStore {
  private rooms = new Map<string, Room>();

  get(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  set(code: string, room: Room): void {
    this.rooms.set(code.toUpperCase(), room);
  }

  delete(code: string): void {
    this.rooms.delete(code.toUpperCase());
  }

  has(code: string): boolean {
    return this.rooms.has(code.toUpperCase());
  }

  values(): IterableIterator<Room> {
    return this.rooms.values();
  }
}

export class RoomManager {
  private sweeperInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly io: IO,
    private readonly store: RoomStore = new InMemoryRoomStore()
  ) {
    this.startSweeper();
  }

  private startSweeper(): void {
    this.sweeperInterval = setInterval(() => {
      this.cleanupExpired();
    }, 30000);
    this.sweeperInterval.unref();
  }

  cleanupExpired(): void {
    const now = Date.now();
    for (const room of this.store.values()) {
      const lastActivity = room.getLastActivityTime();
      if (room.isEmpty()) {
        continue; // Handled by reconnect grace period
      }

      if (room.toState().phase === 'lobby') {
        if (now - lastActivity > 10 * 60 * 1000) { // 10 minutes
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[Lobby Expired] Room ${room.code} inactive for > 10m.`);
          }
          room.dispose();
          this.store.delete(room.code);
        }
      } else {
        if (now - lastActivity > 30 * 60 * 1000) { // 30 minutes
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[Game Abandoned] Room ${room.code} inactive for > 30m.`);
          }
          room.dispose();
          this.store.delete(room.code);
        }
      }
    }
  }
}
