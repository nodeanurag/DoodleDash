import { LuWifiOff } from 'react-icons/lu';
import { useGame } from './store';
import { Home } from './components/Home';
import { GameRoom } from './components/GameRoom';

export function App() {
  const { connected, room } = useGame();

  return (
    <div className={`relative h-full bg-grid-doodle bg-paper-texture overflow-x-hidden ${room ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      <div className={`relative z-10 ${room ? 'h-full' : 'min-h-full'}`}>{room ? <GameRoom /> : <Home />}</div>
      {!connected && (
        <div className="bg-card glass text-muted-foreground animate-pop-in fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm shadow-lg">
          <LuWifiOff className="size-4" /> Reconnecting…
        </div>
      )}
    </div>
  );
}
