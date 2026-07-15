# DoodleDash — Technical Workflow & Architecture

A complete, real-time multiplayer drawing-and-guessing game (a Skribbl.io clone).
This document explains **how the whole project is wired together** — the data
model, the network contract, the server game engine, the client rendering layer,
and every end-to-end flow with the exact Socket.IO events involved.

---

## 1. High-level architecture

```
┌────────────────────────┐         WebSocket (Socket.IO)         ┌────────────────────────┐
│        CLIENT          │  ◀──────────────────────────────────▶ │        SERVER          │
│  Vite + React + TS     │     bi-directional typed events       │  Node + Express + TS   │
│                        │                                       │                        │
│  • Canvas (draw/replay)│   draw:stroke ─────────────────────▶  │  RoomStore (Map)       │
│  • React Context store │   ◀───────────────────── room:state   │   └─ Room (game loop)  │
│  • shadcn/ui + Tailwind│   chat:send ──────────────────────▶   │       ├─ timers        │
│  • socket.io-client    │   ◀────────────── chat:message/tick   │       ├─ scoring       │
└────────────────────────┘                                       │       └─ word logic    │
            │                                                     └────────────────────────┘
            │                         ┌────────────────────────┐
            └─────── imports ────────▶│   @doodle/shared       │◀──────── imports ────────┘
                                      │  types · events ·      │
                                      │  constants (1 contract)│
                                      └────────────────────────┘
```

**Core principle — the server is the single source of truth.** The client is a
pure input/output layer: it sends user intent (draw, guess, pick word) and
renders whatever authoritative snapshot the server broadcasts. It never decides
scores, timers, turn order, or whether a guess is correct.

---

## 2. Tech stack

| Layer        | Technology |
|--------------|------------|
| Language     | TypeScript (strict) across all three packages |
| Monorepo     | npm workspaces |
| Server       | Node ≥20, Express 4, Socket.IO 4, `nanoid`, `dotenv`, `cors` |
| Client build | Vite 6, `@vitejs/plugin-react` |
| Client UI    | React 18, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (Radix primitives), `lucide-react` + `react-icons`, `sonner` toasts |
| Realtime     | `socket.io` (server) / `socket.io-client` (client) |
| Dev tooling  | ESLint, Prettier, `tsx` (server watch), `concurrently`, Husky + lint-staged |

---

## 3. Repository layout

```
DoodleDash/
├── package.json                 # workspace root: scripts orchestrate all packages
├── tsconfig.base.json           # shared compiler options (extended by each package)
├── .eslintrc.cjs / .prettierrc.json
├── README.md / workflow.md / plan.md
└── packages/
    ├── shared/                  # @doodle/shared — the typed contract
    │   ├── src/types.ts         #   domain models (Player, Room, Stroke, …)
    │   ├── src/events.ts        #   Socket.IO event interfaces (client↔server)
    │   ├── src/constants.ts     #   game rules & canvas constants
    │   └── src/index.ts         #   barrel export
    │
    ├── server/                  # @doodle/server — authoritative game engine
    │   ├── src/index.ts         #   Express + Socket.IO bootstrap, event wiring
    │   ├── src/store.ts         #   RoomStore: registry of live rooms
    │   ├── src/room.ts          #   Room: state machine, timers, scoring
    │   └── src/words.ts         #   server-only word dictionary
    │
    └── client/                  # @doodle/client — Vite + React UI
        ├── index.html
        ├── vite.config.ts       #   react + tailwind plugins, @→src alias
        ├── components.json      #   shadcn config
        └── src/
            ├── main.tsx         #   React root + Toaster
            ├── App.tsx          #   screen switch + animated backdrop
            ├── socket.ts        #   typed socket.io-client singleton
            ├── store.tsx        #   GameProvider context (all client state)
            ├── util.ts          #   stroke id helper
            ├── lib/utils.ts     #   cn() class merge
            ├── index.css        #   Tailwind theme tokens + animations
            └── components/
                ├── Home, GameRoom, PlayerList, Chat, Toolbar,
                │   Canvas, WordChoiceModal
                └── ui/          #   shadcn primitives (button, card, dialog, …)
```

### Why a `shared` package?

