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
      </div>
    </section>
  );
}
