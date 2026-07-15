import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  LuTimer,
  LuLogOut,
  LuCopy,
  LuPlay,
  LuUsers,
  LuEye,
  LuLink,
  LuCheck,
  LuSettings,
  LuMessageSquare,
} from 'react-icons/lu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GAME } from '@doodle/shared';
import { toast } from 'sonner';
import { useGame } from '../store';
import { cn } from '@/lib/utils';
import { inviteLink } from '../util';
import { downloadScoreboard } from '../scoreImage';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Canvas } from './Canvas';
import { Chat } from './Chat';
import { Leaderboard } from './Leaderboard';
import { Toolbar, type ToolState } from './Toolbar';
import { WordChoiceModal } from './WordChoiceModal';
import { FinalScoreboard } from './FinalScoreboard';

export function GameRoom() {
  const { room, myId, leaveRoom, startGame, spectating } = useGame();
  const [tool, setTool] = useState<ToolState>({ tool: 'brush', color: '#000000', width: 8, opacity: 100 });
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'players'>('chat');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!room) return;
    if (room.phase === 'game-end') {
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } });
      }, 250);
      
      return () => clearInterval(interval);
    } else if (room.phase === 'round-end') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [room?.phase]);

  if (!room) return null;

  if (room.phase === 'game-end') {
    const onDownload = () => {
      downloadScoreboard(room)
        .then(() => toast.success('Scoreboard saved!'))
        .catch(() => toast.error('Could not generate image'));
    };
    return (
      <FinalScoreboard
        room={room}
        myId={myId}
        spectating={spectating}
        leaveRoom={leaveRoom}
        startGame={startGame}
        onDownload={onDownload}
      />
    );
  }

  const amDrawer = room.currentDrawerId === myId;
  const drawable = room.phase === 'drawing' && amDrawer;
  const inLobby = room.phase === 'lobby';

  return (
    <div className="relative flex h-full flex-col gap-3 p-3 overflow-hidden">
      <Hud onLeave={leaveRoom} onOpenSettings={() => setShowSettings(true)} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 md:grid md:grid-cols-[250px_1fr_320px]">
        <div className="hidden md:flex min-h-0 flex-col">
          <Leaderboard onOpenSettings={() => setShowSettings(true)} />
        </div>

        <main className="flex min-h-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col gap-2.5 md:min-h-0 md:flex-1">
            {inLobby ? (
              <Lobby />
            ) : (
              <>
                {(() => {
                  const alphaHex = Math.round(((tool.opacity ?? 100) / 100) * 255).toString(16).padStart(2, '0');
                  const canvasColor = tool.color + alphaHex;
                  return (
                    <Canvas drawable={drawable} tool={tool.tool} color={canvasColor} width={tool.width} />
                  );
                })()}
                {drawable && <Toolbar state={tool} onChange={setTool} />}
              </>
            )}
          </div>

          <div className="md:hidden flex flex-col flex-1 min-h-0 mt-1.5 gap-2">
            <div className="flex gap-2 bg-secondary/40 border border-border/40 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveMobileTab('chat')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                  activeMobileTab === 'chat'
                    ? 'bg-background text-foreground shadow-xs ring-1 ring-border/10'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <LuMessageSquare className="size-3.5 text-game-purple shrink-0" /> Chat &amp; Guesses
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileTab('players')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                  activeMobileTab === 'players'
                    ? 'bg-background text-foreground shadow-xs ring-1 ring-border/10'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <LuUsers className="size-3.5 text-primary shrink-0" /> Players ({room.players.length})
              </button>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              {activeMobileTab === 'chat' ? <Chat /> : <Leaderboard onOpenSettings={() => setShowSettings(true)} />}
            </div>
          </div>
        </main>

        <div className="hidden md:flex min-h-0 flex-col">
          <Chat />
        </div>
      </div>

      <WordChoiceModal />

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md rounded-modal bg-background border-border/80 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gradient flex items-center gap-2">
              <LuSettings className="text-game-purple animate-wiggle" /> Game Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Sound Effects Volume</label>
              <Slider defaultValue={[80]} max={100} step={1} className="cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Graphics Preset</label>
              <Select defaultValue="high">
                <SelectTrigger className="h-10 rounded-input bg-secondary/30 border-border/80 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Fastest)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 border-t border-border/40 pt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Game Version</span>
                <span className="font-mono">v0.1.0-redesign</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Server Status</span>
                <span className="text-green-500 font-bold">Connected (WS)</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Hud({ onLeave, onOpenSettings }: { onLeave: () => void; onOpenSettings: () => void }) {
  const { room, myId } = useGame();
  if (!room) return null;

  const drawer = room.players.find((p) => p.id === room.currentDrawerId);
  const amDrawer = room.currentDrawerId === myId;
  const showTimer =
    room.phase === 'drawing' || room.phase === 'choosing' || room.phase === 'round-end';
  const total =
    room.phase === 'choosing' ? GAME.WORD_CHOICE_TIME_SECONDS : room.settings.drawTimeSeconds;
  
  const pct = showTimer && room.timeRemaining > 0 ? room.timeRemaining / total : 0;

  return (
    <Card className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 relative overflow-hidden shrink-0 bg-white border-2 border-[#252525] rounded-[18px] md:rounded-[20px] shadow-[3px_4px_0_rgba(37,37,37,0.08)]">
      {showTimer && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-yellow-500 transition-all duration-1000"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      )}
      <div className="flex items-center gap-1.5 md:gap-2">
        <RoundTracker current={room.round} total={room.totalRounds} />
      </div>

      <div className="text-center">
        {room.phase === 'drawing' && room.wordHint && (
          <div className="font-display text-base md:text-2xl font-semibold tracking-[0.2em] md:tracking-[0.35em]">
            {amDrawer ? '' : room.wordHint}
          </div>
        )}
        {room.phase === 'choosing' && (
          <div className="text-muted-foreground text-xs md:text-base truncate max-w-[90px] xs:max-w-[120px] md:max-w-none">
            <span className="text-foreground font-semibold">{drawer?.name}</span> is choosing…
          </div>
        )}
        {room.phase === 'round-end' && (
          <Badge className="font-display animate-pop-in text-xs md:text-sm">Round over!</Badge>
        )}
      </div>

      <div className="flex items-center justify-end gap-1 md:gap-2">
        <RoomCodeBadge code={room.code} />
        {room.spectatorCount > 0 && (
          <Badge variant="secondary" className="gap-1 px-1.5 py-0.5 text-[10px] md:text-xs" title="Spectators watching">
            <LuEye className="size-3 md:size-3.5" /> {room.spectatorCount}
          </Badge>
        )}
        {showTimer && <Timer seconds={room.timeRemaining} total={total} />}
        <Button variant="ghost" size="icon" className="size-8 md:size-10" title="Settings" onClick={onOpenSettings}>
          <LuSettings className="size-4 md:size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8 md:size-10" title="Leave room" onClick={onLeave}>
          <LuLogOut className="size-4 md:size-5" />
        </Button>
      </div>
    </Card>
  );
}

function RoundTracker({ current, total }: { current: number; total: number }) {
  const dots = [];
  for (let i = 1; i <= total; i++) {
    dots.push(i);
  }
  return (
    <div className="flex flex-col items-center sm:items-start gap-1 shrink-0">
      <div className="flex items-center gap-0.5 sm:gap-1">
        {dots.map((d, index) => (
          <div key={d} className="flex items-center">
            <span
              className={cn(
                "size-2 md:size-2.5 rounded-full transition-all duration-300",
                d <= current 
                  ? "bg-game-purple scale-110 shadow-sm shadow-game-purple/50" 
                  : "bg-muted-foreground/30"
              )}
            />
            {index < dots.length - 1 && (
              <span
                className={cn(
                  "h-[1px] md:h-0.5 w-2 sm:w-4 md:w-6 transition-all duration-300",
                  d < current ? "bg-game-purple" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <p className="font-display text-[9px] md:text-xs font-bold text-muted-foreground leading-none">
        Round {Math.max(1, current)} of {total}
      </p>
    </div>
  );
}

function RoomCodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code)
      .then(() => {
        setCopied(true);
        toast.success("Room code copied!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Copy failed"));
  };

  return (
    <button
      onClick={copy}
      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border bg-secondary/50 hover:bg-secondary border-border/60 text-[10px] md:text-xs font-bold font-display shadow-2xs hover:scale-102 transition-all cursor-pointer group active:scale-98 shrink-0"
      title="Click to copy room code"
    >
      {copied ? (
        <LuCheck className="size-3 text-green-500 shrink-0" />
      ) : (
        <LuCopy className="size-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      )}
      <span className="text-foreground tracking-wider font-semibold">{code}</span>
    </button>
  );
}

function Timer({ seconds, total }: { seconds: number; total: number }) {
  const urgent = seconds <= 10;
  const pct = Math.max(0, Math.min(1, seconds / total));
  
  // Color shifts from Green -> Yellow -> Orange -> Red
  const ringColor = pct > 0.6 
    ? '#22C55E' // Green #22C55E
    : pct > 0.4
      ? '#FACC15' // Yellow #FACC15
      : pct > 0.2
        ? '#FB923C' // Orange #FB923C
        : '#ef4444'; // Red #ef4444

  return (
    <div
      className={cn(
        'relative grid size-10 md:size-12 place-items-center shrink-0 transition-all duration-300',
        urgent && 'animate-pulse scale-105'
      )}
      style={{
        background: `conic-gradient(${ringColor} ${pct * 360}deg, oklch(0 0 0 / 12%) 0deg)`,
        borderRadius: '999px',
      }}
    >
      <span className="bg-card absolute inset-0.5 md:inset-1 rounded-full" />
      <span
        className={cn(
          'relative flex items-center gap-0.5 text-xs md:text-sm font-bold tabular-nums',
          urgent && 'text-destructive',
        )}
      >
        {seconds <= 10 ? <LuTimer className="size-3 md:size-3.5 animate-bounce" /> : null}
        {seconds}
      </span>
    </div>
  );
}

function LobbyIllustration() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 animate-wiggle select-none max-w-[200px] my-2">
      <svg viewBox="0 0 100 100" className="size-20 text-primary fill-transparent stroke-current stroke-[3] stroke-linecap-round stroke-linejoin-round">
        <path d="M40,75 L60,75 L60,85 C60,90 40,90 40,85 Z" />
        <path d="M40,25 L60,25 L60,75 L40,75 Z" />
        <path d="M50,10 C50,10 60,20 60,25 L40,25 C40,20 50,10 50,10 Z" className="fill-primary/20 text-primary" />
        <circle cx="45" cy="45" r="3" className="fill-current" />
        <circle cx="55" cy="45" r="3" className="fill-current" />
        <path d="M48,55 Q51,58 54,55" />
        <path d="M30,55 C20,55 20,40 30,45" />
        <path d="M70,55 C80,55 80,40 70,45" />
      </svg>
      <div className="relative bg-secondary/80 border border-border/80 rounded-2xl px-3 py-1.5 text-[10px] font-bold text-foreground max-w-[150px] shadow-3xs">
        Waiting for more artists...
        <div className="absolute -top-1 w-2 h-2 bg-secondary border-t border-l border-border/80 rotate-45 left-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}

function Lobby() {
  const { room, myId, startGame, spectating } = useGame();
  if (!room) return null;

  const amHost = room.hostId === myId;
  const canStart = room.players.length >= GAME.MIN_PLAYERS;

  const copy = (text: string, label: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => toast.success(`${label} copied!`))
      .catch(() => toast.error('Copy failed'));
  };

  return (
    <Card className="animate-rise flex h-fit md:h-full flex-col flex-1 min-h-0 items-center justify-center gap-4 md:gap-5 p-4 md:p-6 text-center overflow-y-auto bg-white border-2 border-[#252525] rounded-[28px] shadow-[6px_7px_0_rgba(37,37,37,0.08)]">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold">Waiting room</h2>
        <p className="text-muted-foreground text-xs md:text-sm mt-1">Share this code so friends can hop in</p>
      </div>
      <button
        onClick={() => copy(room.code, 'Room code')}
        title="Click to copy"
        className="group from-yellow-400/10 to-blue-500/10 hover:from-yellow-400/15 hover:to-blue-500/15 flex items-center gap-2 md:gap-4 rounded-2xl border-2 border-dashed border-blue-500/20 bg-gradient-to-br px-4 py-2 md:px-8 md:py-4 transition-all hover:-translate-y-0.5 cursor-pointer"
      >
        <span className="font-display text-gradient text-3xl md:text-5xl font-bold tracking-[0.2em] md:tracking-[0.3em]">
          {room.code}
        </span>
        <LuCopy className="text-muted-foreground group-hover:text-foreground size-4 md:size-6 transition-colors" />
      </button>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => copy(inviteLink(room.code), 'Invite link')}>
          <LuLink /> Copy invite link
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => copy(inviteLink(room.code, true), 'Spectator link')}
        >
          <LuEye /> Copy spectator link
        </Button>
      </div>

      <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <LuUsers className="size-4" /> {room.players.length} player
        {room.players.length === 1 ? '' : 's'}
        {room.spectatorCount > 0 && ` · ${room.spectatorCount} watching`} · {room.settings.rounds}{' '}
        rounds · {room.settings.drawTimeSeconds}s each
      </p>

      {room.players.length === 1 && <LobbyIllustration />}

      {spectating ? (
        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
          <LuEye className="size-4" /> You&apos;re spectating — enjoy the show!
        </Badge>
      ) : amHost ? (
        <Button size="lg" className="h-12 px-8 text-base" disabled={!canStart} onClick={startGame}>
          <LuPlay /> {canStart ? 'Start game' : `Need ${GAME.MIN_PLAYERS}+ players`}
        </Button>
      ) : (
        <p className="text-muted-foreground animate-pulse">Waiting for the host to start…</p>
      )}
    </Card>
  );
}




