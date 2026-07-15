import { LuPencil } from 'react-icons/lu';
import { useGame } from '../store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/** Shown to the drawer during the 'choosing' phase to pick one of three words. */
export function WordChoiceModal() {
  const { wordChoices, chooseWord, room, myId } = useGame();

  const amDrawer = room?.currentDrawerId === myId;
  const open = Boolean(wordChoices && room?.phase === 'choosing' && amDrawer);

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="border-border sm:max-w-md">
        <DialogHeader className="items-center">
          <span className="mb-1 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-yellow-400 to-blue-500 shadow-lg shadow-blue-500/20">
            <LuPencil className="size-6 text-white" />
          </span>
          <DialogTitle className="font-display text-center text-2xl">
            Choose a word to draw
          </DialogTitle>
          <DialogDescription className="text-center">
            Pick quickly — one is auto-selected when the timer runs out.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2.5 py-2">
          {wordChoices?.map((w) => (
            <Button
              key={w}
              size="lg"
              className="font-display h-12 text-lg capitalize"
              onClick={() => chooseWord(w)}
            >
              {w}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
