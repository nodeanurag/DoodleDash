import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@doodle/shared';

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Primary is Railway (fastest, lower latency), Fallback is Render (accessible in India without VPN)
const PRIMARY_URL = import.meta.env.VITE_SERVER_URL_PRIMARY ?? import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000';
const FALLBACK_URL = import.meta.env.VITE_SERVER_URL_FALLBACK ?? '';

export const socket: GameSocket = io(PRIMARY_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

function updateSocketUrl(urlString: string) {
  try {
    const url = new URL(urlString);
    socket.io.opts.hostname = url.hostname;
    socket.io.opts.port = url.port || (url.protocol === 'https:' ? '443' : '80');
    // Engine.io uses secure option for SSL/TLS
    (socket.io.opts as any).secure = url.protocol === 'https:';
    (socket.io as any).uri = urlString;
  } catch (err) {
    console.error('Failed to parse socket URL:', urlString, err);
  }
}

let isConnecting = false;

export function connectSocket() {
  if (socket.connected || isConnecting) return;
  isConnecting = true;

  // Always start by trying the primary URL
  updateSocketUrl(PRIMARY_URL);
  console.log(`🔌 Attempting to connect to primary server: ${PRIMARY_URL}`);
  socket.connect();

  if (!FALLBACK_URL) {
    isConnecting = false;
    return;
  }

  let fallbackTimeout: NodeJS.Timeout;

  const triggerFallback = () => {
    if (socket.connected) return;
    console.warn(`⚠️ Primary server failed to connect. Falling back to: ${FALLBACK_URL}`);
    
    socket.disconnect();
    updateSocketUrl(FALLBACK_URL);
    socket.connect();
    isConnecting = false;
  };

  // If connection fails, immediately try fallback
  socket.once('connect_error', (err) => {
    console.error('❌ Primary connection error:', err.message);
    clearTimeout(fallbackTimeout);
    triggerFallback();
  });

  // If it hangs for more than 3 seconds (e.g. ISP DNS block), trigger fallback
  fallbackTimeout = setTimeout(() => {
    if (!socket.connected) {
      console.warn('🕒 Primary connection timed out (3s limit reached).');
      triggerFallback();
    }
  }, 3000);

  // Clear timeout if successfully connected
  socket.once('connect', () => {
    clearTimeout(fallbackTimeout);
    console.log('✅ Connected successfully to server!');
    isConnecting = false;
  });
}

