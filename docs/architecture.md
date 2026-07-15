# DoodleDash Architecture Documentation

DoodleDash is a real-time, multiplayer drawing and guessing party game designed with a server-authoritative state machine, strict input verification, and low-latency canvas synchronization.

---

## 1. System Overview
The system relies on a client-server architecture using WebSockets for real-time, bidirectional messaging:
```
  [ React Client ] 
        ↕ (WebSockets / Socket.IO)
  [ Authoritative Node.js Game Server ]
```
* **Client (React + Vite)**: Renders the interface based strictly on state broadcasts received from the server. Maintains local canvas history to render points. Offloads pixel fill computation to a Web Worker thread.
* **Server (Node.js + Express + Socket.IO)**: Serves as the authoritative source of truth. Owns room configuration, timers, word databases, canvas coordinate states, and game states.

---

## 2. Server-Authoritative State Machine
The game loop transitions through five stages managed entirely by the server:
`lobby → choosing → drawing → round-end → game-end`

* **lobby**: Default phase. Players join, customize profiles, and host settings. Transitions when the host triggers `game:start` with at least 2 connected players.
* **choosing**: The current drawer is offered 3 secret word choices. A 15-second timer runs. Auto-selects the first choice if the drawer exceeds the timer.
* **drawing**: The drawer paints. Other players guess. A 60-second drawing countdown runs. Ends early if all active players guess correctly.
* **round-end**: Reveals the secret word, broadcasts final scores, and holds for 6 seconds before advancing the turn.
* **game-end**: Triggered when all players have drawn once per round. Displays final podium standings.

---

## 3. Real-Time Event Protocol
The network protocol enforces type safety and schema validation:
* **Client-to-Server**: Client emissions (`chat:send`, `draw:stroke`, etc.) are intercepted, rate-limited, and schema-validated before executing any game mechanics.
* **Server-to-Client**: The server broadcasts room snapshots (`room:state`) and incremental drawings (`draw:stroke`, `draw:clear`, `draw:undo`) to clients.

---

## 4. Drawing Synchronization
To maintain coordinate precision across diverse screen resolutions:
* **Relative Coordinates**: Points are mapped to a logical $1000 \times 600$ coordinate grid. Coordinates are sent as floating-point decimals normalized between $0.0$ and $1.0$.
* **DPR-Aware Rendering**: Bounded canvas containers scale their internal bitmap relative to `window.devicePixelRatio` while styling bounds remain fixed, ensuring crisp lines on Retina/High-DPI displays.
* **Bounded Stroke History**: The server restricts active turn drawing history to a maximum of `2000` strokes. Points per stroke are constrained to `256` to prevent unbounded memory growth.

---

## 5. Security & Protection Boundaries

### A. Zod Payload Validation
A strict validation layer (`socketSchemas.ts`) parses and sanitizes all incoming payloads:
* **Player Names**: Trimmed string, $1 \le \text{length} \le 24$.
* **Room Codes**: Uppercase normalized, length of 6, restricted to non-ambiguous alphabet characters (`A-Z`, `2-9`).
* **Chat Messages**: Trimmed string, $1 \le \text{length} \le 200$. Empty guesses are dropped.
* **Draw Strokes**: Validates stroke ID, brush width ($2 \le w \le 40$), color hex codes, and caps points per array at `256`. Coordinates must reside within $0 \le x, y \le 1$.

### B. Drawer Authorization Guards
Drawing operations (`draw:stroke`, `draw:clear`, `draw:undo`) require verification:
1. Room must exist in memory.
2. Game must be in the `drawing` phase.
3. Socket ID must match the room's current `drawerId` player record.
4. Sockets registered as spectators are denied drawing privileges.

### C. Game Stage Validation
* **Word choice**: Receivers verify chosen words exist in the server-picked choices, rejecting forged payloads. Choices are cleared from memory once chosen or auto-selected.
* **Undo validation**: Sockets can only undo strokes belonging to the current active turn. Wipes turn history from previous rounds.

### D. Throttling & Point Throughput
* **Socket Event Rate Limiting**: sliding window rate limiter tracking events per socket ID:
  * `draw:stroke` ➔ 120/sec
  * `chat:send` ➔ 5 per 3s
  * `room:create` ➔ 3/min
  * `room:join` ➔ 10/min
  * `draw:undo` ➔ 20 per 10s
* **Point Throughput Budget**: Caps accepted coordinate point counts to a maximum of **5000 points/second** per socket.

---

## 6. Room Lifecycle & Garbage Collection
To prevent lingering connections and memory leaks:
* **Meaningful Activity**: Room activity timestamps are updated only when valid, authorized, and rate-compliant actions are executed. Unvalidated, blocked, or tick events do not prolong room lifetimes.
* **Empty Room Grace Period**: When the last player leaves, the server starts a **10-second** grace timer. If no player reconnects, the room is disposed.
* **Lobby TTL**: Lobbies with no game started expire and are deleted after **10 minutes** of inactivity.
* **Abandoned Game TTL**: Active rooms with no valid game events are disposed after **30 minutes** of inactivity.
* **Idempotent Disposal**: `room.dispose()` clears all active intervals/timeouts, word choices, arrays, and players securely.

---

## 7. Scaling & Redis Integration Model

### A. Current Scaling Model
The default deployment runs as a single, authoritative Node.js process using `InMemoryRoomStore` to persist room and game state structures in Node's memory heap.

### B. Redis coordination (Cross-Instance Broadcasting)
When configured with `REDIS_URL`, DoodleDash runs the Socket.IO Redis Adapter. This allows horizontal scaling of Node instances behind a load balancer by facilitating socket message transmission across different instances.

> [!WARNING]
> **State Distribution Limitation:**
> The Socket.IO Redis adapter only coordinates message propagation across instances. It **does not** distribute mutable Room object states or in-memory game loops across nodes.

### C. Future Scaling Strategy
To distribute state authoritatively across multiple nodes, the architecture can evolve toward:
1. **Sticky Room Routing**: Directing all socket connections containing a specific room code to the specific Node instance hosting that room.
2. **Room Ownership Orchestration**: Dynamically mapping room ownership to specific Node instances, routing traffic through a gateway proxy.
3. **Database-Backed State**: Transitioning the room state machine into Redis Hash structures or a shared PostgreSQL database, managing updates with distributed concurrency locks.

---

## 8. Canvas Snapshot Compaction (Future Optimization)
In the future, the catch-up pipeline can be optimized by having the drawing client post WebP canvas snapshots to the server after a threshold (e.g. 50 strokes). The server will then store the raster background image and clear the historical vectors, sending this baseline along with incremental strokes to late joiners. 

*Note: This iteration does not trust client-generated snapshots as authoritative canvas state to prevent client forgery of draw results.*
