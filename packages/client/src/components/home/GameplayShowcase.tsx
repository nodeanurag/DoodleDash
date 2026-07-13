import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowDoodle } from './DoodleDecoration';

export function GameplayShowcase() {
  return (
    <section className="w-full bg-[#F4F0FF] relative select-none flex flex-col items-center pt-2 pb-16 md:pb-24 border-t border-[#DDD8D0]/30 min-h-[900px] lg:min-h-[1000px] overflow-hidden">
      
      {/* Irregular transition from Screen 1 */}
      <div className="absolute top-0 left-0 right-0 h-10 -translate-y-full overflow-hidden bg-transparent pointer-events-none">
        <svg className="w-full h-full text-[#F4F0FF] fill-current" viewBox="0 0 1200 40" preserveAspectRatio="none">
          <path d="M0,0 Q300,40 600,10 T1200,30 L1200,40 L0,40 Z" />
        </svg>
      </div>

      <div className="max-w-[1180px] w-full mx-auto px-6 flex flex-col items-center z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-[680px] mt-10 md:mt-16">
          <span className="font-display font-bold text-[#6554D9] text-base md:text-lg block tracking-wide rotate-[-1deg]">
            "it starts normal..."
          </span>
          <h2 className="font-sans font-black text-[#222222] text-4xl sm:text-5xl md:text-[54px] tracking-tight leading-[1.05] mt-2">
            This gets chaotic fast.
          </h2>
          <p className="font-sans font-extrabold text-[#68666D] text-[15px] sm:text-[17px] mt-4 leading-relaxed">
            One secret word. One questionable drawing. A room full of confident wrong answers.
          </p>
        </div>

        {/* Visual Showcase Block */}
        <div className="w-full relative mt-16 md:mt-24 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-6 min-h-[500px]">
          
          {/* Left / Overlay Oversized Steps */}
          <div className="flex flex-col gap-6 lg:w-[32%] shrink-0 z-20">
            {/* Step 1 */}
            <div className="relative pl-14 pr-4 py-2 group">
              <span className="absolute left-0 top-0 text-5xl md:text-[64px] font-black text-[#6554D9]/15 select-none leading-none tracking-tighter">
                01
              </span>
              <h4 className="font-sans font-extrabold text-[#222222] text-base md:text-lg tracking-wide uppercase">
                Draw something terrible
              </h4>
              <p className="text-xs text-[#68666D] font-bold mt-1">
                You get 60 seconds to express your inner artist. Realism is optional. Speed is mandatory.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative pl-14 pr-4 py-2 group">
              <span className="absolute left-0 top-0 text-5xl md:text-[64px] font-black text-[#6554D9]/15 select-none leading-none tracking-tighter">
                02
              </span>
              <h4 className="font-sans font-extrabold text-[#222222] text-base md:text-lg tracking-wide uppercase">
                Watch your friends panic
              </h4>
              <p className="text-xs text-[#68666D] font-bold mt-1">
                Chat fills up with wild guesses as the timer ticks down. No, that is not a dog.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative pl-14 pr-4 py-2 group">
              <span className="absolute left-0 top-0 text-5xl md:text-[64px] font-black text-[#6554D9]/15 select-none leading-none tracking-tighter">
                03
              </span>
              <h4 className="font-sans font-extrabold text-[#222222] text-base md:text-lg tracking-wide uppercase">
                Somehow win
              </h4>
              <p className="text-xs text-[#68666D] font-bold mt-1">
                Score points for drawing, score points for guessing, and laugh at the final scoreboard.
              </p>
            </div>
          </div>

          {/* Right Showcase Screen Mockup (65-70% width) */}
          <div className="w-full lg:w-[68%] max-w-[760px] relative z-10">
            
            {/* Tilted game container mockup */}
            <div className="w-full bg-[#FFFCF7] border-2 border-[#252525] rounded-[24px] shadow-[8px_10px_0_rgba(37,37,37,0.08)] p-3 md:p-4 select-none rotate-[-2.5deg] relative transition-transform hover:rotate-0 duration-300">
              
              {/* Top HUD bar mockup */}
              <div className="relative flex items-center justify-between px-3 py-2 border border-[#DDD8D0]/60 rounded-xl bg-white mb-3 shadow-[1px_2px_0_rgba(0,0,0,0.02)]">
                
                {/* Round Counter */}
                <div className="flex flex-col">
                  <div className="flex gap-0.5">
                    <span className="size-2 rounded-full bg-[#6554D9]" />
                    <span className="size-2 rounded-full bg-[#6554D9]" />
                    <span className="size-2 rounded-full bg-[#6554D9]" />
                    <span className="size-2 rounded-full bg-neutral-200" />
                  </div>
                  <span className="font-display text-[9px] font-bold text-[#68666D] mt-0.5">Round 3 of 4</span>
                </div>

                {/* Secret Word */}
                <div className="font-display text-base md:text-xl font-bold tracking-[0.25em] text-[#222222]">
                  G I R A F F E
                </div>

                {/* Timer Circle */}
                <div className="size-9 rounded-full flex items-center justify-center bg-red-100 border-2 border-red-500 text-red-500 font-extrabold text-[13px] animate-pulse">
                  12s
                </div>
              </div>

              {/* Tilted Game layout grid: Left, Center, Right columns */}
              <div className="grid grid-cols-1 md:grid-cols-[165px_1fr_210px] gap-2.5 min-h-[260px] items-stretch">
                
                {/* 1. Players Mockup */}
                <div className="bg-[#FFFCF7] border border-[#DDD8D0] rounded-xl p-2 flex flex-col gap-1.5 shadow-2xs">
                  <span className="text-[9px] font-black text-[#68666D] uppercase px-0.5 tracking-wider mb-0.5">Players (3)</span>
                  
                  {/* KV (drawing, correct) */}
                  <div className="flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-400/30 rounded-lg p-1.5 shadow-3xs">
                    <Avatar className="size-6 border border-black/10">
                      <AvatarFallback className="bg-[#ef4444] text-white text-[10px] font-black">K</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 leading-none">
                      <h5 className="text-[10px] font-black truncate">KV</h5>
                      <span className="text-[8px] font-bold text-green-600">1240 pts</span>
                    </div>
                    <Badge className="bg-green-500 text-white text-[7px] font-black px-1 py-0.5 shrink-0 border-none">Correct</Badge>
                  </div>

                  {/* Alex */}
                  <div className="flex items-center gap-1.5 bg-white text-[#222222] border border-[#DDD8D0] rounded-lg p-1.5 shadow-3xs">
                    <Avatar className="size-6 border border-black/10">
                      <AvatarFallback className="bg-[#3b82f6] text-white text-[10px] font-black">A</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 leading-none">
                      <h5 className="text-[10px] font-black truncate">Alex</h5>
                      <span className="text-[8px] font-bold text-neutral-400">980 pts</span>
                    </div>
                    <span className="text-[7px] font-black text-neutral-400 uppercase shrink-0">guesser</span>
                  </div>

                  {/* Sam */}
                  <div className="flex items-center gap-1.5 bg-white text-[#222222] border border-[#DDD8D0] rounded-lg p-1.5 shadow-3xs">
                    <Avatar className="size-6 border border-black/10">
                      <AvatarFallback className="bg-[#22c55e] text-white text-[10px] font-black">S</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 leading-none">
                      <h5 className="text-[10px] font-black truncate">Sam</h5>
                      <span className="text-[8px] font-bold text-neutral-400">760 pts</span>
                    </div>
                    <span className="text-[7px] font-black text-neutral-400 uppercase shrink-0">guesser</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
