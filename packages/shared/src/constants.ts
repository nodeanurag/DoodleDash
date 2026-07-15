/**
 * Shared game constants used by both the client and server.
 * Keeping these in one place guarantees the two sides agree on game rules.
 */

export const GAME = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  DEFAULT_ROUNDS: 3,
  DEFAULT_DRAW_TIME_SECONDS: 80,
  WORD_CHOICE_COUNT: 3,
  WORD_CHOICE_TIME_SECONDS: 15,
  ROUND_END_DELAY_SECONDS: 6,
} as const;

export const CANVAS = {
  /** Logical coordinate space. Clients map their pixel size to this range. */
  WIDTH: 1000,
  HEIGHT: 600,
  MIN_BRUSH: 2,
  MAX_BRUSH: 40,
} as const;

export const DEFAULT_COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#a16207',
  '#6b7280',
] as const;

export const ROOM_CODE_LENGTH = 6;
