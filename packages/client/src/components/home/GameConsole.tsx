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
