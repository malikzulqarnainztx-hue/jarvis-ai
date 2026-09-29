import React, { useEffect, useRef, useState } from "react";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  Hash,
} from "lucide-react";
import { HandPosition } from "../types";
import { jarvisAudio } from "../services/audioSpeech";

interface BitcoinMatrixProps {
  hand?: HandPosition;
  isGrabbed?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const BitcoinMatrix: React.FC<BitcoinMatrixProps> = ({
  hand,
  isGrabbed = false,
  scale = 1.0,
  onScaleChange,
}) => {
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const rotationAngleRef = useRef<number>(0);
  const isRotatingRef = useRef<boolean>(isRotating);
  isRotatingRef.current = isRotating;
  const [btcPrice, setBtcPrice] = useState<number>(94820);
  const [priceChange, setPriceChange] = useState<number>(+4.65);
  const [blockHeight, setBlockHeight] = useState<number>(888420);
  const [hashrate, setHashrate] = useState<string>("684.2 EH/s");
  const [latestHash, setLatestHash] = useState<string>(
    "00000000000000000002ab458c9df108e"
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If hand moves across horizontally, user can spin the coin with hand!
  useEffect(() => {
    if (hand && hand.isDetected && hand.gesture === "OPEN_PALM") {
      rotationAngleRef.current = (hand.x * 360) % 360;
    }
  }, [hand?.isDetected, hand?.gesture, hand?.x]);

  // Periodic random live fluctuations for authentic JARVIS terminal feel
  useEffect(() => {
    const timer = setInterval(() => {
      setBtcPrice((prev) => {
        const delta = (Math.random() - 0.48) * 45;
        return Math.round((prev + delta) * 100) / 100;
      });
      if (Math.random() > 0.7) {
        setBlockHeight((prev) => prev + 1);
        const chars = "0123456789abcdef";
        let newHash = "0000000000000000000";
        for (let i = 0; i < 14; i++) {
          newHash += chars[Math.floor(Math.random() * chars.length)];
        }
        setLatestHash(newHash);
      }
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // 3D Canvas Rendering of the Holographic Bitcoin via rAF without React re-render thrashing
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 240;
    canvas.height = 240;

    const render = () => {
      if (isRotatingRef.current) {
        rotationAngleRef.current = (rotationAngleRef.current + 0.8) % 360;
      }
      const angle = rotationAngleRef.current;

      const centerX = 120;
      const centerY = 120;
      const radius = 68;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radians
      const rad = (angle * Math.PI) / 180;
      const cosVal = Math.cos(rad);
      const sinVal = Math.sin(rad);

      // Glowing outer halo
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.4,
        centerX,
        centerY,
        radius * 1.5
      );
      grad.addColorStop(0, "rgba(245, 158, 11, 0.35)");
      grad.addColorStop(0.6, "rgba(245, 158, 11, 0.1)");
      grad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting particle rings
      ctx.strokeStyle = "rgba(245, 158, 11, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.3, radius * 0.45, rad * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // 3D Projected Ellipse Coin Face
      const coinWidth = Math.max(8, Math.abs(cosVal) * radius);
      const isFront = cosVal >= 0;

      // Coin Edge (Thickness)
      const thickness = 10 * Math.abs(sinVal);
      ctx.fillStyle = isFront ? "#b45309" : "#78350f";
      ctx.beginPath();
      ctx.ellipse(
        centerX + (sinVal > 0 ? thickness * 0.5 : -thickness * 0.5),
        centerY,
        coinWidth,
        radius,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Main Coin Face
      const faceGrad = ctx.createLinearGradient(
        centerX - coinWidth,
        centerY - radius,
        centerX + coinWidth,
        centerY + radius
      );
      faceGrad.addColorStop(0, "#fbbf24");
      faceGrad.addColorStop(0.5, "#f59e0b");
      faceGrad.addColorStop(1, "#d97706");

      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, coinWidth, radius, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim border
      ctx.strokeStyle = "#fef3c7";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner ring
      ctx.strokeStyle = "rgba(120, 53, 15, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, coinWidth * 0.85, radius * 0.85, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Bitcoin Symbol "₿" (drawn with 3D projection)
      if (coinWidth > 18) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(cosVal, 1);
        ctx.font = "bold 56px 'Orbitron', sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 12;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("₿", 0, -2);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSizeClick = (newScale: number) => {
    jarvisAudio.playRepulsorClick();
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 font-mono-tech text-amber-400 select-none overflow-hidden relative">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />

      {/* Top Bar with Status & Size Controller */}
      <div className="flex items-center justify-between z-10 border-b border-amber-500/30 pb-1.5 text-[10px]">
        <div className="flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-orbitron font-semibold text-amber-300 tracking-wider">
            BITCOIN CORE MATRIX
          </span>
        </div>

        {/* Hand Size Quick Controls (Small / Normal / Big) */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-amber-500 hidden sm:inline">HAND SIZING:</span>
          <button
            onClick={() => handleSizeClick(0.75)}
            className={`px-1.5 py-0.5 rounded-xs text-[9px] border transition-colors cursor-pointer ${
              scale <= 0.8
                ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                : "bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
            }`}
            title="Make Small with Hand Gesture or Click"
          >
            SMALL
          </button>
          <button
            onClick={() => handleSizeClick(1.0)}
            className={`px-1.5 py-0.5 rounded-xs text-[9px] border transition-colors cursor-pointer ${
              scale > 0.8 && scale < 1.3
                ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                : "bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
            }`}
            title="Standard Holographic Size"
          >
            MED
          </button>
          <button
            onClick={() => handleSizeClick(1.4)}
            className={`px-1.5 py-0.5 rounded-xs text-[9px] border transition-colors cursor-pointer ${
              scale >= 1.3
                ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                : "bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
            }`}
            title="Make Big with Hand Spread or Click"
          >
            BIG
          </button>
        </div>
      </div>

      {/* Middle Interactive Zone: 3D Holographic Coin & Live Market Stats */}
      <div className="relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-3 my-1">
        {/* 3D Coin Canvas */}
        <div
          className="relative flex items-center justify-center cursor-pointer group"
          onClick={() => setIsRotating(!isRotating)}
          title="Click or use hand to rotate Bitcoin"
        >
          <canvas
            ref={canvasRef}
            className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute -bottom-2 text-[8px] text-amber-300/80 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
            {isRotating ? "AUTOROTATE" : "MANUAL SYNC"}
          </div>
        </div>

        {/* Live Metrics Column */}
        <div className="flex-1 w-full flex flex-col justify-center gap-1.5 text-[10px]">
          {/* Price Block */}
          <div className="bg-slate-900/60 p-2 rounded-xs border border-amber-500/20">
            <div className="flex items-center justify-between text-amber-300/80 text-[9px]">
              <span>BTC / USD (TICKER)</span>
              <span className="flex items-center gap-0.5 text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                +{priceChange}%
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-orbitron font-bold text-white tracking-wider">
              ${btcPrice.toLocaleString()}
            </div>
          </div>

          {/* Telemetry Row */}
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="bg-slate-900/40 p-1.5 rounded-xs border border-amber-500/20">
              <span className="text-slate-400 block">BLOCK HEIGHT</span>
              <span className="text-amber-300 font-semibold font-orbitron">#{blockHeight}</span>
            </div>
            <div className="bg-slate-900/40 p-1.5 rounded-xs border border-amber-500/20">
              <span className="text-slate-400 block">NET HASHRATE</span>
              <span className="text-amber-300 font-semibold font-orbitron">{hashrate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hash & Gesture Prompt */}
      <div className="border-t border-amber-500/20 pt-1.5 flex items-center justify-between text-[9px] text-amber-400/80">
        <div className="flex items-center gap-1 truncate max-w-[65%]">
          <Hash className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate font-mono">{latestHash}</span>
        </div>
        <div className="text-amber-300 font-sans text-[9px] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>Hand Gestures: Spread to make BIG, Pinch to make SMALL</span>
        </div>
      </div>
    </div>
  );
};