Both client and server import the **same** TypeScript interfaces for event
payloads. If you rename an event or change a payload field, **both sides fail to
compile** until they agree — eliminating an entire class of runtime
desync/typo bugs. The server is typed as
`Server<ClientToServerEvents, ServerToClientEvents, …>` and the client as
`Socket<ServerToClientEvents, ClientToServerEvents>` (note the inverted order:
what the server receives is what the client sends).

---

## 4. The data model (`shared/src/types.ts`)

```ts
type GamePhase = 'lobby' | 'choosing' | 'drawing' | 'round-end' | 'game-end';

interface Player {
  id: string;            // === socket.id (identity for the connection)
  userId: string | null; // reserved for future accounts
  name: string;
  avatarColor: string;
  score: number;
  isHost: boolean;
  isDrawing: boolean;
  hasGuessed: boolean;   // already guessed correctly this turn
  connected: boolean;
}

interface RoomSettings { rounds; drawTimeSeconds; maxPlayers; isPrivate; }

interface RoomState {    // the snapshot broadcast to clients
  code; phase; round; totalRounds;
  players: Player[];
  hostId;
  currentDrawerId: string | null;
  wordHint: string | null;   // masked "_ _ _" for guessers; full word at round-end
  timeRemaining;
  settings;
  spectatorCount;            // watch-only viewers (not in the player roster)
}

interface ChatMessage {  // type: 'chat' | 'guess' | 'correct' | 'system'
  id; playerId; playerName; text; type; timestamp;
}

interface Stroke {       // the unit of drawing transmitted over the wire
  id; tool: 'brush'|'eraser'|'fill'; color; width;
  points: { x: number; y: number }[];   // RELATIVE 0..1 coordinates
}
```

### Game constants (`shared/src/constants.ts`)

| Constant | Value | Meaning |
|---|---|---|
| `MIN_PLAYERS` | 2 | minimum to start |
| `MAX_PLAYERS` | 8 | room cap |
| `DEFAULT_ROUNDS` | 3 | |
| `DEFAULT_DRAW_TIME_SECONDS` | 80 | |
| `WORD_CHOICE_COUNT` | 3 | words offered to drawer |
| `WORD_CHOICE_TIME_SECONDS` | 15 | time to pick |
| `ROUND_END_DELAY_SECONDS` | 6 | reveal pause between turns |
| `CANVAS.WIDTH / HEIGHT` | 1000 × 600 | logical aspect ratio |
| `CANVAS.MIN/MAX_BRUSH` | 2 / 40 | brush width range |
| `ROOM_CODE_LENGTH` | 6 | |

---

## 5. The network contract (`shared/src/events.ts`)

### Client → Server

| Event | Payload | Purpose |
|---|---|---|
| `room:create` | `{ name, settings? }` + ack | create a room, returns `{ code }` |
| `room:join` | `{ name, code, spectate? }` + ack | join as player, or watch-only when `spectate` |
| `room:leave` | — | leave current room |
| `game:start` | ack | host starts/restarts the game |
| `word:choose` | `{ word }` | drawer picks one of three words |
| `chat:send` | `{ text }` | chat message **or** guess (server decides) |
| `draw:stroke` | `Stroke` | drawer emits a stroke segment |
| `draw:clear` | — | drawer clears the canvas |
| `ping` | `{ time }` | latency probe |

### Server → Client

| Event | Payload | Purpose |
|---|---|---|
| `room:state` | `RoomState` | authoritative snapshot (drives all rendering) |
| `room:catchup` | `Stroke[]` | replay current turn's strokes to a late joiner |
| `chat:message` | `ChatMessage` | chat / system / correct-guess line |
| `draw:stroke` | `Stroke` | relayed stroke from the drawer |
| `draw:clear` | — | wipe every canvas (turn transition / clear) |
| `timer:tick` | `{ timeRemaining }` | per-second countdown (cheaper than full state) |
| `word:choices` | `{ words }` | the three options — **drawer only** |
| `word:reveal` | `{ word }` | secret word — drawer at turn start, everyone at round-end |
| `game:error` | `{ message }` | surfaced as a toast |
| `pong` | `{ time }` | latency reply |

