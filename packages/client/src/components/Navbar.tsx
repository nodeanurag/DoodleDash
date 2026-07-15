import { useState } from 'react';
import { BookOpen, Palette, Lightbulb, Trophy } from 'lucide-react';
import { useGame } from '../store';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface NavbarProps {
  onScrollToHowItWorks?: () => void;
}

export function Navbar({ onScrollToHowItWorks }: NavbarProps) {
  const { connected, globalPlayerCount } = useGame();
  const [activeModal, setActiveModal] = useState<'howtoplay' | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleHowToPlay = () => {
    if (onScrollToHowItWorks) {
      onScrollToHowItWorks();
    } else {
      setActiveModal('howtoplay');
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 w-full h-16 md:h-[72px] flex items-center bg-[#FFFCF7] border-b border-[rgba(34,34,34,0.08)] shadow-none select-none"
      >
        <div className="max-w-[1240px] w-full mx-auto px-6 flex items-center justify-between">
          
          {/* Logo with hand-drawn brand detail */}
          <div 
            className="flex items-center cursor-pointer relative" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src="/logo.png"
              alt="DoodleDash Logo"
              className="h-10 md:h-[50px] w-auto object-contain transition-transform hover:scale-102 duration-200"
            />
            {/* Hand-drawn yellow star doodle next to the logo */}
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#F8C843" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-[#F8C843] w-[15px] h-[15px] absolute top-[-5px] right-[-14px] md:right-[-12px] rotate-[15deg] pointer-events-none animate-float"
            >
              <path d="M12 2 Q12 12 2 12 Q12 12 12 22 Q12 12 22 12 Q12 12 12 2" />
            </svg>
          </div>

          {/* Right Side Nav Actions */}
          <div className="flex items-center gap-4 md:gap-5">
            
            {/* How to play Link (hidden on mobile) */}
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleHowToPlay}
              className="hidden md:flex group relative items-center gap-2 text-sm font-extrabold text-[#343238] hover:text-[#6554D9] transition-colors cursor-pointer select-none border-none bg-transparent py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6554D9]/20 rounded-md"
            >
              <BookOpen className="size-[18px] text-[#6554D9] group-hover:scale-105 transition-transform" />
              <span>How to play</span>
              
              {/* Hand-drawn vector hover underline */}
              <span className={cn(
                "absolute left-0 right-0 bottom-[-4px] h-2 transition-all duration-200 pointer-events-none opacity-0 scale-x-95",
                isHovered && "opacity-100 scale-x-100"
              )}>
                <svg className="w-full h-full text-[#6554D9] fill-none stroke-current stroke-[3.5] stroke-linecap-round" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 2,5 Q 50,2 98,7" />
                </svg>
              </span>
            </button>

            {/* Hand-drawn vertical separator */}
            <svg 
              className="w-2.5 h-6 text-[#DDD8D0] stroke-current stroke-[2.5] stroke-linecap-round hidden md:block opacity-80" 
              viewBox="0 0 10 30" 
              fill="none"
            >
              <path d="M 4,2 Q 6,15 3,28" />
            </svg>

            {/* Live Player Status Pill */}
            <div 
              className={cn(
                "flex items-center gap-2 rounded-full border border-[rgba(34,34,34,0.10)] bg-[rgba(255,255,255,0.65)] select-none text-xs sm:text-sm font-extrabold text-[#343238] shadow-3xs",
                "px-2.5 py-1 text-[11px] md:px-3.5 md:py-2 md:text-sm"
              )}
            >
              {connected ? (
                <>
                  <span className="h-[7px] w-[7px] bg-[#17B978] rounded-full inline-block animate-pulse shrink-0" />
                  <span>
                    {globalPlayerCount} online
                  </span>
                </>
              ) : (
                <span className="text-[#68666D]">
                  Connecting…
                </span>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* --- How To Play Modal --- */}
      <Dialog open={activeModal === 'howtoplay'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-md rounded-[20px] bg-white border-2 border-[#252525] shadow-[6px_7px_0_rgba(37,37,37,0.08)] p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-extrabold text-[#222222] flex items-center gap-2">
              <BookOpen className="text-[#6554D9] size-5" /> How to Play
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-sm mt-3">
            <div className="flex gap-3 items-start bg-[#EEEAFE] p-3.5 rounded-[11px] border border-[#DDD8D0]">
              <span className="grid size-8 place-items-center bg-white text-[#6554D9] rounded-[8px] shrink-0 border border-[#DDD8D0]">
                <Palette className="size-4.5" />
              </span>
              <div>
                <h4 className="font-bold text-[#222222]">1. Choose or Draw</h4>
                <p className="text-[#68666D] text-xs mt-0.5 font-medium">When it's your turn, choose a secret word and draw it on the canvas for others to guess.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start bg-[#FFF1A8] p-3.5 rounded-[11px] border border-[#DDD8D0]">
              <span className="grid size-8 place-items-center bg-white text-[#F8C843] rounded-[8px] shrink-0 border border-[#DDD8D0]">
                <Lightbulb className="size-4.5" />
              </span>
              <div>
                <h4 className="font-bold text-[#222222]">2. Guess Quickly</h4>
                <p className="text-[#68666D] text-xs mt-0.5 font-medium">If you're guessing, type in the chat panel. Points are awarded based on how fast you guess correctly.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start bg-[#E7F8F1] p-3.5 rounded-[11px] border border-[#DDD8D0]">
              <span className="grid size-8 place-items-center bg-white text-[#17B978] rounded-[8px] shrink-0 border border-[#DDD8D0]">
                <Trophy className="size-4.5" />
              </span>
              <div>
                <h4 className="font-bold text-[#222222]">3. Score & Win</h4>
                <p className="text-[#68666D] text-xs mt-0.5 font-medium">Earn points as a drawer when players guess your drawing. The player with the highest score wins!</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
