import { useEffect, useRef, useState } from 'react';
import { LuSend, LuMessageSquare, LuCheck, LuVolume2 } from 'react-icons/lu';
import { useGame } from '../store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function Chat() {
  const { messages, sendChat, room, myId, spectating } = useGame();
  const [text, setText] = useState('');
  const [shake, setShake] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    
    if (
      lastMsg.type === 'chat' &&
      lastMsg.playerId === myId &&
      room?.phase === 'drawing'
    ) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [messages, myId, room?.phase]);

  const isDrawer = room?.currentDrawerId === myId;
  const guessing = room?.phase === 'drawing' && !isDrawer && !spectating;
  const placeholder = spectating
    ? 'Spectator chat…'
    : isDrawer
      ? "You're drawing — shh!"
      : guessing
        ? 'Type your guess…'
        : 'Type a message…';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    sendChat(t);
    setText('');
  };

  const handleSendReaction = (emoji: string) => {
    if (isDrawer) return;
    sendChat(emoji);
  };

  return (
    <Card className={cn("flex min-h-0 flex-col gap-0 p-3.5 h-full bg-white border-2 border-[#252525] rounded-[24px] shadow-[4px_5px_0_rgba(37,37,37,0.08)]", shake && "animate-shake")}>
      <h2 className="text-muted-foreground mb-2 flex items-center gap-1.5 px-1 text-xs font-bold tracking-wider uppercase">
        <LuMessageSquare className="size-3.5" /> Chat &amp; Guesses
      </h2>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2.5 pr-2">
          {messages.map((m) => {
            if (m.type === 'system') {
              return (
                <div 
                  key={m.id} 
                  className="animate-pop-in flex items-center justify-center gap-1.5 rounded-xl bg-game-purple-soft border border-game-purple/20 px-3 py-1.5 text-center text-[11px] font-bold text-game-purple my-0.5"
                >
                  <LuVolume2 className="size-3 text-game-purple shrink-0" />
                  <span>{m.text}</span>
                </div>
              );
            }
            if (m.type === 'correct') {
              return (
                <div
                  key={m.id}
                  className="animate-pop-in flex items-center justify-center gap-1.5 rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-bold text-green-600 my-0.5 shadow-3xs"
                >
                  <span className="flex items-center justify-center size-4 rounded-full bg-green-500 text-white shrink-0">
                    <LuCheck className="size-2.5" />
                  </span>
                  <span>{m.text}</span>
                </div>
              );
            }
            
            const mine = m.playerId === myId;
            const msgPlayer = room?.players.find((p) => p.id === m.playerId);
            const timeStr = m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : '';

            return (
              <div 
                key={m.id} 
                className={cn(
                  "flex items-end gap-1.5 text-xs leading-snug break-words max-w-[85%]",
                  mine ? "self-end flex-row-reverse" : "self-start"
                )}
              >
                <Avatar className="size-6 shrink-0 border border-black/5">
                  <AvatarImage src={msgPlayer?.avatarUrl} alt={m.playerName} />
                  <AvatarFallback style={{ background: msgPlayer?.avatarColor ?? '#ccc' }} className="text-black font-bold text-[10px]">
                    {m.playerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-0.5">
                  {!mine && (
                    <span className="text-[10px] text-muted-foreground font-semibold px-1">
                      {m.playerName}
                    </span>
                  )}
                  <div
                    className={cn(
                       "px-3 py-2 rounded-2xl relative shadow-3xs",
                       mine 
                         ? "bg-game-purple text-white rounded-br-none" 
                         : "bg-secondary text-foreground rounded-bl-none border border-border/20"
                     )}
                   >
                     <p className="text-[12px] whitespace-pre-wrap">{m.text}</p>
                     <span 
                       className={cn(
                         "text-[8px] opacity-40 absolute bottom-1 font-mono",
                         mine ? "right-1.5" : "left-1.5"
                       )}
                     >
                       {timeStr}
                     </span>
                     <div className="h-2 w-4 inline-block" />
                   </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {!isDrawer && (
        <div className="flex justify-between items-center gap-1.5 mt-2 mb-1.5 px-0.5 shrink-0 select-none">
          {['😂', '🔥', '👏', '😮', '❤️', '🎉'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSendReaction(emoji)}
              className="flex-1 text-center py-1 rounded-lg bg-secondary/40 hover:bg-secondary border border-border/10 hover:scale-110 active:scale-95 transition-all text-base cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="mt-1 flex gap-2 shrink-0" onSubmit={submit}>
        <Input
          value={text}
          placeholder={placeholder}
          disabled={isDrawer}
          maxLength={120}
          onChange={(e) => setText(e.target.value)}
          className="rounded-input bg-secondary/50 border-border/80 focus-visible:ring-primary h-9"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isDrawer || !text.trim()} 
          className="rounded-btn btn-game-primary size-9 cursor-pointer text-white shrink-0 shadow-xs"
        >
          <LuSend className="size-3.5" />
        </Button>
      </form>
    </Card>
  );
}
