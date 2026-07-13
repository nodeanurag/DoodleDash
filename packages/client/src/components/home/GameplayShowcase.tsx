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
          </div>
        </div>
      </div>
    </section>
  );
}