**Design note:** `room:state` carries everything needed to render, but two
high-frequency things are split into dedicated lightweight events:
`timer:tick` (once/second) and `draw:stroke` (many/second). This avoids
re-broadcasting the full player/room snapshot on every tick or pen movement.

---

## 6. Server internals

### 6.1 Bootstrap (`server/src/index.ts`)

1. Creates an Express app with `cors` (origin = `CLIENT_ORIGIN`, default
   `http://localhost:5173`) and a JSON body parser.
2. Exposes `GET /health` → `{ status, rooms, uptime }`.
3. Wraps Express in a Node `http` server and attaches a typed Socket.IO `Server`.
4. Instantiates one `RoomStore`.
5. On each `connection`, initializes `socket.data` (`userId`, `playerName`,
   `roomCode`) and registers all event handlers. Helper closures
   `currentRoom()`, `joinRoom()`, `leaveRoom()` capture the socket.
6. Listens on `PORT` (default `3000`).

Each socket automatically joins a Socket.IO **room** named after the game's room
code, so `io.to(code).emit(...)` fans out to exactly that lobby. A socket also
implicitly belongs to a room named after its own `socket.id`, which is how the
server targets a single player (e.g. `io.to(drawerId).emit('word:choices', …)`).

### 6.2 Room registry (`server/src/store.ts`)

`RoomStore` holds `Map<code, Room>`.

- **Code generation:** 6 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
  (ambiguous `0/O/1/I` removed), regenerated until unique.
- **Settings resolution:** clamps user input to safe ranges — `rounds` 1–10,
  `drawTimeSeconds` 20–180, `maxPlayers` 2–8.
- **`destroyIfEmpty(code)`** disposes timers and deletes the room once the last
  player leaves (the game is fully ephemeral — no database).

### 6.3 The game engine (`server/src/room.ts`)

A `Room` is a **state machine** that owns all authoritative state and drives the
loop with `setInterval` (1s ticks) + `setTimeout` (phase deadlines).

**Phase transitions:**

```
 lobby
   │  startGame()  (host, ≥2 players)
   ▼
 ┌────────────────────────── nextTurn() ◀───────────────┐
 │  choosing  ── word:choices to drawer (15s)            │
 │     │  chooseWord()  OR  15s timeout → auto-pick[0]   │
 │     ▼                                                 │
 │  drawing   ── word:reveal to drawer; draw time (80s)  │
 │     │  all guessers correct  OR  timer hits 0         │
 │     ▼                                                 │
 │  round-end ── word:reveal to ALL (6s pause)           │
 │     │                                                 │
 │     └── more turns this round? ──────────────────────┘
 │            all players drawn → round++  →  rounds exceeded?
 ▼
 game-end  ── winner announced; host can startGame() again
```

**Turn rotation:** at `startGame`, `drawOrder` snapshots the player ids. Each
**round** walks the whole `drawOrder` (every player draws once). `nextTurn`
advances an index, skips disconnected players, increments `round` at the
boundary, and ends the game when `round > settings.rounds`.

**Timers (`startCountdown`)** sets `timeRemaining`, fires `timer:tick` every
1000ms, and schedules the phase's `onDone` via `setTimeout`. `clearTimers`
cancels both — called on every transition and on `dispose()` to prevent leaks
and orphaned callbacks.

**Drawing relay (`addStroke`)** is guarded: only accepted when
`phase === 'drawing'` **and** the sender is `currentDrawerId`. Accepted strokes
are appended to `this.strokes` (the per-turn history) and broadcast with
`io.to(code).except(senderId)` — the sender already drew it locally, so echoing
back would double-draw.

**Late-join catch-up (`sendCatchup`)** replays `this.strokes` to a single newly
joined socket via `room:catchup`, so someone who joins mid-drawing sees the
picture so far.

### 6.4 Guessing & anti-cheat (`handleChat`)

This is the security-critical path. For every `chat:send`:

```
normalize(text) = lowercase, trim, collapse whitespace

isGuessingPhase = phase === 'drawing'
canGuess        = isGuessingPhase && sender !== drawer && !sender.hasGuessed

if (canGuess && normalize(text) === normalize(currentWord)):
      → acceptGuess()                      // correct!
else if (normalize(text) === normalize(currentWord)):
      → DROP silently                      // never echo the secret word
else:
      → broadcast as a normal chat message
```

