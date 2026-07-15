import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import type { ChatMessage, RoomSettings, RoomState, Stroke } from '@doodle/shared';
import { socket, connectSocket } from './socket';

export type Screen = 'home' | 'game';

export interface GameContextValue {
  connected: boolean;
  screen: Screen;
  myId: string;
  /** True when this client joined as a watch-only spectator. */
  spectating: boolean;
  room: RoomState | null;
  messages: ChatMessage[];
  /** Words offered to us when it's our turn to draw (drawer only). */
  wordChoices: string[] | null;
  /** The secret word, known to us only when we're the drawer or at round end. */
  revealedWord: string | null;
  /** Strokes to replay onto a freshly mounted canvas (catch-up / clear). */
  incomingStrokes: Stroke[];
  strokeVersion: number;
  clearSignal: number;
  globalPlayerCount: number;
  undoSignal: { id: string } | null;

  createRoom: (name: string, avatarColor?: string, avatarUrl?: string, settings?: Partial<RoomSettings>) => void;
  joinRoom: (name: string, code: string, avatarColor?: string, avatarUrl?: string, spectate?: boolean) => void;
  leaveRoom: () => void;
  startGame: () => void;
  chooseWord: (word: string) => void;
  sendChat: (text: string) => void;
  sendStroke: (stroke: Stroke) => void;
  clearCanvas: () => void;
  undoStroke: (id: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [myId, setMyId] = useState('');
  const [spectating, setSpectating] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [wordChoices, setWordChoices] = useState<string[] | null>(null);
  const [revealedWord, setRevealedWord] = useState<string | null>(null);

  const [incomingStrokes, setIncomingStrokes] = useState<Stroke[]>([]);
  const [strokeVersion, setStrokeVersion] = useState(0);
  const [clearSignal, setClearSignal] = useState(0);
  const [globalPlayerCount, setGlobalPlayerCount] = useState(1);
  const [undoSignal, setUndoSignal] = useState<{ id: string } | null>(null);
  const [myStrokes, setMyStrokes] = useState<Stroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<Stroke[]>([]);
  const pendingName = useRef<string>('');

  useEffect(() => {
    connectSocket();

    const onConnect = () => {
      setConnected(true);
      setMyId(socket.id ?? '');
    };
    const onDisconnect = () => setConnected(false);

    const onState = (state: RoomState) => {
      setRoom(state);
      setScreen('game');
      if (state.phase === 'lobby' || state.phase === 'choosing' || state.phase === 'game-end') {
        if (state.phase !== 'choosing') setRevealedWord(null);
        setMyStrokes([]);
        setUndoneStrokes([]);
      }
    };
    const onChat = (m: ChatMessage) => setMessages((prev) => [...prev.slice(-199), m]);
    const onTick = ({ timeRemaining }: { timeRemaining: number }) =>
      setRoom((prev) => (prev ? { ...prev, timeRemaining } : prev));
    const onChoices = ({ words }: { words: string[] }) => setWordChoices(words);
    const onReveal = ({ word }: { word: string }) => {
      setRevealedWord(word);
      setWordChoices(null);
    };
    const onStroke = (stroke: Stroke) => {
      setIncomingStrokes([stroke]);
      setStrokeVersion((v) => v + 1);
    };
    const onCatchup = (strokes: Stroke[]) => {
      setIncomingStrokes(strokes);
      setStrokeVersion((v) => v + 1);
    };
    const onClear = () => {
      setClearSignal((v) => v + 1);
      setMyStrokes([]);
      setUndoneStrokes([]);
    };
    const onUndo = ({ id }: { id: string }) => {
      setUndoSignal({ id });
      setMyStrokes((prev) => prev.filter((s) => s.id !== id));
      setUndoneStrokes((prev) => prev.filter((s) => s.id !== id));
    };
    const onGlobalPlayers = ({ count }: { count: number }) => setGlobalPlayerCount(count);
    const onError = ({ message }: { message: string }) => toast.error(message);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:state', onState);
    socket.on('chat:message', onChat);
    socket.on('timer:tick', onTick);
    socket.on('word:choices', onChoices);
    socket.on('word:reveal', onReveal);
    socket.on('draw:stroke', onStroke);
    socket.on('room:catchup', onCatchup);
    socket.on('draw:clear', onClear);
    socket.on('draw:undo', onUndo);
    socket.on('online-players:count', onGlobalPlayers);
    socket.on('game:error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room:state', onState);
      socket.off('chat:message', onChat);
      socket.off('timer:tick', onTick);
      socket.off('word:choices', onChoices);
      socket.off('word:reveal', onReveal);
      socket.off('draw:stroke', onStroke);
      socket.off('room:catchup', onCatchup);
      socket.off('draw:clear', onClear);
      socket.off('draw:undo', onUndo);
      socket.off('online-players:count', onGlobalPlayers);
      socket.off('game:error', onError);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (room?.phase === 'choosing' && room.currentDrawerId !== myId) {
      setRevealedWord(null);
      setWordChoices(null);
    }
  }, [room?.phase, room?.currentDrawerId, myId]);

  const resetToHome = useCallback(() => {
    setScreen('home');
    setRoom(null);
    setMessages([]);
    setWordChoices(null);
    setRevealedWord(null);
    setSpectating(false);
  }, []);

  const createRoom = useCallback((name: string, avatarColor?: string, avatarUrl?: string, settings?: Partial<RoomSettings>) => {
    pendingName.current = name;
    setSpectating(false);
    socket.emit('room:create', { name, avatarColor, avatarUrl, settings }, (res) => {
      if ('error' in res) toast.error(res.error);
    });
  }, []);

  const joinRoom = useCallback((name: string, code: string, avatarColor?: string, avatarUrl?: string, spectate = false) => {
    pendingName.current = name;
    setSpectating(spectate);
    socket.emit('room:join', { name, code: code.toUpperCase(), avatarColor, avatarUrl, spectate }, (res) => {
      if ('error' in res) {
        toast.error(res.error);
        setSpectating(false);
      }
    });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave');
    resetToHome();
  }, [resetToHome]);

  const startGame = useCallback(() => {
    socket.emit('game:start', (res) => {
      if (res && 'error' in res) toast.error(res.error);
    });
  }, []);

  const chooseWord = useCallback((word: string) => {
    socket.emit('word:choose', { word });
    setWordChoices(null);
  }, []);

  const sendChat = useCallback((text: string) => socket.emit('chat:send', { text }), []);

  const sendStroke = useCallback((stroke: Stroke) => {
    socket.emit('draw:stroke', stroke);
    setMyStrokes((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.id === stroke.id) {
        return [...prev.slice(0, -1), stroke];
      } else {
        setUndoneStrokes([]);
        return [...prev, stroke];
      }
    });
  }, []);

