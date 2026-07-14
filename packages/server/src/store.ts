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

  private generateCode(): string {
    let code = '';
    do {
      code = '';
      for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
        code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
      }
    } while (this.store.has(code));
    return code;
  }

  private resolveSettings(partial?: Partial<RoomSettings>): RoomSettings {
    return {
      rounds: clamp(partial?.rounds ?? GAME.DEFAULT_ROUNDS, 1, 10),
      drawTimeSeconds: clamp(
        partial?.drawTimeSeconds ?? GAME.DEFAULT_DRAW_TIME_SECONDS,
        20,
        180,
      ),
      maxPlayers: clamp(partial?.maxPlayers ?? GAME.MAX_PLAYERS, GAME.MIN_PLAYERS, GAME.MAX_PLAYERS),
      isPrivate: partial?.isPrivate ?? true,
    };
  }

  create(partial?: Partial<RoomSettings>): Room {
    const code = this.generateCode();
    const room = new Room(this.io, code, this.resolveSettings(partial));
    this.store.set(code, room);
    return room;
  }

  get(code: string): Room | undefined {
    return this.store.get(code);
  }

  destroyIfEmpty(code: string): void {
    const room = this.store.get(code);
    if (room && room.isEmpty()) {
      room.startEmptyGracePeriod(() => {
        if (room.isEmpty()) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[Disposed Empty Room] Room ${room.code} empty grace period expired.`);
          }
          room.dispose();
          this.store.delete(code);
        }
      });
    }
  }

  get count(): number {
    let total = 0;
    for (const _ of this.store.values()) {
      total++;
    }
    return total;
  }

  get totalPlayerCount(): number {
    let total = 0;
    for (const room of this.store.values()) {
      total += room.playerCount;
    }
    return total;
  }

  get totalSpectatorCount(): number {
    let total = 0;
    for (const room of this.store.values()) {
      total += room.spectatorCount;
    }
    return total;
  }

  getStore(): RoomStore {
    return this.store;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}
