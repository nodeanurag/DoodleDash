import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { RoomState } from '@doodle/shared';
import { LuShare2, LuDownload, LuCopy } from 'react-icons/lu';
import { renderScoreboard } from '../scoreImage';
import { toast } from 'sonner';

interface FinalScoreboardProps {
  room: RoomState;
  myId: string;
  spectating: boolean;
  leaveRoom: () => void;
  startGame: () => void;
  onDownload: () => void;
}

export function FinalScoreboard({
  room,
  myId,
  spectating,
  leaveRoom,
  startGame,
  onDownload,
}: FinalScoreboardProps) {
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const amHost = room.hostId === myId;

  if (!winner) return null;

  const gameUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = `I survived a game of DoodleDash 🎨

${winner.name} won with ${winner.score} pts 👑

Think you can draw better? Probably not.`;

  const handleShareResult = async () => {
    try {
      const canvas = await renderScoreboard(room);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (!result) {
            reject(new Error("Failed to generate scoreboard image"));
            return;
          }
          resolve(result);
        }, "image/png");
      });

      const scoreFile = new File(
        [blob],
        `doodledash-${room.code}.png`,
        { type: "image/png" }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [scoreFile] })
      ) {
        await navigator.share({
          files: [scoreFile],
          text: shareText,
          url: gameUrl,
        });
        toast.success('Results shared!');
      } else {
        // Fallback to text sharing
        if (navigator.share) {
          await navigator.share({
            text: `${shareText}\n\nPlay DoodleDash: ${gameUrl}`,
          });
        } else {
          // WhatsApp text intent fallback
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `${shareText}\n\nPlay DoodleDash: ${gameUrl}`
          )}`;
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error('Error sharing result:', error);
      // Fallback to text intent on error
      try {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${shareText}\n\nPlay DoodleDash: ${gameUrl}`
        )}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch (fallbackError) {
        console.error('Fallback sharing failed:', fallbackError);
      }
    }
  };

  const handleCopyScorecard = async () => {
    try {
      const canvas = await renderScoreboard(room);
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            toast.success('Scoreboard image copied to clipboard!');
          } catch (err) {
            console.warn('Clipboard write failed:', err);
            toast.error('Failed to copy image');
          }
        }
      }, 'image/png');
    } catch (e) {
      console.error('Failed to copy scorecard:', e);
      toast.error('Failed to copy image');
    }
  };

  return (
    <div className="w-full min-h-screen bg-grid-doodle bg-paper-texture flex flex-col items-center justify-between py-10 px-4 select-none text-[#222222] relative">
      
      {/* Left Page Edge Decoration: Zigzag */}
      <img
        src="/assets/doodles/rough-zigzag.svg"
        alt=""
        className="absolute left-6 top-1/4 w-24 h-auto opacity-20 rotate-90 hidden lg:block pointer-events-none select-none"
      />

      {/* Outer content container */}
      <div className="w-full max-w-[760px] flex flex-col items-center my-auto relative">
        
        {/* Header section with Logo & Kalam annotation */}
        <div className="flex flex-col items-center mb-6 select-none relative">
          <img
            src="/logo.png"
            alt="DoodleDash Logo"
            className="h-10 md:h-12 w-auto object-contain transition-transform hover:scale-102 duration-200"
          />
          <span className="font-display text-[#6554D9] text-sm md:text-base mt-1.5 font-bold animate-float relative">
            game over!
            {/* Floating Star */}
            <img
              src="/assets/doodles/rough-star.svg"
              alt=""
              className="absolute -top-3 -right-6 w-5 h-5 pointer-events-none select-none"
            />
          </span>
        </div>

        {/* Winner Heading */}
        <h1 className="font-sans font-[900] text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-center text-[#222222] tracking-tight max-w-3xl mb-3">
          <span className="relative inline-block pb-3.5 mr-2">
            <span className="text-[#6554D9]">{winner.name}</span>
            <img
              src="/assets/doodles/rough-underline-pink.svg"
              alt=""
              className="absolute left-0 right-0 -bottom-1.5 w-full h-3 pointer-events-none select-none"
            />
          </span>
          won this mess.
        </h1>

        {/* Game Meta */}
        <p className="text-[#68666D] font-bold text-xs md:text-sm tracking-wider uppercase mb-8">
          Room {room.code} · {room.totalRounds} round{room.totalRounds === 1 ? '' : 's'} · {room.players.length} player{room.players.length === 1 ? '' : 's'}
        </p>

        {/* Winner Card Container */}
        <div className="relative w-full mb-8">
          {/* Crown Float */}
          <img
            src="/assets/doodles/rough-crown.svg"
            alt=""
            className="absolute -top-8 left-6 w-11 h-11 rotate-[-15deg] pointer-events-none select-none z-10"
          />
          {/* Arrow pointing to card */}
          <img
            src="/assets/doodles/rough-arrow.svg"
            alt=""
            className="absolute -right-12 -top-4 w-12 h-12 rotate-[15deg] hidden md:block pointer-events-none select-none"
          />

          {/* Winner Card */}
          <div
            className="w-full bg-white border-2 border-[#252525] rounded-[24px] shadow-[6px_7px_0_rgba(37,37,37,0.08)] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6"
            style={{ transform: 'rotate(-1deg)' }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left min-w-0">
              <span className="font-display font-[900] text-2xl text-[#6554D9] opacity-80 w-8 shrink-0">
                01
              </span>

              <Avatar className="size-[72px] md:size-[84px] border-2 border-[#252525] shrink-0 shadow-[2px_3px_0_rgba(37,37,37,0.15)]">
                <AvatarImage src={winner.avatarUrl} alt={winner.name} />
                <AvatarFallback style={{ background: winner.avatarColor }} className="text-black font-extrabold text-2xl">
                  {winner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center sm:items-start gap-1.5 min-w-0">
                <span className="font-sans font-[900] text-2xl md:text-3xl text-[#222222] truncate w-full max-w-[280px]">
                  {winner.name}
                  {winner.id === myId && <span className="text-[#68666D] text-sm font-normal"> (you)</span>}
                </span>
                <span className="bg-[#FFF1A8] border border-[#252525]/30 text-[#222222] text-[10px] md:text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider select-none shrink-0">
                  WINNER
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 shrink-0">
              <span className="font-sans font-[900] text-[#6554D9] text-5xl md:text-6xl tracking-tight">
                {winner.score}
              </span>
              <span className="text-[#68666D] text-sm font-extrabold font-sans">pts</span>
            </div>
          </div>
        </div>

        {/* Remaining Rankings */}
        {ranked.length > 1 && (
          <div className="w-full max-w-[700px] flex flex-col mb-6">
            {ranked.slice(1).map((p, i) => {
              const rank = i + 2;
              const rankStr = rank < 10 ? `0${rank}` : `${rank}`;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b-[1.5px] border-[#DDD8D0] py-4 px-3 bg-transparent text-[#222222]"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="font-sans font-[900] text-2xl text-[#6554D9] opacity-25 w-8 shrink-0">
                      {rankStr}
                    </span>
                    
                    <Avatar className="size-10 border border-[#252525] shrink-0 shadow-[1px_2px_0_rgba(37,37,37,0.1)]">
                      <AvatarImage src={p.avatarUrl} alt={p.name} />
                      <AvatarFallback style={{ background: p.avatarColor }} className="text-black font-bold text-sm">
                        {p.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <span className="font-sans font-extrabold text-base text-[#222222] truncate min-w-0 pr-2">
                      {p.name}
                      {p.id === myId && <span className="text-[#68666D] text-xs font-normal"> (you)</span>}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-1 font-sans font-extrabold text-base text-[#222222] shrink-0">
                    <span>{p.score}</span>
                    <span className="text-[#68666D] text-xs font-bold font-sans">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 w-full max-w-[400px] mt-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            {!spectating && amHost && (
              <button
                onClick={startGame}
                className="w-full sm:w-auto px-7 py-3 font-sans font-black text-white bg-[#6554D9] hover:bg-[#5746C7] border-2 border-[#252525] rounded-xl shadow-[3px_4px_0_rgba(37,37,37,1)] hover:translate-y-[-1px] active:translate-y-0.5 active:shadow-[1px_2px_0_rgba(37,37,37,1)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Play Again →
              </button>
            )}
            
            <button
              onClick={leaveRoom}
              className="w-full sm:w-auto px-7 py-3 font-sans font-black text-[#222222] bg-[#FFFCF7] hover:bg-[#F9F5EE] border-2 border-[#252525] rounded-xl shadow-[3px_4px_0_rgba(37,37,37,1)] hover:translate-y-[-1px] active:translate-y-0.5 active:shadow-[1px_2px_0_rgba(37,37,37,1)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Back Home
            </button>
          </div>

          {!spectating && !amHost && (
            <div className="w-full text-center text-[#68666D] font-bold text-xs md:text-sm animate-pulse mb-1">
              Waiting for the host to restart…
            </div>
          )}

          {/* Share & Download buttons */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-2 w-full">
            <button
              onClick={handleShareResult}
              className="px-3.5 py-1.5 font-sans font-bold text-xs text-[#68666D] hover:text-[#222222] bg-white border border-[#DDD8D0] rounded-lg transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <LuShare2 className="size-3.5" /> Share Result
            </button>
            
            <button
              onClick={handleCopyScorecard}
              className="px-3.5 py-1.5 font-sans font-bold text-xs text-[#68666D] hover:text-[#222222] bg-white border border-[#DDD8D0] rounded-lg transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <LuCopy className="size-3.5" /> Copy Scorecard
            </button>

            <button
              onClick={onDownload}
              className="px-3.5 py-1.5 font-sans font-bold text-xs text-[#68666D] hover:text-[#222222] bg-white border border-[#DDD8D0] rounded-lg transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <LuDownload className="size-3.5" /> Save Image
            </button>
            
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `${shareText}\n\nPlay DoodleDash: ${gameUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 font-sans font-bold text-xs text-[#68666D] hover:text-[#222222] bg-white border border-[#DDD8D0] rounded-lg transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <svg className="size-3 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </a>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `${shareText}\n\nPlay DoodleDash: ${gameUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 font-sans font-bold text-xs text-[#68666D] hover:text-[#222222] bg-white border border-[#DDD8D0] rounded-lg transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <svg className="size-3 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.666.988 3.311 1.503 5.351 1.504 5.254 0 9.53-4.27 9.533-9.524.002-2.546-.988-4.941-2.79-6.744a9.458 9.458 0 0 0-6.743-2.783c-5.26 0-9.537 4.274-9.54 9.53-.001 2.13.567 4.095 1.649 5.719L2.83 21.22l4.817-1.266zM17.43 14.18c-.302-.15-1.78-.88-2.057-.98-.277-.1-.48-.15-.68.15-.2.3-.77.98-.94 1.18-.172.2-.343.225-.645.075-.3-.15-1.27-.47-2.413-1.493-.89-.794-1.49-1.777-1.665-2.077-.175-.3-.02-.46.13-.61.137-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.68-1.64-.93-2.25-.246-.59-.496-.51-.68-.52-.18-.01-.38-.01-.58-.01-.2 0-.52.075-.79.375-.27.3-1.03 1-1.03 2.45s1.05 2.85 1.2 3.05c.15.2 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.84.11.56-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.08-.13-.28-.2-.58-.35z" />
              </svg>
              Send to WhatsApp
            </a>
          </div>
        </div>

      </div>

      {/* Footer microcopy */}
      <p className="font-display text-[#68666D] text-sm mt-8 select-none">
        gg. that was questionable.
      </p>
    </div>
  );
}
