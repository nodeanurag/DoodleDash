import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  ZigzagDoodle, 
  StarDoodle, 
  HeartDoodle, 
  CrownDoodle, 
  ArrowDoodle, 
  UnderlinePinkDoodle, 
  UnderlineYellowDoodle, 
  BrushPurpleDoodle 
} from './DoodleDecoration';

interface HeroProps {
  onHostClick: () => void;
  onJoinClick: () => void;
}

export function Hero({ onHostClick, onJoinClick }: HeroProps) {
  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-10 pb-8 md:pt-[72px] md:pb-[64px] min-h-auto">
      {/* Left Column: Playful Heading and CTAs */}
      <div className="lg:col-span-7 flex flex-col items-start text-left select-none">
        
        {/* Kalam Heading */}
        <h1 className="font-display text-[48px] sm:text-[62px] md:text-[76px] lg:text-[84px] xl:text-[90px] font-black tracking-tight leading-[0.9] text-[#222222] flex flex-col gap-1.5 md:gap-3">
          <span>Draw bad.</span>
          <span>Guess fast.</span>
          <span className="relative inline-block text-[#6554D9] pb-2">
            Laugh at your friends.
            <UnderlinePinkDoodle className="absolute left-0 bottom-0 w-full h-[12px] md:h-[15px]" />
          </span>
        </h1>

        {/* Copy */}
        <div className="mt-8 text-[17px] md:text-[19px] font-extrabold text-[#68666D] leading-relaxed flex flex-col gap-0.5">
          <span>Multiplayer drawing chaos.</span>
          <span className="flex items-center gap-1.5 flex-wrap">
            <span className="relative inline-block">
              No signup.
              <UnderlineYellowDoodle className="absolute left-0 bottom-[-4px] w-full h-[6px]" />
            </span>
            <span>Just send the code.</span>
          </span>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4 mt-9 flex-wrap w-full sm:w-auto">
          <Button
            onClick={onHostClick}
            className="w-full sm:w-auto btn-game-primary font-extrabold px-7 h-[50px] text-sm shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            Host a Game <Play className="size-4 fill-current" />
          </Button>

          <Button
            onClick={onJoinClick}
            variant="outline"
            className="w-full sm:w-auto bg-[#FFFCF7] border-2 border-[#252525] hover:bg-[#FDF9F0] text-[#222222] font-extrabold px-7 h-[50px] text-sm shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            Join with Code →
          </Button>
        </div>
      </div>

      {/* Right Column: Prominent Mascot / Logo composited in space */}
      <div className="lg:col-span-5 relative flex items-center justify-center mt-6 lg:mt-0">
        <div className="relative w-full max-w-[480px] flex items-center justify-center">
          
          {/* Background brush stroke */}
          <BrushPurpleDoodle className="absolute inset-0 size-full text-[#6554D9]/12 scale-110 pointer-events-none" />
          
          {/* Floating Accents */}
          <ZigzagDoodle className="absolute -top-10 left-6 text-[#FF5C93] w-12 h-auto hidden md:block animate-float-reverse pointer-events-none" />
          <StarDoodle className="absolute top-4 right-4 text-[#F8C843] size-6 hidden md:block animate-float pointer-events-none" style={{ animationDelay: '-1s' }} />
          <CrownDoodle className="absolute -top-12 right-24 text-[#F8C843] size-10 hidden md:block animate-float-reverse pointer-events-none" style={{ animationDelay: '-2s' }} />
          <HeartDoodle className="absolute bottom-6 left-10 text-[#FF5C93] size-6 hidden md:block animate-float pointer-events-none" style={{ animationDelay: '-3s' }} />
          <ArrowDoodle className="absolute bottom-[-16px] right-24 text-[#20BFA9] w-10 h-auto hidden md:block animate-float-reverse pointer-events-none" style={{ animationDelay: '-4s' }} />
          <StarDoodle className="absolute bottom-8 right-8 text-[#548CF6] size-5 hidden md:block animate-float pointer-events-none" style={{ animationDelay: '-5s' }} />
          
          {/* Logo artwork */}
          <img
            src="/logo.png"
            alt="DoodleDash Logo Illustration"
            className="w-full h-auto object-contain select-none z-10 filter drop-shadow-xs relative transition-transform hover:scale-102 duration-300"
          />
        </div>
      </div>
    </section>
  );
}
