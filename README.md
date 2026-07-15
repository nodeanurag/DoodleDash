# 🎨 DoodleDash

A real-time multiplayer drawing & guessing game (a Skribbl.io clone) built as a
TypeScript monorepo. One player draws a secret word on a shared HTML5 canvas;
everyone else races to guess it in chat before the timer runs out.

## Architecture

```
[Client Canvas]  <--->  (Socket.IO WebSockets)  <--->  [Node.js Server State]
 (Draws strokes)        (Bi-directional Events)        (Validates & Broadcasts)
```

- **`packages/shared`** — the typed contract (domain types, Socket.IO event
  interfaces, game constants) imported by both sides so they never drift.
- **`packages/server`** — Express + Socket.IO. The single source of truth: it
  owns rooms, runs the turn/round loop on server-side timers, validates guesses,
  and computes scores. The secret word is **never** sent to guessing clients.
- **`packages/client`** — Vite + React, styled with **Tailwind CSS v4** and
  **shadcn/ui** components, with **lucide-react** / **react-icons** iconography
  and **sonner** toasts. A pure input/output layer: it renders the authoritative
  room snapshots and relays drawing/guess input.

## Getting started

```bash
npm install          # install all workspaces
npm run build:shared # compile the shared contract (server/client depend on it)
npm run dev          # run server (:3000) + client (:5173) together
```

Then open <http://localhost:5173> in two browser tabs/windows, create a room in
one, and join with the room code in the other. You need **2+ players** to start.

### Useful scripts

| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Server + client in watch mode (concurrently)  |
| `npm run dev:server` | Server only (`tsx watch`)                     |
| `npm run dev:client` | Client only (Vite dev server)                 |
| `npm run build`      | Build shared → server → client                |
| `npm run typecheck`  | Type-check every workspace                    |
| `npm run lint`       | ESLint across the repo                        |

### Configuration

- **Server** (`packages/server/.env`, see `.env.example`):
  `PORT` (default `3000`), `CLIENT_ORIGIN` (default `http://localhost:5173`).
- **Client**: `VITE_SERVER_URL` (default `http://localhost:3000`).

## Game flow

1. **Lobby** — host shares the room code; players join.
2. **Choosing** — the drawer picks one of three words (auto-picked on timeout).
3. **Drawing** — the drawer sketches; guessers type in chat. Correct guesses are
   scored on remaining time; the drawer earns a bonus per correct guesser.
4. **Round end** — the word is revealed, then the next player draws.
5. After every player has drawn for the configured number of rounds, a final
   scoreboard is shown and the host can start again.

## Social features

- **Invite links** — share `…?room=CODE` (or `…?room=CODE&spectate=1`) and the
  join form auto-fills. The lobby has one-click **Copy invite link** /
  **Copy spectator link** buttons.
- **Spectators** — join with the *Watch* toggle to view a game live (canvas,
  chat, scores) without playing. Spectators aren't limited by the player cap,
  never affect scoring, can chat, and never receive the secret word.
- **Shareable results** — the final scoreboard can be saved as a PNG or shared
  via the native share sheet (mobile), generated client-side on a canvas.

## Anti-cheat / design constraints

- **Zero-trust client:** the server validates all guesses, scoring and timers.
- **No word leaks:** the secret word is masked (`_ _ _`) for guessers and only
  revealed to the drawer (and to everyone at round end). Chat messages exactly
  matching the word are dropped rather than echoed.
- **Dimension independence:** all stroke geometry travels in relative `0..1`
  coordinates, so drawings render identically on any screen size.
- **State-clean transitions:** the server emits an explicit `draw:clear` between
  turns to wipe every canvas simultaneously.
- **Rate limiting & socket throttling:**
  - Sliding-window rate limiters prevent connection spamming (e.g., maximum of 2 room creations and 5 joins per minute, and 60 chat messages per minute).
  - A stroke point budget throttle restricts drawing commands to a sliding point budget per connection to prevent server canvas flooding and coordinate overflow.

