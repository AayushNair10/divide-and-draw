// src/components/game/DrawingCanvas.tsx
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { GameTimer } from "./GameTimer";

interface Player {
  name: string;
  quadrant: number;
}

interface DrawingCanvasProps {
  currentPlayer: Player;
  timeRemaining: number;
  currentPlayerIndex: number;
  getQuadrantLabel: (quadrant: number) => string;
  onSave?: (dataUrl: string) => void;
  autoClearOnTurnChange?: boolean;
  saveTrigger?: number;
  targetDimensions?: string; // Data URL of sketch to match dimensions
}

type Point = { x: number; y: number };
type Stroke = {
  points: Point[];
  color: string;
  width: number;
  isEraser?: boolean;
};

export const DrawingCanvas = ({
  currentPlayer,
  timeRemaining,
  currentPlayerIndex,
  getQuadrantLabel,
  onSave,
  autoClearOnTurnChange = true,
  saveTrigger,
  targetDimensions,
}: DrawingCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const strokesRef = useRef<Stroke[]>([]);
  const undoStackRef = useRef<Stroke[][]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const isDrawing = useRef(false);
  const lastPointerId = useRef<number | null>(null);
  const lastSaveTrigger = useRef<number | undefined>(undefined);

  const [targetSize, setTargetSize] = useState<{ w: number; h: number } | null>(null);
  const DPR = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;

  const [penWidth, setPenWidth] = useState(6);
  const [penColor, setPenColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);

  // Load target dimensions from sketch
  useEffect(() => {
    if (!targetDimensions) return;
    
    const img = new Image();
    img.onload = () => {
      setTargetSize({ w: img.width, h: img.height });
      console.log(`📐 Canvas target dimensions: ${img.width}x${img.height}`);
    };
    img.src = targetDimensions;
  }, [targetDimensions]);

  const getCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return targetSize || { w: 800, h: 800 };
    const rect = canvas.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  };

  const setCanvasDims = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !targetSize) return;

    const rect = container.getBoundingClientRect();
    const containerW = rect.width;
    
    // Maintain aspect ratio of target
    const aspectRatio = targetSize.h / targetSize.w;
    const cssW = Math.min(containerW, 900);
    const cssH = cssW * aspectRatio;

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    
    // Set actual canvas dimensions to match target
    canvas.width = targetSize.w;
    canvas.height = targetSize.h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // No DPR scaling - use exact target dimensions
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    redrawAll();
  };

  useEffect(() => {
    if (!targetSize) return;
    
    setCanvasDims();
    const ro = new ResizeObserver(() => setCanvasDims());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("orientationchange", setCanvasDims);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", setCanvasDims);
    };
  }, [targetSize]);

  const clientToRelative = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  };

  const drawStrokeOnCtx = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (!targetSize || !stroke || stroke.points.length === 0) return;
    const { w, h } = targetSize;
    
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = stroke.width;
    
    if (stroke.isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color;
    }

    const p0 = stroke.points[0];
    ctx.beginPath();
    ctx.moveTo(p0.x * w, p0.y * h);

    for (let i = 1; i < stroke.points.length; i++) {
      const p = stroke.points[i];
      const prev = stroke.points[i - 1];
      const midX = (prev.x + p.x) / 2;
      const midY = (prev.y + p.y) / 2;
      ctx.quadraticCurveTo(prev.x * w, prev.y * h, midX * w, midY * h);
    }
    ctx.stroke();
    ctx.restore();
  };

  const redrawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas || !targetSize) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const { w, h } = targetSize;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    
    for (const s of strokesRef.current) drawStrokeOnCtx(ctx, s);
  };

  const handlePointerDown = (e: PointerEvent) => {
    if ((e as any).button !== undefined && (e as any).button !== 0) return;
    const rel = clientToRelative(e.clientX, e.clientY);
    isDrawing.current = true;
    lastPointerId.current = e.pointerId;
    const stroke: Stroke = {
      points: [rel],
      color: penColor,
      width: penWidth,
      isEraser,
    };
    currentStrokeRef.current = stroke;
    strokesRef.current.push(stroke);
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {}
    redrawAll();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDrawing.current || !currentStrokeRef.current) return;
    if (lastPointerId.current != null && e.pointerId !== lastPointerId.current) return;
    const rel = clientToRelative(e.clientX, e.clientY);
    currentStrokeRef.current.points.push(rel);
    redrawAll();
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPointerId.current = null;
    if (currentStrokeRef.current) {
      undoStackRef.current.push([...strokesRef.current]);
      currentStrokeRef.current = null;
    }
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.touchAction = "none";

    const down = (e: PointerEvent) => handlePointerDown(e);
    const move = (e: PointerEvent) => handlePointerMove(e);
    const up = (e: PointerEvent) => handlePointerUp(e);

    canvas.addEventListener("pointerdown", down as EventListener);
    window.addEventListener("pointermove", move as EventListener);
    window.addEventListener("pointerup", up as EventListener);

    const touchPrevent = (ev: TouchEvent) => ev.preventDefault();
    canvas.addEventListener("touchstart", touchPrevent as EventListener, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", down as EventListener);
      window.removeEventListener("pointermove", move as EventListener);
      window.removeEventListener("pointerup", up as EventListener);
      canvas.removeEventListener("touchstart", touchPrevent as EventListener);
    };
  }, [penColor, penWidth, isEraser, targetSize]);

  const exportFullDataUrl = () => {
    const canvas = canvasRef.current;
    if (!canvas || !targetSize) return null;
    
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = targetSize.w;
    exportCanvas.height = targetSize.h;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return null;
    
    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(0, 0, targetSize.w, targetSize.h);
    
    for (const s of strokesRef.current) drawStrokeOnCtx(exportCtx, s);
    
    return exportCanvas.toDataURL("image/png");
  };

  useEffect(() => {
    if (saveTrigger === undefined) return;
    if (lastSaveTrigger.current === saveTrigger) return;
    lastSaveTrigger.current = saveTrigger;
    const dataUrl = exportFullDataUrl();
    if (dataUrl && onSave) onSave(dataUrl);
  }, [saveTrigger]);

  const handleUndo = () => {
    const prev = undoStackRef.current.pop();
    if (prev) {
      strokesRef.current = prev;
      redrawAll();
    }
  };

  const handleClear = () => {
    undoStackRef.current.push([...strokesRef.current]);
    strokesRef.current = [];
    redrawAll();
  };

  useEffect(() => {
    if (autoClearOnTurnChange) {
      undoStackRef.current.push([...strokesRef.current]);
      strokesRef.current = [];
      redrawAll();
    } else {
      redrawAll();
    }
  }, [currentPlayerIndex]);

  if (!targetSize) {
    return (
      <div className="lg:col-span-2">
        <Card className="sketch-border p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading canvas...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <Card className="sketch-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{currentPlayer.name}'s Turn</h2>
            <p className="text-muted-foreground">
              Draw the <span className="font-medium">{getQuadrantLabel(currentPlayer.quadrant)}</span> quadrant
            </p>
          </div>

          <div className="flex items-center gap-4">
            <GameTimer timeRemaining={timeRemaining} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              title="Pen color"
            />
            <input
              type="range"
              min={1}
              max={48}
              value={penWidth}
              onChange={(e) => setPenWidth(parseInt(e.target.value))}
              title="Pen size"
            />
            <button
              onClick={() => setIsEraser((v) => !v)}
              className={`px-2 py-1 rounded border ${isEraser ? "bg-red-50 border-red-300" : "bg-white"}`}
              title="Toggle eraser"
            >
              {isEraser ? "Eraser" : "Brush"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleUndo} className="px-3 py-1 border rounded">Undo</button>
            <button onClick={handleClear} className="px-3 py-1 border rounded">Clear</button>
          </div>
        </div>

        <div className="border border-border rounded-lg p-4 bg-card">
          <div ref={containerRef} style={{ width: "100%", maxWidth: "900px" }}>
            <canvas
              ref={canvasRef}
              className="w-full max-w-full border border-border rounded sketch-border cursor-crosshair touch-none"
              style={{ background: "#fff" }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DrawingCanvas;