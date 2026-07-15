import { Copy, Clock, Play, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SocialChaosSectionProps {
  onHostClick: () => void;
  onJoinClick: () => void;
  connected: boolean;
  globalPlayerCount: number;
}

export function SocialChaosSection({
  onHostClick,
  onJoinClick,
  connected,
  globalPlayerCount,
}: SocialChaosSectionProps) {
  return (
    <section className="w-full bg-[#FFFCF7] relative select-none flex flex-col items-center pt-16 pb-20 border-t border-[#DDD8D0]/30 min-h-[850px] lg:min-h-[950px] overflow-hidden">
      
      <div className="max-w-[1180px] w-full mx-auto px-6 flex flex-col items-center relative z-10">
        
        {/* Visual Collage Elements Container (positioned relatively to spread around heading) */}
        <div className="w-full relative flex flex-col items-center text-center">
          
          {/* Primary Massive Headline */}
          <div className="max-w-[800px] z-20 relative select-none mt-8">
            <h2 className="font-sans font-black text-[#222222] text-5xl sm:text-6xl md:text-[84px] tracking-tight leading-[0.9] flex flex-col gap-1 items-center justify-center">
              <span>Your group chat</span>
              <span>is bored.</span>
            </h2>
            <div className="font-display font-black text-[#6554D9] text-[68px] sm:text-[80px] md:text-[108px] leading-none mt-3 rotate-[-3deg] inline-block hover:scale-105 transition-transform duration-200">
              Fix that.
            </div>
            
            {/* Supporting Copy */}
            <p className="font-sans font-extrabold text-[#68666D] text-[15px] sm:text-[18px] max-w-[580px] mx-auto mt-6 leading-relaxed">
              Create a room, drop the code, and find out which friend should never be trusted with a pencil.
            </p>
          </div>

          {/* Collage items arranged with absolute positions on desktop, flex/stacked on mobile */}
          <div className="w-full mt-12 md:mt-0 md:absolute md:inset-0 md:min-h-[500px] pointer-events-none z-10">
            
            {/* Item 1: Room Code Slip */}
            <div className="md:absolute md:top-[8%] md:left-[5%] bg-[#FFF1A8] border-2 border-[#252525] rounded-xl p-3 shadow-[4px_4px_0_rgba(37,37,37,0.08)] rotate-[-4deg] w-48 mx-auto md:mx-0 pointer-events-auto flex flex-col gap-1 select-none hover:rotate-0 transition-transform duration-300">
              <span className="text-[9px] font-black text-[#68666D]/75 tracking-wider uppercase">Room Code</span>
              <div className="flex items-center justify-between border border-black/10 bg-white rounded-lg p-1.5 mt-0.5">
                <span className="font-display text-sm font-black text-[#222222] tracking-wider">ABCD12</span>
                <Copy className="size-3.5 text-[#68666D]" />
              </div>
            </div>

            {/* Item 2: Timer Bubble */}
            <div className="md:absolute md:top-[12%] md:right-[6%] bg-white border-2 border-[#252525] rounded-full p-2.5 shadow-[4px_4px_0_rgba(37,37,37,0.08)] rotate-[3deg] w-28 mx-auto md:mx-0 pointer-events-auto flex items-center justify-center gap-1.5 hover:rotate-0 transition-transform duration-300">
              <Clock className="size-4 text-red-500 animate-pulse" />
              <span className="font-mono text-sm font-black text-[#222222]">00:12</span>
            </div>

            {/* Item 3: Sample Chat Bubble 1 */}
            <div className="md:absolute md:top-[50%] md:left-[2%] bg-[#EEEAFE] border-2 border-[#252525] rounded-2xl rounded-bl-none p-3 shadow-[4px_4px_0_rgba(37,37,37,0.08)] rotate-[2deg] w-44 mx-auto md:mx-0 pointer-events-auto flex flex-col items-start gap-0.5 hover:rotate-0 transition-transform duration-300">
              <span className="text-[8px] text-neutral-400 font-bold">Alex</span>
              <p className="text-xs font-extrabold text-[#222222]">WHAT IS THAT??</p>
            </div>

            {/* Item 4: Sample Chat Bubble 2 */}
            <div className="md:absolute md:top-[68%] md:right-[3%] bg-[#E7F8F1] border-2 border-[#252525] rounded-2xl rounded-br-none p-3 shadow-[4px_4px_0_rgba(37,37,37,0.08)] rotate-[-3deg] w-40 mx-auto md:mx-0 pointer-events-auto flex flex-col items-end gap-0.5 hover:rotate-0 transition-transform duration-300">
              <span className="text-[8px] text-neutral-400 font-bold">Sam</span>
              <p className="text-xs font-extrabold text-[#222222]">giraffe!! 🦒</p>
            </div>

            {/* Item 5: Score Strip */}
            <div className="md:absolute md:top-[46%] md:right-[6%] bg-white border-2 border-[#252525] rounded-xl p-3 shadow-[4px_4px_0_rgba(37,37,37,0.08)] rotate-[-2deg] w-52 mx-auto md:mx-0 pointer-events-auto flex flex-col gap-1.5 hover:rotate-0 transition-transform duration-300">
              <span className="text-[9px] font-black text-[#68666D]/75 tracking-wider uppercase text-left">Top Players</span>
              <div className="flex flex-col gap-1 text-[11px] font-extrabold text-[#222222] text-left">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-0.5">
                  <span>👑 1. KV</span>
                  <span className="text-[#6554D9]">1240</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-0.5">
                  <span>2. Alex</span>
                  <span className="text-[#68666D]">980</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>3. Sam</span>
                  <span className="text-[#68666D]">760</span>
                </div>
              </div>
            </div>

            {/* Item 6: Avatar Row Detail */}
            <div className="md:absolute md:top-[74%] md:left-[8%] bg-white border-2 border-[#252525] rounded-full px-3 py-1.5 shadow-[4px_4px_0_rgba(37,37,37,0.08)] rotate-[4deg] mx-auto md:mx-0 pointer-events-auto flex items-center gap-1.5 hover:rotate-0 transition-transform duration-300 w-fit">
              <div className="flex -space-x-1.5">
                <Avatar className="size-6 border-2 border-white">
                  <AvatarFallback className="bg-red-400 text-white text-[9px] font-black">K</AvatarFallback>
                </Avatar>
                <Avatar className="size-6 border-2 border-white">
                  <AvatarFallback className="bg-blue-400 text-white text-[9px] font-black">A</AvatarFallback>
                </Avatar>
                <Avatar className="size-6 border-2 border-white">
                  <AvatarFallback className="bg-green-400 text-white text-[9px] font-black">S</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-[10px] font-bold text-[#68666D]">+3 joined</span>
            </div>

          </div>

        </div>

        {/* Proof Points typographic row */}
        <div className="w-full max-w-[650px] border-t border-b border-[#DDD8D0] py-4 mt-20 md:mt-32 flex justify-center items-center select-none z-20">
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-xs font-black text-[#68666D] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><UserCheck className="size-4 text-[#6554D9]" /> No signup</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><ShieldAlert className="size-4 text-[#17B978]" /> Private rooms</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Sparkles className="size-4 text-[#F8C843]" /> Real-time chaos</span>
          </div>
        </div>

        {/* Final Conversion Area */}
        <div className="w-full max-w-[680px] bg-white border-2 border-[#252525] rounded-[24px] shadow-[6px_7px_0_rgba(37,37,37,0.08)] p-8 mt-16 text-center flex flex-col items-center z-20 select-none">
          <h3 className="font-sans font-black text-2xl md:text-3xl text-[#222222]">
            Ready to make some bad art?
          </h3>
          
          <div className="flex items-center gap-4 mt-6 flex-wrap w-full justify-center">
            <Button
              onClick={onHostClick}
              className="w-full sm:w-auto btn-game-primary font-extrabold px-8 h-[50px] text-sm cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              Host a Game <Play className="size-4 fill-current" />
            </Button>

            <Button
              onClick={onJoinClick}
              variant="outline"
              className="w-full sm:w-auto bg-[#FFFCF7] border-2 border-[#252525] hover:bg-[#FDF9F0] text-[#222222] font-extrabold px-8 h-[50px] text-sm cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              Join with Code →
            </Button>
          </div>

          {/* Live Online Player Count */}
          <div className="flex items-center gap-2 mt-5">
            {connected ? (
              <>
                <span className="h-2 w-2 bg-[#17B978] rounded-full inline-block animate-pulse" />
                <span className="text-xs font-black text-[#68666D]">
                  {globalPlayerCount} online now
                </span>
              </>
            ) : (
              <span className="text-xs font-extrabold text-[#68666D]">
                Connecting…
              </span>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
