import { LuCrown, LuPencil, LuCheck, LuUsers, LuClock, LuMessageSquare, LuWifi, LuWifiOff, LuTrophy } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PlayerList() {
  const { room, myId } = useGame();
  if (!room) return null;

  const ranked = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <Card className="flex min-h-0 flex-col gap-0 p-3 h-full">
      <h2 className="text-muted-foreground mb-2.5 flex items-center gap-1.5 px-1 text-xs font-bold tracking-wider uppercase">
        <LuUsers className="size-3.5" /> Players ({room.players.length})
      </h2>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-1.5 pr-2 relative">
          <AnimatePresence mode="popLayout">
            {ranked.map((p, i) => {
              const xp = p.score * 1.5;
              return (
                <motion.li
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  key={p.id}
                  className={cn(
                    'flex items-center gap-2.5 rounded-2xl px-3 py-2.5 transition-all duration-200 border border-transparent shadow-3xs',
                    p.isDrawing
                      ? 'from-primary/20 to-primary/5 bg-gradient-to-r border-primary/30 ring-2 ring-primary/30'
                      : 'bg-card border-border/40 hover:border-primary/20 hover:shadow-2xs',
                    p.id === myId && !p.isDrawing && 'ring-2 ring-foreground/10',
                    !p.connected && 'opacity-40',
                  )}
                >
                  {/* Rank Display */}
                  <span className="w-6 flex items-center justify-center shrink-0">
                    {i === 0 ? (
                      <LuCrown className="size-4.5 text-yellow-500 fill-yellow-500/10" />
                    ) : i === 1 ? (
                      <LuTrophy className="size-4 text-slate-400" />
                    ) : i === 2 ? (
                      <LuTrophy className="size-4 text-amber-600" />
                    ) : (
                      <span className="font-display font-bold text-xs text-muted-foreground">#{i + 1}</span>
                    )}
                  </span>

                  {/* Avatar & Crown */}
                  <div className="relative shrink-0">
                    <Avatar className={cn('size-9 border-2 border-background shadow-xs', p.isDrawing && 'ring-2 ring-primary/80 animate-pulse')}>
                      <AvatarImage src={p.avatarUrl} alt={p.name} />
                      <AvatarFallback style={{ background: p.avatarColor }} className="text-black font-bold text-xs">
                        {p.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Bouncing crown for rank #1 */}
                    {i === 0 && p.score > 0 && (
                      <span className="absolute -top-3 -left-2 text-yellow-400 rotate-[-15deg] animate-bounce shrink-0 drop-shadow-sm select-none">
                        <LuCrown className="size-4.5 fill-yellow-400" />
                      </span>
                    )}
                  </div>

                  {/* Player Name and XP */}
                  <div className="flex-1 min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-foreground">
                        {p.name}
                      </span>
                      {p.id === myId && (
                        <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                          (you)
                        </span>
                      )}
                      {/* Connection quality dot */}
                      <span className="shrink-0" title={p.connected ? 'Connected' : 'Disconnected'}>
                        {p.connected ? (
                          <LuWifi className="size-3 text-green-500 opacity-60" />
                        ) : (
                          <LuWifiOff className="size-3 text-destructive" />
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                        {xp} XP
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">•</span>
                      <span className="text-[10px] text-primary font-bold shrink-0">
                        {p.score} pts
                      </span>
                    </div>
                  </div>

                  {/* Player Status Badge */}
                  <div className="shrink-0 flex items-center justify-end min-w-[70px]">
                    {room.phase === 'lobby' || room.phase === 'game-end' ? (
                      p.isHost && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 shrink-0">
                          Host
                        </span>
                      )
                    ) : p.isDrawing ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0 animate-pulse">
                        <LuPencil className="size-2.5" /> Draw
                      </span>
                    ) : p.hasGuessed ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-600 border border-green-500/20 shrink-0 animate-pop-in">
                        <LuCheck className="size-2.5" /> Correct
                      </span>
                    ) : room.phase === 'drawing' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
                        <LuMessageSquare className="size-2.5" /> Guess
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-secondary border border-border shrink-0">
                        <LuClock className="size-2.5 text-muted-foreground" /> Wait
                      </span>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </ScrollArea>
    </Card>
  );
}
