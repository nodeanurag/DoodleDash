import { LogIn, UserRound, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JoinGameFormProps {
  name: string;
  setName: (val: string) => void;
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
  connected: boolean;
}

export function JoinGameForm({
  name,
  setName,
  code,
  setCode,
  mode,
  setMode,
  onJoin,
  joinNameError,
  setJoinNameError,
  joinCodeError,
  setJoinCodeError,
  loadingJoin,
  connected,
}: JoinGameFormProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#E7F8F1] text-[#17B978] rounded-xl border border-[#DDD8D0]">
          <LogIn className="size-[22px]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#222222]">Join a Game</h2>
          <p className="text-xs text-[#68666D] font-medium">Enter a code and jump into the fun</p>
        </div>
      </div>

      {/* Room Code */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="room-code" className="text-xs font-bold text-[#222222]">Room code</Label>
        <Input
          id="room-code"
          className={cn(
            "h-11 text-center text-lg font-extrabold tracking-[0.32em] uppercase rounded-[11px] border-[#D8D3CB] bg-white transition-all",
            joinCodeError && "border-[#E05260] focus:border-[#E05260] focus:ring-[#E05260]/10"
          )}
          value={code}
          placeholder="ABCD12"
          maxLength={6}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (e.target.value.trim()) setJoinCodeError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!name.trim()) {
                document.getElementById('join-name')?.focus();
              } else {
                onJoin();
              }
            }
          }}
        />
        {joinCodeError && (
          <span className="text-[11px] font-bold text-[#E05260]">{joinCodeError}</span>
        )}
      </div>

      {/* Nickname Field */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="join-name" className="text-xs font-bold text-[#222222]">Your nickname</Label>
        <Input
          id="join-name"
          value={name}
          maxLength={20}
          placeholder="e.g. Picasso"
          className={cn(
            "h-11 rounded-[11px] border-[#D8D3CB] bg-white transition-all font-semibold",
            joinNameError && "border-[#E05260] focus:border-[#E05260] focus:ring-[#E05260]/10"
          )}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setJoinNameError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onJoin();
            }
          }}
        />
        {joinNameError && (
          <span className="text-[11px] font-bold text-[#E05260]">{joinNameError}</span>
        )}
      </div>

      {/* Play / Spectator mode segmented toggle */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-bold text-[#222222]">Play as</Label>
        <div className="bg-[#FFFCF7] grid grid-cols-2 gap-1 rounded-xl p-1 border border-[#DDD8D0]">
          <button
            type="button"
            onClick={() => setMode('play')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer border-none',
              mode === 'play'
                ? 'bg-white text-[#222222] shadow-xs border border-[#DDD8D0]'
                : 'text-[#68666D] hover:text-[#222222] bg-transparent',
            )}
          >
            <UserRound className="size-3.5 text-[#17B978]" />
            Player
          </button>
          <button
            type="button"
            onClick={() => setMode('watch')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer border-none',
              mode === 'watch'
                ? 'bg-white text-[#222222] shadow-xs border border-[#DDD8D0]'
                : 'text-[#68666D] hover:text-[#222222] bg-transparent',
            )}
          >
            <Eye className="size-3.5 text-[#548CF6]" />
            Spectator
          </button>
        </div>
      </div>

      {/* Join CTA Button */}
      <Button
        className="w-full h-[50px] rounded-[11px] btn-game-accent font-bold text-sm shadow-xs mt-1 cursor-pointer flex items-center justify-center gap-2"
        disabled={loadingJoin || !connected}
        onClick={onJoin}
        aria-busy={loadingJoin}
      >
        {loadingJoin ? 'Joining…' : 'Join Room →'}
      </Button>
    </div>
  );
}
