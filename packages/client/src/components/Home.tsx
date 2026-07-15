import { useState, useRef } from 'react';
import { GAME } from '@doodle/shared';
import { useGame } from '../store';
import { Navbar } from './Navbar';
import { Hero } from './home/Hero';
import { GameConsole } from './home/GameConsole';
import { HowToPlayNote } from './home/HowToPlayNote';
import { HomeMicrocopy } from './home/HomeMicrocopy';
import { GameplayShowcase } from './home/GameplayShowcase';
import { SocialChaosSection } from './home/SocialChaosSection';

const PRESET_AVATAR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
];

export function Home() {
  const { createRoom, joinRoom, connected, globalPlayerCount } = useGame();
  const [name, setName] = useState(() => localStorage.getItem('dd:name') ?? '');
  
  // URL Invite params
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [code, setCode] = useState(() => (params.get('room') ?? '').toUpperCase());
  const [mode, setMode] = useState<'play' | 'watch'>(() =>
    params.get('spectate') ? 'watch' : 'play',
  );
  
  // Game Creation settings
  const [rounds, setRounds] = useState<number>(GAME.DEFAULT_ROUNDS);
  const [drawTime, setDrawTime] = useState<number>(GAME.DEFAULT_DRAW_TIME_SECONDS);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [language, setLanguage] = useState<string>('en');

  // Avatar Builder
  const [avatarStyle, setAvatarStyle] = useState(() => localStorage.getItem('dd:avatarStyle') ?? 'croodles');
  const [avatarSeed, setAvatarSeed] = useState(() => localStorage.getItem('dd:avatarSeed') ?? Math.random().toString(36).substring(7));
  const [avatarColor, setAvatarColor] = useState(() => {
    const saved = localStorage.getItem('dd:avatarColor');
    if (saved) return saved;
    return PRESET_AVATAR_COLORS[Math.floor(Math.random() * PRESET_AVATAR_COLORS.length)];
  });

  // Validation & Pending States
  const [createError, setCreateError] = useState('');
  const [joinNameError, setJoinNameError] = useState('');
  const [joinCodeError, setJoinCodeError] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const howItWorksRef = useRef<HTMLDivElement>(null);

  const avatarUrl = `https://api.dicebear.com/10.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=${avatarColor.replace('#', '')}`;
  const trimmed = name.trim();

  const persist = () => {
    localStorage.setItem('dd:name', trimmed);
    localStorage.setItem('dd:avatarStyle', avatarStyle);
    localStorage.setItem('dd:avatarSeed', avatarSeed);
    localStorage.setItem('dd:avatarColor', avatarColor);
  };

  const onCreate = () => {
    setCreateError('');
    if (!trimmed) {
      setCreateError('Nickname is required.');
      return;
    }
    setLoadingCreate(true);
    persist();
    createRoom(trimmed, avatarColor, avatarUrl, { rounds, drawTimeSeconds: drawTime });
    setTimeout(() => setLoadingCreate(false), 2000);
  };

  const onJoin = () => {
    setJoinNameError('');
    setJoinCodeError('');
    let hasError = false;

    if (!trimmed) {
      setJoinNameError('Nickname is required.');
      hasError = true;
    }
    if (code.trim().length < 4) {
      setJoinCodeError('Room code must be at least 4 characters.');
      hasError = true;
    }

    if (hasError) return;
    setLoadingJoin(true);
    persist();
    joinRoom(trimmed, code.trim(), avatarColor, avatarUrl, mode === 'watch');
    setTimeout(() => setLoadingJoin(false), 2000);
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToGameOptionsHost = () => {
    const element = document.getElementById('game-options');
    element?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('create-name')?.focus();
    }, 450);
  };

  const scrollToGameOptionsJoin = () => {
    const element = document.getElementById('game-options');
    element?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('room-code')?.focus();
    }, 450);
  };

  return (
    <div className="relative min-h-screen flex flex-col pt-16 md:pt-[72px] overflow-x-hidden">
      <Navbar onScrollToHowItWorks={scrollToHowItWorks} />

      <main className="flex-1 flex flex-col items-center max-w-[1180px] w-full mx-auto px-6 z-10 pt-0">
        
        {/* Hero Section */}
        <Hero 
          onHostClick={scrollToGameOptionsHost} 
          onJoinClick={scrollToGameOptionsJoin} 
        />

        {/* Unified Game Console wrapper */}
        <div className="w-full relative flex flex-col items-center mt-0 mb-16">
          <GameConsole
            name={name}
            setName={setName}
            rounds={rounds}
            setRounds={setRounds}
            drawTime={drawTime}
            setDrawTime={setDrawTime}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            language={language}
            setLanguage={setLanguage}
            avatarStyle={avatarStyle}
            setAvatarStyle={setAvatarStyle}
            avatarSeed={avatarSeed}
            setAvatarSeed={setAvatarSeed}
            avatarColor={avatarColor}
            setAvatarColor={setAvatarColor}
            onCreate={onCreate}
            createError={createError}
            setCreateError={setCreateError}
            loadingCreate={loadingCreate}
            connected={connected}
            
            code={code}
            setCode={setCode}
            mode={mode}
            setMode={setMode}
            onJoin={onJoin}
            joinNameError={joinNameError}
            setJoinNameError={setJoinNameError}
            joinCodeError={joinCodeError}
            setJoinCodeError={setJoinCodeError}
            loadingJoin={loadingJoin}
          />
          
          {/* Sticky How to play note */}
          <div ref={howItWorksRef} className="mt-10 2xl:mt-0 2xl:static scroll-mt-[90px]">
            <HowToPlayNote />
          </div>
        </div>
      </main>

      {/* Showcase presentational full-width layouts */}
      <GameplayShowcase />

      <SocialChaosSection
        onHostClick={scrollToGameOptionsHost}
        onJoinClick={scrollToGameOptionsJoin}
        connected={connected}
        globalPlayerCount={globalPlayerCount}
      />

      <HomeMicrocopy />
    </div>
  );
}
