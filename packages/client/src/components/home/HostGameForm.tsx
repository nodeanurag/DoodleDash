import { useState } from 'react';
import { Pencil, Plus, Dices, ChevronDown, RotateCw, Clock, Target, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AVATAR_STYLES = [
  { id: 'croodles', name: 'Doodles' },
  { id: 'bottts', name: 'Robots' },
  { id: 'adventurer', name: 'Adventurers' },
  { id: 'fun-emoji', name: 'Emojis' }
];

const PRESET_AVATARS = [
  { style: 'croodles', seed: 'kitty', color: '#ef4444' },
  { style: 'bottts', seed: 'cyber', color: '#3b82f6' },
  { style: 'adventurer', seed: 'explorer', color: '#22c55e' },
  { style: 'fun-emoji', seed: 'laugh', color: '#eab308' },
  { style: 'croodles', seed: 'picasso', color: '#8b5cf6' },
];

interface HostGameFormProps {
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
}

export function HostGameForm({
  name,
  setName,
  rounds,
  setRounds,
  drawTime,
  setDrawTime,
  difficulty,
  setDifficulty,
  language,
  setLanguage,
  avatarStyle,
  setAvatarStyle,
  avatarSeed,
  setAvatarSeed,
  avatarColor,
  setAvatarColor,
  onCreate,
  createError,
  setCreateError,
  loadingCreate,
  connected,
}: HostGameFormProps) {
  const [showDoodleCustomizer, setShowDoodleCustomizer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const avatarUrl = `https://api.dicebear.com/10.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=${avatarColor.replace('#', '')}`;

  const isPresetSelected = PRESET_AVATARS.some(
    p => p.style === avatarStyle && p.seed === avatarSeed && p.color === avatarColor
  );

  return (
    <div className="flex flex-col gap-5 w-full">
    </div>
  );
}
