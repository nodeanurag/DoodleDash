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

class SocketRateLimiter {
  // Maps socketId -> Map of eventName -> Array of timestamps
  private records = new Map<string, Map<string, number[]>>();

  /**
   * Evaluates if a socket is within its rate limit for a specific event.
   * Returns true if allowed, false if rate limited.
   */
  allow(socketId: string, eventName: string): boolean {
    const rule = RATE_LIMITS[eventName];
    if (!rule) return true; // Unregulated event

    const now = Date.now();

    let socketMap = this.records.get(socketId);
    if (!socketMap) {
      socketMap = new Map<string, number[]>();
      this.records.set(socketId, socketMap);
    }

    let timestamps = socketMap.get(eventName);
    if (!timestamps) {
      timestamps = [];
      socketMap.set(eventName, timestamps);
    }

    // Clean up timestamps outside window
    const windowStart = now - rule.durationMs;
    const activeTimestamps = timestamps.filter(t => t > windowStart);
    socketMap.set(eventName, activeTimestamps);

    if (activeTimestamps.length >= rule.points) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Rate Limited] Socket ${socketId} triggered event ${eventName}`);
      }
      return false;
    }

    activeTimestamps.push(now);
    return true;
  }

  /**
   * Delete rate limiting registers when a socket disconnects.
   */
  clear(socketId: string): void {
    this.records.delete(socketId);
  }
}

export const socketRateLimiter = new SocketRateLimiter();

class PointBudget {
  // Maps socketId -> Array of [timestamp, count]
  private records = new Map<string, [number, number][]>();

  /**
   * Evaluates if the socket has point budget remaining in a sliding 1-second window.
   */
  allow(socketId: string, pointCount: number, maxPointsPerSecond = 5000): boolean {
    const now = Date.now();
    const windowStart = now - 1000;

    let points = this.records.get(socketId);
    if (!points) {
      points = [];
      this.records.set(socketId, points);
    }

    // Filter old timestamps
    const activePoints = points.filter(([t]) => t > windowStart);
    this.records.set(socketId, activePoints);

    // Sum points in active window
    const currentSum = activePoints.reduce((sum, [, count]) => sum + count, 0);

    if (currentSum + pointCount > maxPointsPerSecond) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Point Budget Exceeded] Socket ${socketId} requested ${pointCount} points, current window sum is ${currentSum}`);
      }
      return false;
    }

    activePoints.push([now, pointCount]);
    return true;
  }

  /**
   * Delete point budget registers when a socket disconnects.
   */
  clear(socketId: string): void {
    this.records.delete(socketId);
  }
}

export const pointBudget = new PointBudget();
