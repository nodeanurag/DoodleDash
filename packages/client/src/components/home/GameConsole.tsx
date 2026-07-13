import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HostGameForm } from './HostGameForm';
import { JoinGameForm } from './JoinGameForm';

interface GameConsoleProps {
  name: string;
  setName: (val: string) => void;
  rounds: number;
  setRounds: (val: number) => void;
  drawTime: number;
  setDrawTime: (val: number) => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  avatarStyle: string;
  setAvatarStyle: (val: string) => void;
  avatarSeed: string;
  setAvatarSeed: (val: string) => void;
  avatarColor: string;
  setAvatarColor: (val: string) => void;
  onCreate: () => void;
  createError: string;
  setCreateError: (val: string) => void;
  loadingCreate: boolean;
  connected: boolean;

  code: string;
  setCode: (val: string) => void;
  mode: 'play' | 'watch';
  setMode: (val: 'play' | 'watch') => void;
  onJoin: () => void;
  joinNameError: string;
  setJoinNameError: (val: string) => void;
  joinCodeError: string;
  setJoinCodeError: (val: string) => void;
  loadingJoin: boolean;
}

export function GameConsole(props: GameConsoleProps) {
  const [activeTab, setActiveTab] = useState<'host' | 'join'>('host');

  return (
    <div 
      id="game-options"
      className="w-full max-w-[980px] bg-[rgba(255,255,255,0.95)] border-2 border-[#252525] rounded-[28px] shadow-[6px_7px_0_rgba(37,37,37,0.08)] px-5 py-6 md:px-[34px] md:py-[30px] scroll-mt-[90px] select-none"
    >
      {/* Mobile/Tablet Segmented Selector (Width < 768px) */}
      <div className="flex md:hidden bg-[#FFFCF7] border border-[#DDD8D0] p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('host')}
          className={cn(
            "flex-1 py-2 text-center text-xs font-black rounded-lg transition-all cursor-pointer border-none",
            activeTab === 'host'
              ? "bg-[#6554D9] text-white shadow-xs"
              : "text-[#68666D] hover:text-[#222222]"
          )}
        >
          Host a Game
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('join')}
          className={cn(
            "flex-1 py-2 text-center text-xs font-black rounded-lg transition-all cursor-pointer border-none",
            activeTab === 'join'
              ? "bg-[#17B978] text-white shadow-xs"
              : "text-[#68666D] hover:text-[#222222]"
          )}
        >
          Join a Game
        </button>
      </div>

      {/* Grid Layout (Desktop double-column, Mobile toggle) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] items-start w-full gap-2 md:gap-0">
        
        {/* Host Form Wrapper */}
        <div className={cn(
          "w-full md:block", 
          activeTab === 'host' ? "block" : "hidden"
        )}>
        </div>

        {/* OR Divider (Desktop only, hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center justify-self-center h-full relative z-10 w-full select-none">
          {/* Vertical dashed line */}
          <div className="absolute top-0 bottom-0 w-[1.5px] border-l border-dashed border-[#DDD8D0]" />
          
          {/* Circular badge */}
          <div className="relative my-auto bg-[#222222] text-white text-xs font-black rounded-full w-11 h-11 flex items-center justify-center z-20 border border-[#252525] shadow-xs">
            OR
          </div>
        </div>

        {/* Join Form Wrapper */}
        <div className={cn(
          "w-full md:block", 
          activeTab === 'join' ? "block" : "hidden"
        )}>
        </div>
      </div>
    </div>
  );
}
