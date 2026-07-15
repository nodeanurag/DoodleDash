import { useCallback, useEffect, useRef } from 'react';
import { LuCloud, LuSparkles, LuPalette, LuSmile, LuPencil, LuTarget } from 'react-icons/lu';
import { CANVAS, type Stroke } from '@doodle/shared';
import { useGame } from '../store';
import { nextStrokeId } from '../util';
import { socket } from '../socket';

export type ClientTool = 'brush' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'star' | 'heart' | 'fill';

interface CanvasProps {
  drawable: boolean;
  tool: ClientTool;
  color: string;
  width: number;
}

const BG = '#ffffff';

function generateShapePoints(tool: ClientTool, start: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  if (tool === 'line') {
    pts.push(start, end);
  } else if (tool === 'rectangle') {
    pts.push(
      start,
      { x: end.x, y: start.y },
      end,
      { x: start.x, y: end.y },
      start
    );
  } else if (tool === 'circle') {
    const dxPixels = (end.x - start.x) * CANVAS.WIDTH;
    const dyPixels = (end.y - start.y) * CANVAS.HEIGHT;
    const rPixels = Math.sqrt(dxPixels * dxPixels + dyPixels * dyPixels);
    const rx = rPixels / CANVAS.WIDTH;
    const ry = rPixels / CANVAS.HEIGHT;
    for (let th = 0; th <= 2 * Math.PI + 0.1; th += Math.PI / 18) {
      pts.push({
        x: start.x + rx * Math.cos(th),
        y: start.y + ry * Math.sin(th),
      });
    }
  } else if (tool === 'triangle') {
    pts.push(
      { x: (start.x + end.x) / 2, y: start.y },
      end,
      { x: start.x, y: end.y },
      { x: (start.x + end.x) / 2, y: start.y }
    );
  } else if (tool === 'arrow') {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLength = 0.025;
    const p1 = {
      x: end.x - headLength * Math.cos(angle - Math.PI / 6),
      y: end.y - headLength * Math.sin(angle - Math.PI / 6)
    };
    const p2 = {
      x: end.x - headLength * Math.cos(angle + Math.PI / 6),
      y: end.y - headLength * Math.sin(angle + Math.PI / 6)
    };
    pts.push(start, end, p1, end, p2);
  } else if (tool === 'star') {
    const dxPixels = (end.x - start.x) * CANVAS.WIDTH;
    const dyPixels = (end.y - start.y) * CANVAS.HEIGHT;
    const R_pixels = Math.sqrt(dxPixels * dxPixels + dyPixels * dyPixels);
    const r_pixels = R_pixels * 0.4;
    const rxOuter = R_pixels / CANVAS.WIDTH;
    const ryOuter = R_pixels / CANVAS.HEIGHT;
    const rxInner = r_pixels / CANVAS.WIDTH;
    const ryInner = r_pixels / CANVAS.HEIGHT;
    for (let i = 0; i <= 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const currR_x = i % 2 === 0 ? rxOuter : rxInner;
      const currR_y = i % 2 === 0 ? ryOuter : ryInner;
      pts.push({
        x: start.x + currR_x * Math.cos(angle),
        y: start.y + currR_y * Math.sin(angle)
      });
    }
  } else if (tool === 'heart') {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    for (let th = 0; th <= 2 * Math.PI + 0.1; th += Math.PI / 18) {
      const xHeart = 16 * Math.pow(Math.sin(th), 3);
      const yHeart = -(13 * Math.cos(th) - 5 * Math.cos(2*th) - 2 * Math.cos(3*th) - Math.cos(4*th));
      const normX = xHeart / 16;
      const normY = (yHeart + 2.5) / 15;
      pts.push({
        x: start.x + (normX * dx) / 2 + dx / 2,
        y: start.y + (normY * dy) / 2 + dy / 2
      });
    }
  }
  return pts;
}

