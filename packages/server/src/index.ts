import { createServer } from 'node:http';
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@doodle/shared';
import { RoomManager } from './store.js';
import {
  validateSocketPayload,
  RoomCreateSchema,
  RoomJoinSchema,
  WordChooseSchema,
  ChatSendSchema,
  DrawStrokeSchema,
  DrawUndoSchema,
  PingSchema
} from './validation/socketSchemas.js';
import { socketRateLimiter, pointBudget } from './security/socketRateLimiter.js';

const PORT = Number(process.env.PORT ?? 3000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
});

const store = new RoomManager(io);

app.get('/health', (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    rooms: store.count,
    players: store.totalPlayerCount,
    spectators: store.totalSpectatorCount,
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
    },
    nodeVersion: process.version,
  });
});

io.on('connection', (socket) => {
  socket.data.userId = null;
  socket.data.playerName = '';
  socket.data.roomCode = null;

  io.emit('online-players:count', { count: io.engine.clientsCount });

  socket.on('room:create', (payload, ack) => {
    if (!socketRateLimiter.allow(socket.id, 'room:create')) {
      return ack({ error: 'Create room rate limit exceeded. Please wait.' });
    }

    const parsed = validateSocketPayload(RoomCreateSchema, payload);
    if (!parsed.success) {
      return ack({ error: parsed.error });
    }
    const { name, avatarColor, avatarUrl, settings } = parsed.data;
    const room = store.create(settings);
    joinRoom(room.code, name, avatarColor, avatarUrl);
    room.markActivity();
    ack({ code: room.code });
  });

  socket.on('room:join', (payload, ack) => {
    if (!socketRateLimiter.allow(socket.id, 'room:join')) {
      return ack({ error: 'Join room rate limit exceeded. Please wait.' });
    }

    const parsed = validateSocketPayload(RoomJoinSchema, payload);
    if (!parsed.success) {
      return ack({ error: parsed.error });
    }
    const { name, code, avatarColor, avatarUrl, spectate } = parsed.data;
    const room = store.get(code);
    if (!room) return ack({ error: 'Room not found.' });
    // Spectators are not bound by the player cap — only players are.
    if (!spectate && room.playerCount >= room.toState().settings.maxPlayers)
      return ack({ error: 'Room is full. Try joining as a spectator.' });
    joinRoom(room.code, name, avatarColor, avatarUrl, Boolean(spectate));
    room.markActivity();
    ack({ ok: true });
  });

  socket.on('room:leave', () => {
    leaveRoom();
  });

  socket.on('game:start', (ack) => {
    const room = currentRoom();
    if (!room) return ack?.({ error: 'Not in a room.' });

    // Permissions: Requester belongs to the room and is the host
    const state = room.toState();
    const player = state.players.find(p => p.id === socket.id);
    if (!player || !player.isHost || state.hostId !== socket.id) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Unauthorized Action] Socket ${socket.id} attempted to start game in Room ${room.code}`);
      }
      return ack?.({ error: 'Only the host can start the game.' });
    }

    const result = room.startGame(socket.id);
    if ('ok' in result && result.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Game Started] Room ${room.code} by host ${socket.id}`);
      }
      room.markActivity();
    }
    ack?.(result);
  });

  socket.on('word:choose', (payload) => {
    if (!socketRateLimiter.allow(socket.id, 'word:choose')) return;

    const parsed = validateSocketPayload(WordChooseSchema, payload);
    if (!parsed.success) {
      socket.emit('game:error', { message: 'Invalid word choice payload.' });
      return;
    }
    const { word } = parsed.data;
    const room = currentRoom();
    if (!room) return;

    // Permissions: room is in choosing phase and socket is drawer
    const state = room.toState();
    if (room.toState().phase !== 'choosing' || socket.id !== state.currentDrawerId) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Unauthorized Action] Socket ${socket.id} attempted to choose word in Room ${room.code}`);
      }
      return;
    }

    room.chooseWord(socket.id, word);
    room.markActivity();
  });

  socket.on('chat:send', (payload) => {
    if (!socketRateLimiter.allow(socket.id, 'chat:send')) {
      socket.emit('game:error', { message: 'Spam detected. Chat rate limit exceeded.' });
      return;
    }

    const parsed = validateSocketPayload(ChatSendSchema, payload);
    if (!parsed.success) {
      socket.emit('game:error', { message: parsed.error });
      return;
    }
    const { text } = parsed.data;
    const room = currentRoom();
    if (room) {
      room.handleChat(socket.id, text);
      room.markActivity();
    }
  });

  function currentRoom() {
    return socket.data.roomCode ? store.get(socket.data.roomCode) : undefined;
  }

  function joinRoom(code: string, name: string, avatarColor?: string, avatarUrl?: string, spectate = false) {
    leaveRoom();
    const room = store.get(code);
    if (!room) {
      socket.emit('game:error', { message: 'Room no longer exists.' });
      return;
    }
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerName = name;
    if (spectate) room.addSpectator(socket.id, name);
    else room.addPlayer(socket.id, name, avatarColor, avatarUrl);
    room.broadcastState();
    room.sendCatchup(socket.id); // replay in-progress drawing for late joiners
  }

  function leaveRoom() {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = store.get(code);
    socket.leave(code);
    socket.data.roomCode = null;
    if (room) {
      // A socket is either a player or a spectator; these are no-ops for the
      // role it isn't.
      room.removeSpectator(socket.id);
      room.removePlayer(socket.id);
      store.destroyIfEmpty(code);
    }
  }
});

httpServer.listen(PORT, () => {
  console.log(`🎨 DoodleDash server listening on http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   Accepting client origin: ${CLIENT_ORIGIN}`);
});