  const clearCanvas = useCallback(() => {
    socket.emit('draw:clear');
    setMyStrokes([]);
    setUndoneStrokes([]);
  }, []);

  const undoStroke = useCallback((id: string) => {
    socket.emit('draw:undo', { id });
  }, []);

  const undo = useCallback(() => {
    if (myStrokes.length === 0) return;
    const popped = myStrokes[myStrokes.length - 1];
    setMyStrokes((prev) => prev.slice(0, -1));
    setUndoneStrokes((prev) => [...prev, popped]);
    socket.emit('draw:undo', { id: popped.id });
  }, [myStrokes]);

  const redo = useCallback(() => {
    if (undoneStrokes.length === 0) return;
    const popped = undoneStrokes[undoneStrokes.length - 1];
    setUndoneStrokes((prev) => prev.slice(0, -1));
    setMyStrokes((prev) => [...prev, popped]);
    socket.emit('draw:stroke', popped);
  }, [undoneStrokes]);

  const value = useMemo<GameContextValue>(
    () => ({
      connected,
      screen,
      myId,
      spectating,
      room,
      messages,
      wordChoices,
      revealedWord,
      incomingStrokes,
      strokeVersion,
      clearSignal,
      globalPlayerCount,
      undoSignal,
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      chooseWord,
      sendChat,
      sendStroke,
      clearCanvas,
      undoStroke,
      canUndo: myStrokes.length > 0,
      canRedo: undoneStrokes.length > 0,
      undo,
      redo,
    }),
    [
      connected,
      screen,
      myId,
      spectating,
      room,
      messages,
      wordChoices,
      revealedWord,
      incomingStrokes,
      strokeVersion,
      clearSignal,
      globalPlayerCount,
      undoSignal,
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      chooseWord,
      sendChat,
      sendStroke,
      clearCanvas,
      undoStroke,
      myStrokes,
      undoneStrokes,
      undo,
      redo,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within <GameProvider>');
  return ctx;
}
