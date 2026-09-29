import React from "react";
import { Hand, ZoomIn, ZoomOut, Maximize2, Minimize2, Move, Sparkles } from "lucide-react";
import { HandPosition, HologramIconId } from "../types";
import { jarvisAudio } from "../services/audioSpeech";

interface HandGestureHUDProps {
  hand: HandPosition;
  activeWidgetName?: string;
  activeWidgetScale?: number;
  onScaleChange?: (scale: number) => void;
  onSimulateGesture?: (gesture: HandPosition["gesture"], span: number) => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

export const HandGestureHUD: React.FC<HandGestureHUDProps> = ({
  hand,
  activeWidgetName,
  activeWidgetScale = 1.0,
  onScaleChange,
  isCameraActive,
  onToggleCamera,
}) => {
  // Hand screen positions in percentage
  const posX = Math.max(5, Math.min(95, hand.x * 100));
  const posY = Math.max(5, Math.min(95, hand.y * 100));

  const handleQuickSize = (scale: number, label: string) => {
    jarvisAudio.playRepulsorClick();
    if (onScaleChange) {
      onScaleChange(scale);
    }
    jarvisAudio.speak(`${label} size set, sir.`);
  };

  return (
    <>
      {/* Floating Holographic Reticle following the user's hand */}
      {hand.isDetected && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-75 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{
            left: `${posX}%`,
            top: `${posY}%`,
          }}
        >
          {/* Cyber Ring */}
          <div
            className={`relative rounded-full transition-all duration-150 flex items-center justify-center ${
              hand.gesture === "PINCH_GRAB"
                ? "w-14 h-14 border-2 border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-90"
                : hand.gesture === "SPREAD_EXPAND"
                ? "w-20 h-20 border-2 border-cyan-300 bg-cyan-500/25 shadow-[0_0_25px_rgba(6,182,212,0.9)] scale-110"
                : hand.gesture === "PINCH_SHRINK"
                ? "w-10 h-10 border-2 border-indigo-400 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.7)] scale-80"
                : "w-16 h-16 border border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            }`}
          >
            {/* Center Core dot */}
            <div
              className={`w-2 h-2 rounded-full ${
                hand.gesture === "PINCH_GRAB"
                  ? "bg-amber-400 animate-ping"
                  : hand.gesture === "SPREAD_EXPAND"
                  ? "bg-cyan-300"
                  : "bg-cyan-400"
              }`}
            />
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-cyan-400/50" />
            <div className="absolute h-full w-[1px] bg-cyan-400/50" />
          </div>

          {/* Floating Telemetry Tag under reticle */}
          <div className="mt-2 px-2 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/60 text-[9px] font-mono-tech text-cyan-300 shadow-md flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-white">
              {hand.gesture === "SPREAD_EXPAND"
                ? "BIGGER (EXPAND)"
                : hand.gesture === "PINCH_SHRINK"
                ? "SMALLER (SHRINK)"
                : hand.gesture}
            </span>
            {activeWidgetName && (
              <span className="text-amber-300">| {activeWidgetName}</span>
            )}
          </div>
        </div>
      )}

      {/* Floating Hand Size Control HUD Dock (Top Right) */}
      <div className="absolute top-2 right-4 z-40 flex items-center gap-2">
        <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] px-3 py-1.5 rounded-xs flex items-center gap-3 text-[10px] font-mono-tech">
          {/* Hand tracking status indicator */}
          <div className="flex items-center gap-1.5">
            <Hand
              className={`w-3.5 h-3.5 ${
                hand.isDetected
                  ? hand.gesture === "SPREAD_EXPAND"
                    ? "text-cyan-300 animate-pulse"
                    : hand.gesture === "PINCH_GRAB"
                    ? "text-amber-400"
                    : "text-emerald-400"
                  : "text-slate-500"
              }`}
            />
            <div className="flex flex-col">
              <span className="text-slate-400 text-[8px]">HAND GESTURE CONTROL</span>
              <span className="text-cyan-300 font-orbitron font-semibold">
                {hand.isDetected
                  ? hand.gesture === "SPREAD_EXPAND"
                    ? "EXPANDING BIG"
                    : hand.gesture === "PINCH_SHRINK"
                    ? "SHRINKING SMALL"
                    : "HAND SYNCED"
                  : isCameraActive
                  ? "SHOW HAND TO CAMERA"
                  : "CAMERA OFFLINE"}
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-cyan-500/30 hidden sm:block" />

          {/* Quick Small / Big Size Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[9px] hidden sm:inline">SIZE:</span>
            <button
              onClick={() => handleQuickSize(0.7, "Small")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-xs border text-[9px] transition-all cursor-pointer ${
                activeWidgetScale <= 0.8
                  ? "bg-cyan-400 text-slate-950 font-bold border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20"
              }`}
              title="Make Active Hologram Small (0.7x)"
            >
              <Minimize2 className="w-2.5 h-2.5" />
              <span>SMALL</span>
            </button>

            <button
              onClick={() => handleQuickSize(1.0, "Normal")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-xs border text-[9px] transition-all cursor-pointer ${
                activeWidgetScale > 0.8 && activeWidgetScale < 1.3
                  ? "bg-cyan-400 text-slate-950 font-bold border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20"
              }`}
              title="Standard Normal Size (1.0x)"
            >
              <span>NORMAL</span>
            </button>

            <button
              onClick={() => handleQuickSize(1.45, "Big")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-xs border text-[9px] transition-all cursor-pointer ${
                activeWidgetScale >= 1.3
                  ? "bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  : "bg-slate-900/80 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
              }`}
              title="Make Active Hologram Big (1.45x)"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>BIG</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