export function Canvas({ drawable, tool, color, width }: CanvasProps) {
  const { sendStroke, incomingStrokes, room, revealedWord } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const history = useRef<Stroke[]>([]);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const currentDragPoint = useRef<{ x: number; y: number } | null>(null);
  const activeId = useRef<string>('');
  const activePointerId = useRef<number | null>(null);

  // Placeholder for worker Ref
  const workerRef = useRef<any>(null);

  const paintStroke = useCallback((stroke: Stroke) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    if (stroke.tool === 'fill') {
      // Placeholder for flood fill in next commit
      return;
    }

    if (stroke.points.length === 0) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.tool === 'eraser' ? BG : stroke.color;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = (stroke.width / CANVAS.WIDTH) * canvas.width;

    const pts = stroke.points;
    if (pts.length === 1) {
      const p = pts[0];
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x * canvas.width, pts[0].y * canvas.height);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x * canvas.width, pts[i].y * canvas.height);
    }
    ctx.stroke();
  }, []);

  const repaintAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const s of history.current) paintStroke(s);
  }, [paintStroke]);

  const paintPreview = useCallback((ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }) => {
    const canvas = canvasRef.current!;
    ctx.lineWidth = (width / CANVAS.WIDTH) * canvas.width;
    ctx.strokeStyle = tool === 'eraser' ? BG : color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([4, 4]);

    const pts = generateShapePoints(tool, start, end);
    if (pts.length > 0) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x * canvas.width, pts[0].y * canvas.height);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * canvas.width, pts[i].y * canvas.height);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }, [tool, color, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      repaintAll();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [repaintAll]);

  useEffect(() => {
    const onStroke = (stroke: Stroke) => {
      const isDuplicate = history.current.some(
        (h) => h.id === stroke.id &&
               h.points.length === stroke.points.length &&
               h.points[0]?.x === stroke.points[0]?.x &&
               h.points[0]?.y === stroke.points[0]?.y
      );
      if (!isDuplicate) {
        history.current.push(stroke);
        paintStroke(stroke);
      }
    };

    const onClear = () => {
      history.current = [];
      repaintAll();
    };

    const onUndo = ({ id }: { id: string }) => {
      history.current = history.current.filter((s) => s.id !== id);
      repaintAll();
    };

    const onCatchup = (strokes: Stroke[]) => {
      history.current = [];
      for (const s of strokes) {
        history.current.push(s);
      }
      repaintAll();
    };

    socket.on('draw:stroke', onStroke);
    socket.on('draw:clear', onClear);
    socket.on('draw:undo', onUndo);
    socket.on('room:catchup', onCatchup);

    if (incomingStrokes && incomingStrokes.length > 0) {
      for (const s of incomingStrokes) {
        const isDuplicate = history.current.some((h) => h.id === s.id && h.points[0]?.x === s.points[0]?.x);
        if (!isDuplicate) {
          history.current.push(s);
        }
      }
      repaintAll();
    }

    return () => {
      socket.off('draw:stroke', onStroke);
      socket.off('draw:clear', onClear);
      socket.off('draw:undo', onUndo);
      socket.off('room:catchup', onCatchup);
    };
  }, [incomingStrokes, paintStroke, repaintAll]);

  const toRelative = (e: PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01((e.clientY - rect.top) / rect.height),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: PointerEvent) => {
      if (!drawable || e.button !== 0) return;
      if (activePointerId.current !== null) return;
      activePointerId.current = e.pointerId;

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {
        console.warn('Pointer capture failed:', err);
      }
      drawing.current = true;
      activeId.current = nextStrokeId();
      const p = toRelative(e);
      lastPoint.current = p;
      currentDragPoint.current = p;

      if (tool === 'fill') {
        // Placeholder for fill in next commit
      } else if (tool === 'brush' || tool === 'eraser') {
        const dot: Stroke = { id: activeId.current, tool: tool === 'eraser' ? 'eraser' : 'brush', color, width, points: [p] };
        history.current.push(dot);
        paintStroke(dot);
        sendStroke(dot);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return;
      if (!drawing.current || !lastPoint.current) return;
      e.preventDefault();
      const p = toRelative(e);
      currentDragPoint.current = p;

      if (tool === 'brush' || tool === 'eraser') {
        const segment: Stroke = {
          id: activeId.current,
          tool: tool === 'eraser' ? 'eraser' : 'brush',
          color,
          width,
          points: [lastPoint.current, p],
        };
        history.current.push(segment);
        paintStroke(segment);
        sendStroke(segment);
        lastPoint.current = p;
      } else {
        const ctx = canvas.getContext('2d')!;
        repaintAll();
        paintPreview(ctx, lastPoint.current, p);
      }
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return;
      activePointerId.current = null;
      if (!drawing.current || !lastPoint.current) return;
      drawing.current = false;
      const end = toRelative(e);
      const start = lastPoint.current;

      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}

      if (tool !== 'brush' && tool !== 'eraser' && tool !== 'fill') {
        const pts = generateShapePoints(tool, start, end);
        if (pts.length > 0) {
          const shapeStroke: Stroke = {
            id: activeId.current,
            tool: 'brush',
            color,
            width,
            points: pts,
          };
          history.current.push(shapeStroke);
          repaintAll();
          sendStroke(shapeStroke);
        }
      }

      lastPoint.current = null;
      currentDragPoint.current = null;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onUp);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onUp);
    };
  }, [drawable, tool, color, width, paintStroke, sendStroke, repaintAll, paintPreview]);

  const drawer = room?.players.find((p) => p.id === room.currentDrawerId);
  const showDrawerBadge = room?.phase === 'drawing' && drawer;

  return (
    <div className="relative mx-auto aspect-[1000/600] max-h-full w-full overflow-hidden rounded-[24px] bg-white border-2 border-[#252525] shadow-[4px_5px_0_rgba(37,37,37,0.08)] bg-paper-texture">
      <div className="absolute top-3 left-3 text-blue-500/10 pointer-events-none select-none">
        <LuCloud className="size-8" />
      </div>
      <div className="absolute top-3 right-3 text-yellow-500/10 pointer-events-none select-none">
        <LuSparkles className="size-8" />
      </div>
      <div className="absolute bottom-3 left-3 text-pink-500/10 pointer-events-none select-none">
        <LuPalette className="size-8" />
      </div>
      <div className="absolute bottom-3 right-3 text-orange-500/10 pointer-events-none select-none">
        <LuSmile className="size-8" />
      </div>

      {showDrawerBadge && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary/90 text-primary-foreground px-4 py-1.5 text-xs font-bold font-display shadow-lg border border-primary-foreground/10 flex items-center gap-1.5 animate-bounce select-none z-20">
          <LuPencil className="size-3.5 animate-pulse" />
          <span>{drawer.name} is drawing...</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="block size-full"
        style={{ cursor: drawable ? 'crosshair' : 'default', touchAction: 'none' }}
      />
      
      {revealedWord && (drawable || room?.phase === 'round-end') && (
        <div className="absolute top-3 left-3 rounded-full glass px-3.5 py-1.5 text-xs font-bold font-display shadow-lg border border-border/60 flex items-center gap-1.5 select-none text-foreground animate-pop-in z-20">
          <LuTarget className="size-3.5 text-primary animate-pulse shrink-0" />
          <span>The word is: <strong className="text-accent capitalize">{revealedWord}</strong></span>
        </div>
      )}

      {!drawable && !revealedWord && (
        <div className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur z-20">
          👀 Watch &amp; guess in the chat →
        </div>
      )}
    </div>
  );
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
