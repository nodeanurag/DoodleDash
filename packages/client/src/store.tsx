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
import { socket } from './socket';

export type Screen = 'home' | 'game';

export interface GameContextValue {
  connected: boolean;
  screen: Screen;
  myId: string;
  spectating: boolean;
  room: RoomState | null;
  messages: ChatMessage[];
  wordChoices: string[] | null;
  revealedWord: string | null;
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
    socket.connect();

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

    const onGlobalPlayers = ({ count }: { count: number }) => setGlobalPlayerCount(count);
    const onError = ({ message }: { message: string }) => toast.error(message);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:state', onState);
    socket.on('chat:message', onChat);
    socket.on('timer:tick', onTick);
    socket.on('word:choices', onChoices);
    socket.on('word:reveal', onReveal);
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
      socket.off('online-players:count', onGlobalPlayers);
      socket.off('game:error', onError);
      socket.disconnect();
    };
  }, []);

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

  // Placeholders for canvas actions to be added in next commit
  const sendStroke = useCallback((stroke: Stroke) => {}, []);
  const clearCanvas = useCallback(() => {}, []);
  const undoStroke = useCallback((id: string) => {}, []);
  const undo = useCallback(() => {}, []);
  const redo = useCallback(() => {}, []);

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
      canUndo: false,
      canRedo: false,
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
