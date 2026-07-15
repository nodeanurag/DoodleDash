import { useState, useEffect } from 'react';
import {
  LuBrush,
  LuEraser,
  LuTrash2,
  LuUndo,
  LuRedo,
  LuMinus,
  LuSquare,
  LuCircle,
  LuDroplet,
  LuTriangle,
  LuArrowUpRight,
  LuStar,
  LuHeart,
  LuPipette,
} from 'react-icons/lu';
import { DEFAULT_COLORS } from '@doodle/shared';
import { useGame } from '../store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ClientTool } from './Canvas';

export interface ToolState {
  tool: ClientTool;
  color: string;
  width: number;
  opacity: number;
}

interface ToolbarProps {
  state: ToolState;
  onChange: (next: ToolState) => void;
}

const SHAPES = [
  { id: 'line', label: 'Line', icon: LuMinus },
  { id: 'rectangle', label: 'Rectangle', icon: LuSquare },
  { id: 'circle', label: 'Circle', icon: LuCircle },
  { id: 'triangle', label: 'Triangle', icon: LuTriangle },
  { id: 'arrow', label: 'Arrow', icon: LuArrowUpRight },
  { id: 'star', label: 'Star', icon: LuStar },
  { id: 'heart', label: 'Heart', icon: LuHeart },
] as const;

const BRUSH_SIZES = [
  { id: 'xs', size: 4, label: 'XS' },
  { id: 's', size: 10, label: 'S' },
  { id: 'm', size: 18, label: 'M' },
  { id: 'l', size: 28, label: 'L' },
  { id: 'xl', size: 40, label: 'XL' },
] as const;

