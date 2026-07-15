import { useState, useEffect } from 'react';
import { LuCrown, LuPencil, LuCheck, LuTrophy, LuWifi, LuWifiOff, LuSettings, LuLogOut, LuSignal } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface LeaderboardProps {
  onOpenSettings: () => void;
}

export function Leaderboard({ onOpenSettings }: LeaderboardProps) {
  const { room, myId, leaveRoom } = useGame();
  const [ping, setPing] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setPing(prev => {
        const diff = Math.floor(Math.random() * 7) - 3;
        return Math.max(15, Math.min(95, prev + diff));
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!room) return null;

  const ranked = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <Card className="flex flex-col gap-0 p-3.5 h-full bg-white border-2 border-[#252525] rounded-[24px] shadow-[4px_5px_0_rgba(37,37,37,0.08)] select-none">
      <h2 className="text-foreground mb-3 flex items-center justify-between px-1 text-xs font-black tracking-wider uppercase">
        <span className="flex items-center gap-1.5"><LuCrown className="size-3.5 text-game-purple fill-game-purple/10" /> Players ({room.players.length})</span>
        <span className="text-[10px] text-muted-foreground lowercase">round {room.round}/{room.totalRounds}</span>
      </h2>
      
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-2.5 pr-2 relative">
          <AnimatePresence mode="popLayout">
            {ranked.map((p, i) => {
              const xp = p.score * 1.5;
              const isDrawing = p.isDrawing;
              const hasGuessed = p.hasGuessed;
              
              const itemBg = isDrawing
                ? 'bg-[#FFF1A8] text-[#222222] border-[#252525]'
                : hasGuessed
                  ? 'bg-[#E7F8F1] text-green-700 border-[#252525]'
                  : 'bg-white text-[#222222] border-[#252525]';

              return (
                <motion.li
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  key={p.id}
                  className={cn(
                    'flex items-center gap-2.5 rounded-btn px-2.5 py-2 transition-all duration-200 border-2 shadow-[2px_3px_0_rgba(37,37,37,0.08)]',
                    itemBg,
                    p.id === myId && !isDrawing && 'ring-2 ring-primary ring-offset-1',
                    !p.connected && 'opacity-40',
                  )}
                >
                  <span className="w-5 flex items-center justify-center shrink-0">
                    {i === 0 ? (
                      <LuCrown className="size-4.5 text-yellow-600 fill-yellow-400" />
                    ) : i === 1 ? (
                      <LuTrophy className="size-4 text-slate-500 fill-slate-200" />
                    ) : i === 2 ? (
                      <LuTrophy className="size-4 text-amber-700 fill-amber-300" />
                    ) : (
                      <span className="font-display font-black text-xs text-muted-foreground">#{i + 1}</span>
                    )}
                  </span>

                  <div className="relative shrink-0">
                    <Avatar className={cn('size-8 border-2 border-black shadow-[1px_1px_0px_#000]', isDrawing && 'animate-pulse')}>
                      <AvatarImage src={p.avatarUrl} alt={p.name} />
                      <AvatarFallback style={{ background: p.avatarColor }} className="text-black font-bold text-xs">
                        {p.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {i === 0 && p.score > 0 && (
                      <span className="absolute -top-3 -left-2.5 text-yellow-600 rotate-[-15deg] animate-bounce shrink-0 drop-shadow-sm select-none">
                        <LuCrown className="size-4.5 fill-yellow-400 text-yellow-600" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="truncate text-xs font-black text-foreground">
                        {p.name}
                      </span>
                      {p.id === myId && (
                        <span className="text-[9px] text-muted-foreground font-black shrink-0">
                          (you)
                        </span>
                      )}
                      <span className="shrink-0" title={p.connected ? 'Connected' : 'Disconnected'}>
                        {p.connected ? (
                          <LuWifi className="size-3 text-green-600 opacity-80" />
                        ) : (
                          <LuWifiOff className="size-3 text-destructive" />
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] text-muted-foreground font-bold shrink-0">
                        {xp} XP
                      </span>
                      <span className="text-[9px] text-muted-foreground shrink-0">•</span>
                      <span className="text-[9px] text-primary font-black shrink-0">
                        {p.score} pts
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end min-w-[65px]">
                    {room.phase === 'lobby' || room.phase === 'game-end' ? (
                      p.isHost && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-yellow-400 border-2 border-black shrink-0 shadow-[1px_1px_0px_#000]">
                          Host
                        </span>
                      )
                    ) : isDrawing ? (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-yellow-300 border-2 border-black shrink-0 animate-pulse shadow-[1px_1px_0px_#000]">
                        <LuPencil className="size-2.5" /> Draw
                      </span>
                    ) : hasGuessed ? (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-green-400 border-2 border-black shrink-0 animate-pop-in shadow-[1px_1px_0px_#000]">
                        <LuCheck className="size-2.5 text-white" /> Correct
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                        guesser
                      </span>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </ScrollArea>

      <div className="flex flex-col gap-1.5 border-t-3 border-black pt-3 mt-2 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-black px-1 select-none">
          <span className="flex items-center gap-1">
            <LuSignal className="size-3 text-green-600" /> Ping: <span className="font-mono text-foreground">{ping}ms</span>
          </span>
          <span className="uppercase text-[9px] tracking-wider font-black">Room: {room.code}</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onOpenSettings}
            className="flex-1 h-8 rounded-btn border-2 border-black font-bold text-xs gap-1 cursor-pointer bg-white text-black hover:bg-secondary active:translate-y-0.5"
          >
            <LuSettings className="size-3.5" /> Settings
          </Button>
          <Button
            variant="secondary"
            onClick={leaveRoom}
            className="flex-1 h-8 rounded-btn border-2 border-black font-bold text-xs gap-1 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200 active:translate-y-0.5"
          >
            <LuLogOut className="size-3.5" /> Leave
          </Button>
        </div>
      </div>
    </Card>
  );
}
