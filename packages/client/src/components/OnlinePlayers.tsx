import { LuUsers } from 'react-icons/lu';
import { useGame } from '../store';

export function OnlinePlayers() {
  const { globalPlayerCount } = useGame();

  return (
    <div 
      className="fixed bottom-4 right-4 z-30 animate-pop-in cursor-default"
      title={`${globalPlayerCount} player(s) active on DoodleDash`}
    >
      <div className="glass flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border border-border/40 hover:scale-105 transition-transform duration-200">
        {/* Pulse Indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-game-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-game-green"></span>
        </span>
        
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display select-none">
          <LuUsers className="size-3.5 text-primary" />
          <span>Online Players:</span>
          <span className="text-foreground font-bold font-sans tabular-nums">{globalPlayerCount}</span>
        </span>
      </div>
    </div>
  );
}