Two guarantees:
1. **The secret word is never sent to guessers.** `RoomState.wordHint` is masked
   (`maskWord` → `_ _ _ _`, preserving spaces/hyphens). The full word only goes
   to the drawer (`word:reveal` at turn start) and to everyone at `round-end`.
2. **Exact-word chat is never echoed**, even from the drawer or someone who
   already guessed — preventing the answer leaking through the chat feed.

**Scoring (`acceptGuess`):**

```
ratio        = max(0, timeRemaining) / drawTimeSeconds   // 1.0 → 0.0
guesserPoints = 50 + round(ratio * 250)                  // 50–300, faster = more
guesser.score += guesserPoints
drawer.score  += 25                                      // bonus per correct guesser
```

When **every** connected non-drawer has guessed, the turn ends early
(`endTurn`). The correct guess is announced via a `chat:message` of type
`'correct'` (the word itself is not included in the broadcast).

### 6.5 Disconnect handling

`removePlayer` deletes the player, removes them from `drawOrder`, **reassigns the
host** if the host left, and — if the **drawer** left mid-turn — immediately ends
the turn so the game doesn't stall. The room is destroyed when it becomes empty.

---

## 7. Client internals

### 7.1 Socket singleton (`client/src/socket.ts`)

A single typed `io(SERVER_URL, { autoConnect: false, transports: ['websocket'] })`
instance. `SERVER_URL` comes from `VITE_SERVER_URL` (default
`http://localhost:3000`). Connection is opened once by the provider.

### 7.2 Central store (`client/src/store.tsx`)

`GameProvider` is a React context that is the **only** place that touches the
socket. On mount it `connect()`s and subscribes to every server event, mapping
them into React state:

