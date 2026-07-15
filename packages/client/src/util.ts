/** Small client-only helpers. */

let strokeCounter = 0;

/** Monotonic per-session stroke id; uniqueness only needs to hold locally. */
export function nextStrokeId(): string {
  strokeCounter += 1;
  return `s${strokeCounter}`;
}

/** Build a shareable invite URL for a room (optionally as a spectator link). */
export function inviteLink(code: string, spectate = false): string {
  const { origin, pathname } = window.location;
  const q = spectate ? `?room=${code}&spectate=1` : `?room=${code}`;
  return `${origin}${pathname}${q}`;
}