export function Toolbar({ state, onChange }: ToolbarProps) {
  const { clearCanvas, undo, redo, canUndo, canRedo } = useGame();
  const [showShapes, setShowShapes] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const handleToolSelect = (tool: ClientTool) => {
    onChange({ ...state, tool });
  };

  const handleColorSelect = (c: string) => {
    onChange({ ...state, color: c });
    if (!(DEFAULT_COLORS as readonly string[]).includes(c)) {
      setRecentColors((prev) => {
        const filtered = prev.filter((x) => x !== c);
        return [c, ...filtered].slice(0, 5);
      });
    }
  };

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  const triggerEyeDropper = async () => {
    if (!hasEyeDropper) return;
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      handleColorSelect(result.sRGBHex);
    } catch (err) {
      console.log('EyeDropper failed:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }
      else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
      else if (key === 'b' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToolSelect('brush');
      }
      else if (key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToolSelect('fill');
      }
      else if (key === 'i' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (hasEyeDropper) triggerEyeDropper();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, state, onChange]);

  const isShapeActive = SHAPES.some((s) => s.id === state.tool);
  const ActiveShapeIcon = SHAPES.find((s) => s.id === state.tool)?.icon || LuSquare;

  return (
    <Card className="flex flex-row items-center gap-3 px-4 py-2.5 rounded-[24px] border-2 border-[#252525] shadow-[4px_5px_0_rgba(37,37,37,0.08)] overflow-x-auto w-full max-w-full md:flex-wrap md:overflow-visible scrollbar-none shrink-0 bg-white select-none">
      
      <div className="flex items-center shrink-0 gap-1.5 bg-secondary/50 p-1.5 rounded-btn border border-[#252525]">
        <div className="grid grid-rows-2 grid-cols-6 gap-1 shrink-0">
          {DEFAULT_COLORS.map((c) => {
            const active =
              state.color === c &&
              state.tool !== 'eraser' &&
              state.tool !== 'line' &&
              !isShapeActive;
            return (
              <button
                key={c}
                type="button"
                aria-label={`color ${c}`}
                className={cn(
                  'size-5 rounded-xs border border-black/30 hover:scale-105 active:scale-95 cursor-pointer shrink-0 transition-all',
                  active && 'border-white ring-2 ring-black',
                )}
                style={{ background: c }}
                onClick={() => handleColorSelect(c)}
              />
            );
          })}
        </div>
        
        <label
          className="border border-[#252525] grid size-11 cursor-pointer place-items-center overflow-hidden rounded-xs bg-gradient-to-br from-red-500 via-green-500 to-blue-500 hover:scale-105 active:scale-95 transition-all shrink-0 shadow-[1px_2px_0_rgba(0,0,0,0.04)]"
          title="Custom color picker"
        >
          <input
            type="color"
            className="size-16 cursor-pointer opacity-0"
            value={state.color}
            onChange={(e) => handleColorSelect(e.target.value)}
          />
        </label>
 
        {hasEyeDropper && (
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-xs border border-[#252525] bg-white text-black hover:bg-secondary shrink-0 shadow-[1px_2px_0_rgba(0,0,0,0.04)]"
            onClick={triggerEyeDropper}
            title="Eyedropper picker (I)"
          >
            <LuPipette className="size-4" />
          </Button>
        )}
      </div>

      {recentColors.length > 0 && (
        <div className="hidden lg:flex items-center gap-1 border-l-2 border-black/20 pl-2 shrink-0">
          {recentColors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`recent color ${c}`}
              className={cn(
                'size-5 rounded-xs border-2 border-black/30 transition-all hover:scale-110 cursor-pointer shrink-0',
                state.color === c && 'ring-2 ring-primary ring-offset-1',
              )}
              style={{ background: c }}
              onClick={() => handleColorSelect(c)}
            />
          ))}
        </div>
      )}

      <Separator orientation="vertical" className="hidden md:block h-6 bg-black/20" />

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleToolSelect('brush')}
          className={cn(
            "h-8 px-2.5 rounded-btn border-2 border-[#252525] font-bold text-xs cursor-pointer flex items-center gap-1 shadow-[1.5px_2px_0_rgba(37,37,37,0.08)] active:translate-y-0.5",
            state.tool === 'brush' ? "bg-primary text-primary-foreground font-black" : "bg-white text-black hover:bg-secondary"
          )}
          title="Brush tool (B)"
        >
          <LuBrush className="size-3.5" /> Brush
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleToolSelect('eraser')}
          className={cn(
            "h-8 px-2.5 rounded-btn border-2 border-[#252525] font-bold text-xs cursor-pointer flex items-center gap-1 shadow-[1.5px_2px_0_rgba(37,37,37,0.08)] active:translate-y-0.5",
            state.tool === 'eraser' ? "bg-primary text-primary-foreground font-black" : "bg-white text-black hover:bg-secondary"
          )}
          title="Eraser tool"
        >
          <LuEraser className="size-3.5" /> Eraser
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleToolSelect('fill')}
          className={cn(
            "h-8 px-2.5 rounded-btn border-2 border-[#252525] font-bold text-xs cursor-pointer flex items-center gap-1 shadow-[1.5px_2px_0_rgba(37,37,37,0.08)] active:translate-y-0.5",
            state.tool === 'fill' ? "bg-primary text-primary-foreground font-black" : "bg-white text-black hover:bg-secondary"
          )}
          title="Fill region (F)"
        >
          <LuDroplet className="size-3.5" /> Fill
        </Button>
      </div>

      <Separator orientation="vertical" className="hidden md:block h-6 bg-black/20" />

      <div className="relative shrink-0">
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "h-8 px-2.5 rounded-btn border-2 border-[#252525] font-bold text-xs cursor-pointer flex items-center gap-1 shadow-[1.5px_2px_0_rgba(37,37,37,0.08)] active:translate-y-0.5",
            isShapeActive ? "bg-primary text-primary-foreground font-black" : "bg-white text-black hover:bg-secondary"
          )}
          onClick={() => setShowShapes(!showShapes)}
          title="Shapes menu"
        >
          <ActiveShapeIcon className="size-3.5" /> Shapes
        </Button>
        
        {showShapes && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowShapes(false)} />
            <Card className="absolute bottom-11 left-0 z-40 p-1.5 grid grid-cols-4 gap-1 min-w-[140px] shadow-[3px_4px_0_rgba(37,37,37,0.08)] border-2 border-[#252525] rounded-btn bg-white">
              {SHAPES.map((sh) => {
                const Icon = sh.icon;
                return (
                  <Button
                    key={sh.id}
                    variant={state.tool === sh.id ? 'default' : 'ghost'}
                    size="icon"
                    className="size-8 rounded-xs border border-transparent hover:border-black/20 cursor-pointer"
                    onClick={() => {
                      handleToolSelect(sh.id);
                      setShowShapes(false);
                    }}
                    title={sh.label}
                  >
                    <Icon className="size-3.5" />
                  </Button>
                );
              })}
            </Card>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 border-l-2 border-black/10 pl-3 ml-1">
        <span className="text-[10px] font-black text-muted-foreground uppercase mr-1 select-none">Size</span>
        <div className="flex items-center gap-1.5">
          {BRUSH_SIZES.map((sz) => {
            const active = state.width === sz.size;
            const dotSize = 4 + (sz.size / 40) * 12;
            return (
              <button
                key={sz.id}
                type="button"
                onClick={() => onChange({ ...state, width: sz.size })}
                className={cn(
                  "size-8 rounded-btn border-2 border-[#252525] flex items-center justify-center cursor-pointer transition-all active:translate-y-0.5 shadow-[1.5px_2px_0_rgba(37,37,37,0.08)]",
                  active ? "bg-primary text-primary-foreground font-black" : "bg-white text-black hover:bg-secondary"
                )}
                title={`Brush Size ${sz.label}`}
              >
                <span
                  className="rounded-full bg-current"
                  style={{
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <Separator orientation="vertical" className="hidden md:block h-6 bg-black/20" />

      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={undo}
          disabled={!canUndo}
          className="size-8 rounded-btn border-2 border-[#252525] bg-white text-black hover:bg-secondary shadow-[1.5px_2px_0_rgba(37,37,37,0.08)] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
          title="Undo last stroke (Ctrl+Z)"
        >
          <LuUndo className="size-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={redo}
          disabled={!canRedo}
          className="size-8 rounded-btn border-2 border-[#252525] bg-white text-black hover:bg-secondary shadow-[1.5px_2px_0_rgba(37,37,37,0.08)] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
          title="Redo stroke (Ctrl+Shift+Z)"
        >
          <LuRedo className="size-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={clearCanvas}
          className="size-8 rounded-btn border-2 border-[#252525] bg-red-100 text-red-600 hover:bg-red-200 shadow-[1.5px_2px_0_rgba(37,37,37,0.08)] active:translate-y-0.5 cursor-pointer"
          title="Clear whole board"
        >
          <LuTrash2 className="size-4" />
        </Button>
      </div>

    </Card>
  );
}