| Server event | Client state effect |
|---|---|
| `connect` | `connected = true`, capture `myId = socket.id` |
| `room:state` | `room = state`; switches screen to the game |
| `chat:message` | append to `messages` (capped at 200) |
| `timer:tick` | patch `room.timeRemaining` (no full re-render of state) |
| `word:choices` | `wordChoices = words` (drawer's modal) |
| `word:reveal` | `revealedWord = word` |
| `draw:stroke` | push 1 stroke into `incomingStrokes`, bump `strokeVersion` |
| `room:catchup` | load stroke array, bump `strokeVersion` |
| `draw:clear` | bump `clearSignal` |
| `game:error` | `toast.error(message)` |

The provider exposes **action helpers** (`createRoom`, `joinRoom`, `leaveRoom`,
`startGame`, `chooseWord`, `sendChat`, `sendStroke`, `clearCanvas`) that just
`socket.emit(...)`. Components call these; they never import the socket directly.

**Why `strokeVersion` / `clearSignal` counters?** Drawing is imperative (drawn
onto a `<canvas>` via the 2D context), not declarative React. These monotonic
counters are the signal the Canvas effect watches to know "new strokes arrived"
or "clear now", without re-rendering the whole component tree per pen movement.

### 7.3 The Canvas (`client/src/components/Canvas.tsx`)

The most performance-sensitive component. Responsibilities:

1. **Local history** (`history.current: Stroke[]`) of every stroke drawn or
   received, so the canvas can be **repainted losslessly** on resize.
2. **DPR-aware sizing:** a `ResizeObserver` sets the backing store to
   `clientSize × devicePixelRatio` and repaints — crisp on retina, correct on
   resize.
3. **Relative-coordinate rendering:** strokes store points in `0..1`. When
   painting, each point is multiplied by the current canvas pixel size, and line
   width is scaled as `(stroke.width / CANVAS.WIDTH) × canvas.width`. This is the
   **dimension-independence** rule — a drawing made on a phone renders identically
   on a desktop.
4. **Input via Pointer Events** (`pointerdown/move/up`) which unify mouse **and**
   touch (`touch-action: none` disables scrolling-while-drawing). Coordinates are
   converted to relative `0..1` with `getBoundingClientRect` and clamped.
5. **Streaming strokes:** `pointerdown` emits a 1-point dot; each `pointermove`
   emits a 2-point segment `[lastPoint, currentPoint]` sharing a stroke `id`.
   Tiny segments = low latency for viewers. Eraser paints in white (the canvas
   background).
6. **Inbound application:** a `useEffect` keyed on `strokeVersion` paints any
   `incomingStrokes`; another keyed on `clearSignal` wipes history and repaints.

Only the drawer's canvas is interactive (`drawable` prop); guessers see a
read-only surface with a "watch & guess" hint.

### 7.4 UI composition

`App.tsx` renders an animated gradient-blob **backdrop** and switches between
`<Home/>` (no room) and `<GameRoom/>` (in a room). `GameRoom` is a 3-column grid:

```
┌──────────────────────── HUD (round · masked word · countdown ring) ─────────────────────┐
├───────────────┬──────────────────────────────────────────────┬──────────────────────────┤
│  PlayerList   │   Canvas + Toolbar (drawer only)               │   Chat & Guesses         │
│  (medals,     │   ── or Lobby / Scoreboard depending on phase  │   (system + correct +    │
│   scores,     │                                                │    normal messages)      │
│   drawing ●)  │   WordChoiceModal overlays during 'choosing'   │                          │
└───────────────┴──────────────────────────────────────────────┴──────────────────────────┘
```

Styling uses **Tailwind v4** with shadcn/ui primitives (`components/ui/*`). The
theme is defined in `index.css` via CSS custom properties (oklch colors) mapped
through `@theme inline`; a vibrant dark palette, Fredoka/Nunito fonts, and custom
keyframes (`float`, `pop-in`, `rise`, `shimmer`) provide the playful look.
Errors are surfaced through `sonner` toasts.

---

## 8. End-to-end flows (sequence)

### 8.1 Create a room

```
Host                         Server                         (others)
 │ room:create {name,settings} ─▶ RoomStore.create()
 │                               new Room, addPlayer(host)
 │ ◀── ack { code }
 │ ◀── room:state (lobby)        (host joins socket room `code`)
```

### 8.2 Join a room

```
Player                       Server
 │ room:join {name, code} ─────▶ validate exists & not full
 │ ◀── ack {ok} | {error}
 │ ◀── room:state              (broadcast to whole room)
 │ ◀── room:catchup            (only if a drawing is in progress)
```

### 8.3 A full turn

```
Host: game:start ──▶ Server.startGame() ─▶ nextTurn() → beginChoosing(drawer)
   broadcast room:state(choosing) + draw:clear
   to DRAWER only: word:choices {3 words}
   start 15s countdown → timer:tick ×15

Drawer: word:choose {word} ──▶ chooseWord()
   phase → drawing; broadcast room:state(drawing, wordHint="_ _ _")
   to DRAWER only: word:reveal {word}
   start 80s countdown → timer:tick ×80

Drawer: draw:stroke {…} ──▶ addStroke() ─▶ draw:stroke to everyone EXCEPT drawer
Guesser: chat:send {"apple"} ──▶ handleChat()
   match → acceptGuess(): score++, chat:message(correct), room:state
   (all guessers correct) → endTurn()

endTurn(): phase → round-end; word:reveal {word} to ALL; chat system line
   start 6s countdown → nextTurn()
```

### 8.4 Game end

```
nextTurn() detects round > settings.rounds
 ▶ endGame(): phase → game-end, announce winner (highest score)
 ▶ broadcast room:state(game-end)  →  client shows podium Scoreboard
 ▶ host may game:start again (scores reset, fresh drawOrder)
```

---

## 9. Coordinate system (dimension independence)

- All stroke points travel as **relative** `{ x, y } ∈ [0,1]`.
- The drawer converts pixel input → relative via
  `x = (clientX − rect.left) / rect.width` (clamped).
- Every receiver converts relative → its own pixels via `x × canvas.width`.
- Brush width scales as `width / 1000 × canvas.width`.

Result: absolute pixel sizes are **never** transmitted, so strokes look the same
on any screen aspect/size. (Plan constraint: *never distribute `0px→1920px`*.)

---

## 10. Build, run & verify

### Install & first build
```bash
npm install            # all workspaces
npm run build:shared   # compile the contract (server/client depend on dist/)
```

### Develop (both processes, watch mode)
```bash
npm run dev            # concurrently: server :3000  +  client :5173
# or individually:
npm run dev:server     # tsx watch  (Express + Socket.IO)
npm run dev:client     # vite dev server
```

### Quality gates
```bash
npm run typecheck      # tsc --noEmit across shared, server, client
npm run lint           # eslint
npm run build          # shared → server (tsc) → client (tsc + vite build)
```

### Configuration
- **Server** (`packages/server/.env`, see `.env.example`):
  `PORT` (3000), `CLIENT_ORIGIN` (`http://localhost:5173`).
- **Client:** `VITE_SERVER_URL` (`http://localhost:3000`).

### Manual verification
Open `http://localhost:5173` in two tabs → create a room in one, join with the
code in the other (2+ players required). The server's `/health` endpoint returns
live room count and uptime.

---

## 11. Security & invariants (anti-cheat)

| Invariant | Enforced where |
|---|---|
| Server owns scores, timers, turn order, validation | `room.ts` (clients only render) |
| Secret word never reaches guessers | `wordHint` masking + `word:reveal` targeting |
| Exact-word chat never echoed | `handleChat` silent-drop branch |
| Only the active drawer can draw / clear | `addStroke` / `clearCanvas` guards |
| Only the host can start the game | `startGame` requester check |
| Drawer can't "guess" their own word | `canGuess` excludes `currentDrawerId` |
| Coordinates are relative `0..1` only | client `toRelative` + render scaling |
| Canvas wiped on every transition | `draw:clear` at turn start & round end |
| Settings clamped to safe ranges | `RoomStore.resolveSettings` |

---

## 12. Social features (invite links · spectators · shareable results)

### Invite links
A room is shareable as a URL: `inviteLink(code)` (client `util.ts`) builds
`${origin}${pathname}?room=CODE`, and the spectator variant appends `&spectate=1`.
On load, `Home` reads these query params to pre-fill the join code and pre-select
the Play/Watch mode, so an invited user only types their name. The Lobby exposes
**Copy invite link** and **Copy spectator link** buttons (plus the raw code).

### Spectators (watch-only)
Spectators join with `room:join { spectate: true }`. On the server a `Room` keeps
a separate `spectators` Map, distinct from `players`:

- **Not bound by `maxPlayers`** — a full game can still be watched.
- **Excluded from** the roster, `drawOrder`, scoring, and turn rotation.
- **Receive all broadcasts** (they join the Socket.IO room) — `room:state`,
  `draw:stroke`, `timer:tick`, `chat:message` — and get `room:catchup` on join.
- **Can chat** (their name is suffixed `👀`) but **can never guess**: `handleChat`
  routes spectators down a branch that drops any message equal to the secret word
  and never scores. They also never receive `word:choices`/mid-turn `word:reveal`,
  so the answer never reaches them.

`RoomState.spectatorCount` surfaces the live viewer count (shown in the HUD and
Lobby). On disconnect, `leaveRoom` calls both `removeSpectator` and
`removePlayer` (a no-op for the role the socket isn't).

### Shareable final scoreboard image
`client/src/scoreImage.ts` renders the final standings to an off-screen
`<canvas>` (2× DPR) — gradient background, glows, medals, colored avatars,
winner highlight, footer — with **no extra dependency**. The Scoreboard offers:
- **Save image** → `downloadScoreboard()` (`canvas.toBlob` → object URL → `<a download>`).
- **Share** → `shareScoreboard()` uses the Web Share API with a PNG `File` when
  `navigator.canShare({ files })` is supported (mobile), else falls back to download.

---

## 13. Extension points

- **Persistence / accounts:** `Player.userId` is already reserved; add a DB layer
  behind `RoomStore` (the `.gitignore` even anticipates a Prisma db file).
- **Fill tool:** `Stroke.tool` includes `'fill'`; implement flood-fill on the
  client and it relays through the existing `draw:stroke` pipeline unchanged.
- **Public matchmaking:** `RoomSettings.isPrivate` exists; add a lobby browser
  that lists non-private rooms from `RoomStore`.
- **Hints:** progressively reveal letters in `wordHint` as `timeRemaining` drops.
- **Reconnect by token:** map `userId` → seat so a refresh rejoins the same slot.
