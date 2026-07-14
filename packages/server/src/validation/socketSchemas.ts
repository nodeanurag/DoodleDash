import { z } from 'zod';
import { GAME, CANVAS } from '@doodle/shared';

// Alphabet from store.ts: CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const ROOM_CODE_REGEX = /^[A-HJ-NP-Z2-9]+$/i;

export const PlayerNameSchema = z.string()
  .trim()
  .min(1, 'Name must be at least 1 character')
  .max(24, 'Name must be at most 24 characters');

export const RoomCodeSchema = z.string()
  .trim()
  .toUpperCase()
  .length(6, 'Room code must be exactly 6 characters')
  .regex(ROOM_CODE_REGEX, 'Room code contains invalid characters');

export const RoomSettingsSchema = z.object({
  rounds: z.number().int().min(1).max(10),
  drawTimeSeconds: z.number().int().min(20).max(180),
  maxPlayers: z.number().int().min(GAME.MIN_PLAYERS).max(GAME.MAX_PLAYERS),
  isPrivate: z.boolean(),
});

export const RoomCreateSchema = z.object({
  name: PlayerNameSchema,
  avatarColor: z.string().trim().max(50).optional(),
  avatarUrl: z.string().trim().max(500).optional(),
  settings: RoomSettingsSchema.partial().optional(),
});

export const RoomJoinSchema = z.object({
  name: PlayerNameSchema,
  code: RoomCodeSchema,
  avatarColor: z.string().trim().max(50).optional(),
  avatarUrl: z.string().trim().max(500).optional(),
  spectate: z.boolean().optional(),
});

export const WordChooseSchema = z.object({
  word: z.string().trim().min(1),
});

export const ChatSendSchema = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty').max(200, 'Message too long'),
});
