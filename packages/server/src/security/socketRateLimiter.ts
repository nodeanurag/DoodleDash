export interface RateLimitRule {
  points: number;       // Max events allowed
  durationMs: number;   // Window size in ms
}

export const RATE_LIMITS: Record<string, RateLimitRule> = {
  'draw:stroke': { points: 120, durationMs: 1000 },
  'chat:send': { points: 5, durationMs: 3000 },
  'room:create': { points: 3, durationMs: 60000 },
  'room:join': { points: 10, durationMs: 60000 },
  'word:choose': { points: 5, durationMs: 10000 },
  'draw:undo': { points: 20, durationMs: 10000 },
  'draw:clear': { points: 5, durationMs: 10000 },
};
