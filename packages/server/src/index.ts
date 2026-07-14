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

httpServer.listen(PORT, () => {
  console.log(`🎨 DoodleDash server listening on http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   Accepting client origin: ${CLIENT_ORIGIN}`);
});
