import { useState } from 'react';
import { LuGithub, LuGlobe, LuShieldCheck, LuFileText } from 'react-icons/lu';
import { FaXTwitter } from 'react-icons/fa6';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export function Footer() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="w-full bg-secondary/30 border-t border-border/40 py-8 px-6 mt-12 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          {/* Left Side: Brand and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-display font-bold text-gradient text-lg">DoodleDash</span>
            <span className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} DoodleDash. Handcrafted for endless fun.
            </span>
          </div>

          {/* Middle Side: Social Links */}
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground font-semibold">
            <button
              onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }}
              className="hover:text-foreground transition-colors cursor-pointer text-xs font-semibold bg-transparent border-0 p-0"
            >
              Privacy Policy
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }}
              className="hover:text-foreground transition-colors cursor-pointer text-xs font-semibold bg-transparent border-0 p-0"
            >
              Terms of Service
            </button>
            <a 
              href="https://github.com/nodeanurag" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-foreground transition-colors flex items-center gap-1 text-xs"
            >
              <LuGithub className="size-4" /> GitHub
            </a>
            <a 
              href="https://x.com/anuragdotdev" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-foreground transition-colors flex items-center gap-1 text-xs"
            >
              <FaXTwitter className="size-3.5" /> X (Twitter)
            </a>
          </div>

          {/* Right Side: Language Select */}
          <div className="flex items-center gap-1.5 bg-secondary/80 border border-border/40 px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground">
            <LuGlobe className="size-3.5 text-primary" />
            <span>Language:</span>
            <select 
              className="bg-transparent outline-none text-foreground font-bold cursor-pointer pr-1"
              defaultValue="en"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </footer>

      {/* --- Privacy Policy Dialog --- */}
      <Dialog open={activeModal === 'privacy'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-lg rounded-modal bg-background border-border/80 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gradient flex items-center gap-2">
              <LuShieldCheck className="text-game-blue" /> Privacy Policy
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-sm mt-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
            <p className="text-muted-foreground">
              Welcome to DoodleDash! We respect your privacy and want to be completely transparent about how our game handles data.
            </p>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-foreground">1. What Data We Collect</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                DoodleDash is designed to be an ephemeral party game. We do not require registration or email sign-ups. We only process:
              </p>
              <ul className="list-disc pl-5 text-xs text-muted-foreground flex flex-col gap-1.5 mt-1">
                <li><strong>Nickname:</strong> A temporary display name you choose to identify yourself in the game room.</li>
                <li><strong>Avatar Customization:</strong> Color and style choices to render your character avatar (fetched via DiceBear API).</li>
                <li><strong>Drawing & Chat Data:</strong> Real-time canvas strokes and chat messages sent during an active session, which are synchronized live with other players in your room.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-foreground">2. How We Store and Use Data</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                All game data, including drawing paths, score lists, and room states, is stored strictly in-memory on our servers. This data is temporary and is immediately deleted when a room is closed or becomes empty.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-foreground">3. Local Browser Storage</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                We use your browser's local storage (<code className="bg-secondary px-1.5 py-0.5 rounded text-primary">localStorage</code>) to remember your chosen nickname, custom avatar preferences, selected theme (light/dark), and a list of recently visited rooms. This is entirely local to your device and never uploaded to our servers unless you join a room.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-foreground">4. No Tracking or Cookies</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                DoodleDash does not use persistent tracking cookies, third-party analytics trackers, or target ads. We keep things clean, simple, and private.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-border/40 pt-3">
              <p className="text-[10px] text-muted-foreground">
                Last updated: July 2026. If you have any questions or feedback, feel free to contact us on our GitHub repository.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Terms of Service Dialog --- */}
      <Dialog open={activeModal === 'terms'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-lg rounded-modal bg-background border-border/80 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gradient flex items-center gap-2">
              <LuFileText className="text-game-pink" /> Terms of Service
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-sm mt-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
            <p className="text-muted-foreground">
              By accessing and playing DoodleDash, you agree to comply with the following simple terms. Have fun and be nice!
            </p>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-foreground">1. Rules of Conduct</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                DoodleDash is a community space for creative play. By joining, you agree not to:
              </p>
              <ul className="list-disc pl-5 text-xs text-muted-foreground flex flex-col gap-1.5 mt-1">
                <li>Draw or write any content that is offensive, sexually explicit, abusive, or hateful.</li>
                <li>Harass or abuse other players in the chat panel.</li>
                <li>Use bots, automated guessing scripts, or canvas-manipulation hacks to gain an unfair advantage.</li>
              </ul>
              <p className="text-muted-foreground text-xs mt-1">
                Players violating these simple rules may be kicked from the room by the host or have their session disconnected.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-foreground">2. Ephemeral Service</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                DoodleDash is provided completely free of charge on an "as is" and "as available" basis. We reserve the right to modify, restart, or update game servers and active rooms at any time without prior notice.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-foreground">3. User-Generated Content</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Any drawings or messages made in a game room are generated by players. DoodleDash does not endorse, verify, or claim ownership of any user-submitted drawings or chat messages.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-foreground">4. Limitation of Liability</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                To the maximum extent permitted by law, DoodleDash and its contributors shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of or inability to use the game.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-border/40 pt-3">
              <p className="text-[10px] text-muted-foreground">
                Last updated: July 2026. Play fair, doodle creatively, and have a blast!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
