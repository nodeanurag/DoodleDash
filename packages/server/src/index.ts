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
