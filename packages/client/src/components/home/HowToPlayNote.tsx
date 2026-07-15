import { Pencil, MessageCircle, Star, Trophy } from 'lucide-react';

export function HowToPlayNote() {
  return (
    <div 
      className="relative w-[250px] bg-[#FFF1A8] rotate-[2deg] shadow-[4px_6px_0_rgba(40,40,40,0.08)] p-6 border border-[#DDD8D0]/40 rounded-[2px] select-none text-left 2xl:absolute 2xl:top-8 2xl:right-[-275px]"
    >
      {/* Tape pseudo-element */}
      <div 
        className="absolute top-[-11px] left-1/2 -translate-x-1/2 w-20 h-5 bg-[#6554D9]/15 shadow-3xs -rotate-2 border-l border-r border-[#252525]/5" 
      />

      {/* Title */}
      <h3 className="font-display font-bold text-[#222222] text-xl mb-4 text-center">
        How to play
      </h3>

      {/* Steps */}
      <div className="flex flex-col gap-4 font-sans">
        
        {/* Step 1 */}
        <div className="flex gap-2.5 items-start">
          <span className="text-xs font-black text-white bg-[#6554D9] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
            1
          </span>
          <div>
            <h4 className="font-extrabold text-[13px] text-[#222222] flex items-center gap-1">
              Draw <Pencil className="size-3 text-[#6554D9]" />
            </h4>
            <p className="text-[11px] font-semibold text-[#68666D] leading-tight">
              Sketch a secret word
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-2.5 items-start">
          <span className="text-xs font-black text-white bg-[#F8C843] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
            2
          </span>
          <div>
            <h4 className="font-extrabold text-[13px] text-[#222222] flex items-center gap-1">
              Guess <MessageCircle className="size-3 text-[#F8C843]" />
            </h4>
            <p className="text-[11px] font-semibold text-[#68666D] leading-tight">
              Type your guesses
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-2.5 items-start">
          <span className="text-xs font-black text-white bg-[#548CF6] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
            3
          </span>
          <div>
            <h4 className="font-extrabold text-[13px] text-[#222222] flex items-center gap-1">
              Score <Star className="size-3 text-[#548CF6]" />
            </h4>
            <p className="text-[11px] font-semibold text-[#68666D] leading-tight">
              Earn points
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-2.5 items-start">
          <span className="text-xs font-black text-white bg-[#17B978] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
            4
          </span>
          <div>
            <h4 className="font-extrabold text-[13px] text-[#222222] flex items-center gap-1">
              Win <Trophy className="size-3 text-[#17B978]" />
            </h4>
            <p className="text-[11px] font-semibold text-[#68666D] leading-tight">
              Highest score wins!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
