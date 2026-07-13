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
      <div className="grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] items-start w-full gap-2 md:gap-0">
      </div>
    </div>
  );
}
