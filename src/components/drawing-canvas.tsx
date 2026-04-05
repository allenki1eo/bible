"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  ArrowCounterClockwise,
  Download,
  PencilSimple,
  Eraser,
  Star,
  Heart,
  SmileyWink,
} from "@phosphor-icons/react";

// Kid-friendly bright palette
const COLORS = [
  "#FF3B30", // red
  "#FF9500", // orange
  "#FFCC00", // yellow
  "#34C759", // green
  "#007AFF", // blue
  "#5856D6", // purple
  "#FF2D55", // pink
  "#AF52DE", // violet
  "#8B4513", // brown
  "#000000", // black
  "#FFFFFF", // white
];

const BRUSH_SIZES = [4, 8, 16, 28];

type Tool = "pen" | "eraser" | "stamp-star" | "stamp-heart" | "stamp-cross";

interface DrawingCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundImage?: string | null;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const innerAngle = angle + (2 * Math.PI) / 10;
    const x = cx + Math.cos(angle) * size;
    const y = cy + Math.sin(angle) * size;
    const ix = cx + Math.cos(innerAngle) * size * 0.4;
    const iy = cy + Math.sin(innerAngle) * size * 0.4;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size * 0.9;
  ctx.moveTo(cx, cy + s * 0.3);
  ctx.bezierCurveTo(cx, cy - s * 0.2, cx - s, cy - s * 0.2, cx - s, cy + s * 0.3);
  ctx.bezierCurveTo(cx - s, cy + s * 0.8, cx, cy + s * 1.2, cx, cy + s * 1.2);
  ctx.bezierCurveTo(cx, cy + s * 1.2, cx + s, cy + s * 0.8, cx + s, cy + s * 0.3);
  ctx.bezierCurveTo(cx + s, cy - s * 0.2, cx, cy - s * 0.2, cx, cy + s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCross(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  const arm = size * 0.3;
  ctx.beginPath();
  // Vertical bar
  ctx.rect(cx - arm, cy - size, arm * 2, size * 2);
  ctx.fill();
  // Horizontal bar (positioned in upper third of vertical bar)
  ctx.beginPath();
  ctx.rect(cx - size, cy - size * 0.4, size * 2, arm * 2);
  ctx.fill();
  ctx.restore();
}

export function DrawingCanvas({ isOpen, onClose, backgroundImage }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#007AFF");
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState<Tool>("pen");
  const [stampSize, setStampSize] = useState(24);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Physical canvas logical dimensions (set once per open)
  const canvasDimsRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 });

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const { dpr } = canvasDimsRef.current;
    return {
      x: ((clientX - rect.left) / rect.width) * (canvas.width / dpr),
      y: ((clientY - rect.top) / rect.height) * (canvas.height / dpr),
    };
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;

    canvasDimsRef.current = { w, h, dpr };

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Warm cream background
    ctx.fillStyle = "#FFFBEB";
    ctx.fillRect(0, 0, w, h);

    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const scale = Math.min(w / img.width, h / img.height) * 0.95;
        const x = (w - img.width * scale) / 2;
        const y = (h - img.height * scale) / 2;
        ctx.globalAlpha = 0.3;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.globalAlpha = 1;
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  useEffect(() => {
    if (!isOpen) return;
    setTool("pen");
    setColor("#007AFF");
    setBrushSize(8);
    // Wait for the DOM to be ready + the flex container to size itself
    const timer = setTimeout(initCanvas, 100);
    return () => clearTimeout(timer);
  }, [isOpen, initCanvas]);

  const applyStamp = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (tool === "stamp-star") drawStar(ctx, x, y, stampSize, color);
    if (tool === "stamp-heart") drawHeart(ctx, x, y - stampSize * 0.4, stampSize, color);
    if (tool === "stamp-cross") drawCross(ctx, x, y, stampSize, color);
  }, [tool, color, stampSize]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const pos = getCanvasCoords(e.clientX, e.clientY);

    if (tool === "stamp-star" || tool === "stamp-heart" || tool === "stamp-cross") {
      applyStamp(pos.x, pos.y);
      return;
    }

    setIsDrawing(true);
    lastPosRef.current = pos;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (tool === "eraser" ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#FFFBEB" : color;
    ctx.fill();
  }, [tool, brushSize, color, getCanvasCoords, applyStamp]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPosRef.current) return;
    if (tool === "stamp-star" || tool === "stamp-heart" || tool === "stamp-cross") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getCanvasCoords(e.clientX, e.clientY);
    const effectiveSize = tool === "eraser" ? brushSize * 2 : brushSize;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#FFFBEB" : color;
    ctx.lineWidth = effectiveSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPosRef.current = pos;
  }, [isDrawing, tool, brushSize, color, getCanvasCoords]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    initCanvas();
  }, [initCanvas]);

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "nuru-drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!isOpen) return null;

  const isStamp = tool === "stamp-star" || tool === "stamp-heart" || tool === "stamp-cross";

  return (
    <div className="fixed inset-0 z-[100] bg-amber-50 flex flex-col select-none">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b shadow-sm shrink-0 gap-2">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 shrink-0">
          <X size={20} />
        </Button>

        {/* Drawing tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTool("pen")}
            title="Pencil"
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${tool === "pen" ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <PencilSimple size={20} weight={tool === "pen" ? "fill" : "regular"} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            title="Eraser"
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${tool === "eraser" ? "bg-gray-100 text-gray-800 ring-2 ring-gray-400" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Eraser size={20} weight={tool === "eraser" ? "fill" : "regular"} />
          </button>

          {/* Stamp tools */}
          <button
            onClick={() => setTool("stamp-star")}
            title="Star stamp"
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${tool === "stamp-star" ? "bg-yellow-100 text-yellow-600 ring-2 ring-yellow-400" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Star size={20} weight={tool === "stamp-star" ? "fill" : "regular"} />
          </button>
          <button
            onClick={() => setTool("stamp-heart")}
            title="Heart stamp"
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${tool === "stamp-heart" ? "bg-pink-100 text-pink-600 ring-2 ring-pink-400" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Heart size={20} weight={tool === "stamp-heart" ? "fill" : "regular"} />
          </button>
          <button
            onClick={() => setTool("stamp-cross")}
            title="Cross stamp"
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${tool === "stamp-cross" ? "bg-purple-100 text-purple-600 ring-2 ring-purple-400" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <SmileyWink size={20} weight={tool === "stamp-cross" ? "fill" : "regular"} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={clearCanvas} className="h-9 w-9" title="Clear">
            <ArrowCounterClockwise size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={downloadCanvas} className="h-9 w-9" title="Save">
            <Download size={18} />
          </Button>
        </div>
      </div>

      {/* ── Canvas area ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{ cursor: isStamp ? "copy" : tool === "eraser" ? "cell" : "crosshair" }}
      >
        <canvas
          ref={canvasRef}
          className="block touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {/* ── Bottom toolbar ── */}
      <div className="bg-white border-t shadow-sm shrink-0 pb-[env(safe-area-inset-bottom,0px)]">
        {/* Colors row */}
        <div className="flex items-center justify-center gap-1.5 px-3 pt-3 pb-1 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }}
              className={`rounded-full transition-all shrink-0 border-2 ${
                color === c && tool !== "eraser"
                  ? "border-gray-800 scale-125 shadow-md"
                  : "border-white shadow-sm"
              }`}
              style={{
                backgroundColor: c,
                width: 28,
                height: 28,
                outline: c === "#FFFFFF" ? "1px solid #e5e7eb" : undefined,
              }}
            />
          ))}
        </div>

        {/* Brush / stamp size row */}
        <div className="flex items-center justify-center gap-3 px-4 py-2">
          {isStamp ? (
            // Stamp size picker
            [16, 24, 36, 50].map((s) => (
              <button
                key={s}
                onClick={() => setStampSize(s)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                  stampSize === s ? "border-primary bg-primary/10" : "border-gray-200 bg-gray-50"
                }`}
              >
                <span style={{ fontSize: s / 2.2 }}>⭐</span>
              </button>
            ))
          ) : (
            // Brush size picker
            BRUSH_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                  brushSize === s ? "border-primary bg-primary/10" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: Math.min(s, 26),
                    height: Math.min(s, 26),
                    backgroundColor: tool === "eraser" ? "#9ca3af" : color,
                  }}
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
