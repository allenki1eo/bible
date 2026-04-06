"use client";

import { useRef } from "react";
import { useToast } from "@/components/toast";
import { ShareNetwork } from "@phosphor-icons/react";

interface Props {
  content: string;
  authorName: string;
  isAnonymous: boolean;
  locale?: string;
}

/** Draws a shareable 1080×1080 testimony image using Canvas API */
function drawCard(
  canvas: HTMLCanvasElement,
  content: string,
  displayName: string
): void {
  const W = 1080;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── background gradient (forest green → dark green) ──────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1a4731");
  bg.addColorStop(1, "#0f2b1e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // subtle radial glow top-center
  const glow = ctx.createRadialGradient(W / 2, 120, 0, W / 2, 120, 420);
  glow.addColorStop(0, "rgba(74,222,128,0.18)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── decorative top cross ornament ─────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  const cx = W / 2;
  // horizontal line
  ctx.beginPath(); ctx.moveTo(cx - 60, 90); ctx.lineTo(cx + 60, 90); ctx.stroke();
  // vertical line
  ctx.beginPath(); ctx.moveTo(cx, 60); ctx.lineTo(cx, 120); ctx.stroke();

  // ── "Nuru" wordmark ───────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.90)";
  ctx.font = "bold 52px serif";
  ctx.textAlign = "center";
  ctx.fillText("Nuru", cx, 190);

  // tagline
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "28px sans-serif";
  ctx.fillText("Grow in faith, together.", cx, 240);

  // ── divider ───────────────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(100, 275); ctx.lineTo(W - 100, 275); ctx.stroke();

  // ── large quote marks ─────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(74,222,128,0.35)";
  ctx.font = "bold 180px serif";
  ctx.textAlign = "left";
  ctx.fillText("\u201C", 72, 420);

  // ── testimony text (wrapped) ──────────────────────────────────────────────
  const maxWidth = W - 200;
  const lineHeight = 58;
  const startY = 360;
  const maxLines = 8;

  ctx.fillStyle = "rgba(255,255,255,0.93)";
  ctx.font = "italic 42px serif";
  ctx.textAlign = "center";

  const words = content.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (lines.length < maxLines - 1) {
        lines.push(current);
        current = word;
      } else {
        current = test.slice(0, -4) + "…";
        break;
      }
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const totalTextH = lines.length * lineHeight;
  const textStartY = startY + (maxLines * lineHeight - totalTextH) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, textStartY + i * lineHeight);
  });

  // ── author ────────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`— ${displayName}`, cx, 860);

  // ── bottom divider ────────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(100, 900); ctx.lineTo(W - 100, 900); ctx.stroke();

  // ── footer ────────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.30)";
  ctx.font = "26px sans-serif";
  ctx.fillText("nuru1.vercel.app", cx, 960);
}

export function ShareTestimonyCard({ content, authorName, isAnonymous, locale = "en" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const isSw = locale === "sw";
  const displayName = isAnonymous ? (isSw ? "Asiyejulikana" : "Anonymous") : authorName;

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawCard(canvas, content, displayName);

    try {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("Canvas export failed");

      const file = new File([blob], "nuru-testimony.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Nuru — Testimony",
          text: isSw ? "Ushuhuda kutoka Nuru" : "A testimony from Nuru",
        });
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nuru-testimony.png";
        a.click();
        URL.revokeObjectURL(url);
        toast(isSw ? "Picha imepakuliwa" : "Image downloaded — share it on WhatsApp or Instagram", "success");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast(isSw ? "Kushiriki kumeshindwa" : "Share failed", "error");
      }
    }
  };

  return (
    <>
      {/* hidden canvas used for drawing */}
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-all duration-200 active:scale-95"
        title={isSw ? "Shiriki kama picha" : "Share as image"}
      >
        <ShareNetwork size={14} />
        {isSw ? "Shiriki" : "Share"}
      </button>
    </>
  );
}
