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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#EEEAFE] text-[#6554D9] rounded-xl border border-[#DDD8D0]">
          <Pencil className="size-[22px]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#222222]">Host a Game</h2>
          <p className="text-xs text-[#68666D] font-medium">Create a room and invite your friends</p>
        </div>
      </div>

      {/* Nickname Field */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-name" className="text-xs font-bold text-[#222222]">Your nickname</Label>
        <Input
          id="create-name"
          value={name}
          maxLength={20}
          placeholder="e.g. Picasso"
          className={cn(
            "h-11 rounded-[11px] border-[#D8D3CB] bg-white transition-all font-semibold",
            createError && "border-[#E05260] focus:border-[#E05260] focus:ring-[#E05260]/10"
          )}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setCreateError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onCreate();
            }
          }}
        />
        {createError && (
          <span className="text-[11px] font-bold text-[#E05260]">{createError}</span>
        )}
      </div>

      {/* Preset Avatar Selection */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold text-[#222222]">Pick your doodle</Label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_AVATARS.map((p, index) => {
            const isSelected = avatarStyle === p.style && avatarSeed === p.seed && avatarColor === p.color;
            const presetUrl = `https://api.dicebear.com/10.x/${p.style}/svg?seed=${encodeURIComponent(p.seed)}&backgroundColor=${p.color.replace('#', '')}`;
            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setAvatarStyle(p.style);
                  setAvatarSeed(p.seed);
                  setAvatarColor(p.color);
                }}
                className={cn(
                  "w-[44px] h-[44px] rounded-full overflow-hidden transition-all cursor-pointer bg-white border flex items-center justify-center border-[#DDD8D0]",
                  isSelected && "border-2 border-[#6554D9] ring-[3px] ring-[#6554D9]/14 ring-offset-1"
                )}
                title={`Preset Avatar ${index + 1}`}
              >
                <img src={presetUrl} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
          
          {/* Toggle Customizer Button */}
          <button
            type="button"
            onClick={() => {
              setShowDoodleCustomizer(!showDoodleCustomizer);
              if (isPresetSelected) {
                setAvatarSeed(Math.random().toString(36).substring(7));
              }
            }}
            className={cn(
              "w-[44px] h-[44px] rounded-full transition-all cursor-pointer bg-[#EEEAFE] hover:bg-[#E2DBFC] border flex items-center justify-center text-[#6554D9] border-[#DDD8D0]",
              (!isPresetSelected || showDoodleCustomizer) && "border-2 border-[#6554D9] ring-[3px] ring-[#6554D9]/14 ring-offset-1"
            )}
            aria-label="Customize your doodle"
            aria-expanded={showDoodleCustomizer}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* "Customize your doodle" Accordion */}
      <div className="w-full border border-[#DDD8D0] rounded-[11px] bg-white overflow-hidden transition-all duration-200">
        <button
          type="button"
          onClick={() => setShowDoodleCustomizer(!showDoodleCustomizer)}
          className="w-full px-3.5 py-3 text-xs font-bold text-[#222222] bg-[#FFFCF7] hover:bg-[#F9F5EE] flex items-center justify-between border-none cursor-pointer"
          aria-expanded={showDoodleCustomizer}
        >
          <span>Customize your doodle</span>
          <ChevronDown className={cn("size-4 text-[#68666D] transition-transform duration-200", showDoodleCustomizer && "rotate-180")} />
        </button>

        {showDoodleCustomizer && (
          <div className="p-3.5 flex gap-3.5 items-center border-t border-[#DDD8D0] animate-rise">
            <div className="relative shrink-0 select-none">
              <div 
                className="w-12 h-12 rounded-full overflow-hidden border border-[#DDD8D0] flex items-center justify-center"
                style={{ background: avatarColor }}
              >
                <img 
                  src={avatarUrl} 
                  alt="Avatar Preview" 
                  className="size-full object-cover select-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/10.x/bottts/svg?seed=Picasso`;
                  }}
                />
              </div>
              <button
                type="button"
                title="Randomize avatar"
                className="absolute -bottom-1 -right-1 bg-[#6554D9] text-white hover:bg-[#5746C7] size-5 rounded-full shadow-xs flex items-center justify-center border border-white cursor-pointer transition-transform active:scale-95"
                onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
              >
                <Dices className="size-3" />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <Select value={avatarStyle} onValueChange={setAvatarStyle}>
                <SelectTrigger className="h-8 w-full text-xs rounded-[8px] bg-white border border-[#D8D3CB]">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_STYLES.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Color circle */}
              <div className="flex items-center gap-1.5">
                <label
                  style={{ background: avatarColor }}
                  className="size-5 rounded-full border border-[#D8D3CB] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-3xs"
                  title="Choose custom background color"
                >
                  <input
                    type="color"
                    className="size-0 opacity-0 cursor-pointer"
                    value={avatarColor}
                    onChange={(e) => setAvatarColor(e.target.value)}
                  />
                </label>
                <span className="text-[10px] font-bold text-[#68666D]">Custom Color</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* "Game settings" Accordion */}
      <div className="w-full border border-[#DDD8D0] rounded-[11px] bg-white overflow-hidden transition-all duration-200">
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="w-full px-3.5 py-3 text-xs font-bold text-[#222222] bg-[#FFFCF7] hover:bg-[#F9F5EE] flex items-center justify-between border-none cursor-pointer"
          aria-expanded={showSettings}
        >
          <span>Game settings</span>
          <ChevronDown className={cn("size-4 text-[#68666D] transition-transform duration-200", showSettings && "rotate-180")} />
        </button>

        {showSettings && (
          <div className="p-3.5 grid grid-cols-2 gap-3 border-t border-[#DDD8D0] animate-rise">
          </div>
        )}
      </div>
    </div>
  );
}
