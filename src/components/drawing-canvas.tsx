"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Trash,
  Download,
  ArrowCounterClockwise,
  Hand,
  PencilSimple,
  Eraser,
} from "@phosphor-icons/react";

const COLORS = [
  "#000000",
  "#EF4444",
  "#3B82F6",
  "#22C55E",
  "#EAB308",
  "#A855F7",
  "#F97316",
  "#EC4899",
  "#6B7280",
  "#FFFFFF",
];

const SIZES = [3, 6, 12, 20];

interface DrawingCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundImage?: string | null;
}

export function DrawingCanvas({
  isOpen,
  onClose,
  backgroundImage,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = Math.max(window.innerWidth, 800);
    const ch = Math.max(window.innerHeight - 140, 600);

    canvas.width = cw;
    canvas.height = ch;

    // Fill white first
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cw, ch);

    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(cw / img.width, ch / img.height);
        const x = (cw - img.width * scale) / 2;
        const y = (ch - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(initCanvas, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initCanvas]);

  // Get canvas-relative coordinates (accounts for scroll)
  const getCanvasPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isPanning) {
        const container = containerRef.current;
        if (!container) return;
        panStartRef.current = {
          x: clientX,
          y: clientY,
          scrollLeft: container.scrollLeft,
          scrollTop: container.scrollTop,
        };
        return;
      }

      setIsDrawing(true);
      setHasDrawn(true);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pos = getCanvasPos(clientX, clientY);
      lastPosRef.current = pos;

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = isEraser ? "#FFFFFF" : color;
      ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Draw a dot for single clicks
      ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
      ctx.stroke();
    },
    [isPanning, isEraser, color, brushSize, getCanvasPos]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();

      if (isPanning && panStartRef.current) {
        const container = containerRef.current;
        if (!container) return;
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        const dx = clientX - panStartRef.current.x;
        const dy = clientY - panStartRef.current.y;
        container.scrollLeft = panStartRef.current.scrollLeft - dx;
        container.scrollTop = panStartRef.current.scrollTop - dy;
        return;
      }

      if (!isDrawing || !lastPosRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const pos = getCanvasPos(clientX, clientY);

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = isEraser ? "#FFFFFF" : color;
      ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastPosRef.current = pos;
    },
    [isPanning, isDrawing, isEraser, color, brushSize, getCanvasPos]
  );

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
    panStartRef.current = null;
  }, []);

  const clearCanvas = () => {
    initCanvas();
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "faithflow-drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-background/95 backdrop-blur shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
          <X size={20} />
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant={!isPanning ? "default" : "ghost"}
            size="icon"
            onClick={() => { setIsPanning(false); setIsEraser(false); }}
            className="h-9 w-9"
          >
            <PencilSimple size={18} />
          </Button>
          <Button
            variant={isPanning ? "default" : "ghost"}
            size="icon"
            onClick={() => { setIsPanning(true); setIsEraser(false); }}
            className="h-9 w-9"
          >
            <Hand size={18} />
          </Button>
          <Button
            variant={isEraser && !isPanning ? "default" : "ghost"}
            size="icon"
            onClick={() => { setIsEraser(true); setIsPanning(false); }}
            className="h-9 w-9"
          >
            <Eraser size={18} />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={clearCanvas} className="h-9 w-9">
            <ArrowCounterClockwise size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={downloadCanvas} className="h-9 w-9">
            <Download size={18} />
          </Button>
        </div>
      </div>

      {/* Scrollable Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100"
        style={{ cursor: isPanning ? "grab" : "crosshair" }}
      >
        <canvas
          ref={canvasRef}
          className="block touch-none"
          style={{ display: "block" }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      {/* Bottom Toolbar */}
      <div className="border-t bg-background/95 backdrop-blur shrink-0 pb-[env(safe-area-inset-bottom,0px)]">
        {/* Row 1: Colors */}
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); setIsPanning(false); }}
              className={`w-9 h-9 rounded-full border-2 transition-all shrink-0 ${
                color === c && !isEraser
                  ? "border-primary scale-110 ring-2 ring-primary/30"
                  : "border-white/20"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Row 2: Brush Sizes */}
        <div className="flex items-center justify-center gap-4 px-4 pb-3">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setBrushSize(s)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                brushSize === s ? "bg-primary/20 border-2 border-primary" : "bg-white/10 border-2 border-white/10"
              }`}
            >
              <div
                className="rounded-full bg-foreground"
                style={{ width: s + 2, height: s + 2 }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
