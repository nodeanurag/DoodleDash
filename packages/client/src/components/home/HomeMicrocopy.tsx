import { Github } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

export function HomeMicrocopy() {
  return (
    <footer className="w-full py-8 px-6 mt-12 border-t border-[#DDD8D0]/40 relative z-10 select-none">
      <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-extrabold text-[#68666D]">
        
        {/* Left */}
        <div className="flex items-center gap-1.5">
          <span>♡ Made for friends and bad drawings.</span>
        </div>

        {/* Middle / Right */}
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline">🏆 Draw. Guess. Laugh. Repeat.</span>
          
          <a 
            href="https://github.com/nodeanurag" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#222222] transition-colors flex items-center gap-1"
          >
            <Github className="size-3.5" /> GitHub
          </a>

          <a 
            href="https://x.com/anuragdotdev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#222222] transition-colors flex items-center gap-1"
          >
            <FaXTwitter className="size-3.5" /> X (Twitter)
          </a>
        </div>

      </div>
    </footer>
  );
}
