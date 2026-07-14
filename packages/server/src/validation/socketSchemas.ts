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

export const PointSchema = z.object({
  x: z.number().finite().min(0).max(1),
  y: z.number().finite().min(0).max(1),
});

export const DrawStrokeSchema = z.object({
  id: z.string().min(1),
  tool: z.enum(['brush', 'eraser', 'fill']),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6,8}$/, 'Invalid color format'),
  width: z.number().finite().min(CANVAS.MIN_BRUSH).max(CANVAS.MAX_BRUSH),
  points: z.array(PointSchema).min(1).max(256, 'Point count exceeds limit'),
});

export const DrawUndoSchema = z.object({
  id: z.string().min(1),
});

export const PingSchema = z.object({
  time: z.number().finite(),
});

/**
 * Reusable helper for safe payload parsing.
 * Returns { success: true, data: T } or { success: false, error: string }
 */
export function validateSocketPayload<T>(
  schema: z.ZodSchema<T>,
  payload: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(payload);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errorMsg = result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ');
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Validation Failure] Payload:`, payload, `Error:`, errorMsg);
    }
    return { success: false, error: 'Invalid payload.' };
  }
}
