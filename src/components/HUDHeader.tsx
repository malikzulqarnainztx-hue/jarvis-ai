import React, { useEffect, useState } from "react";
import {
  Shield,
  Activity,
  Radio,
  Camera,
  Hand,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Info,
  Key,
} from "lucide-react";
import { jarvisAudio } from "../services/audioSpeech";

interface HUDHeaderProps {
  isCameraActive: boolean;
  onToggleCamera: () => void;
  handTrackingActive: boolean;
  onToggleHandTracking: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  powerLevel: number;
  hasApiKey: boolean;
  onOpenApiKeyModal?: () => void;
  isHandsFreeActive?: boolean;
  onToggleHandsFree?: () => void;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  isCameraActive,
  onToggleCamera,
  handTrackingActive,
  onToggleHandTracking,
  isSpeaking,
  onStopSpeaking,
  powerLevel,
  hasApiKey,
  onOpenApiKeyModal,
  isHandsFreeActive = true,
  onToggleHandsFree,
}) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-GB", { hour12: false }));
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full bg-slate-950/90 border-b border-cyan-500/30 px-4 py-2.5 backdrop-blur-md flex items-center justify-between z-30 select-none">
      {/* Left: JARVIS AI Logo & Identification */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.5)]">
          {/* Central Hex / Antenna icon matching the uploaded image */}
          <div className="w-4 h-4 rounded-sm border border-cyan-300 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#38bdf8]" />
          </div>
          <div className="absolute inset-0 rounded-full border border-cyan-400 border-dashed animate-spin-slow" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-widest text-white text-glow">
              JARVIS <span className="text-cyan-400 font-bold">AI</span>
            </span>
            <span className="text-[9px] font-mono-tech px-1.5 py-0.2 rounded-xs bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              VORTEX CORE
            </span>
          </div>
          <div className="text-[9px] font-mono-tech text-cyan-400/80 tracking-wider">
            JARVIS AI SYSTEM • NEURAL CORE v4.2
          </div>
        </div>
      </div>

      {/* Center: Real-time Telemetry & Clock */}
      <div className="hidden md:flex items-center gap-6 font-mono-tech text-xs text-cyan-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>NEURAL CORE: 99.4%</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>SAT-NET: LINKED</span>
        </div>

        <div className="text-right">
          <div className="font-orbitron text-xs text-cyan-200 tracking-wider">{currentTime}</div>
          <div className="text-[9px] text-cyan-400/60 uppercase">{currentDate}</div>
        </div>
      </div>

      {/* Right: Quick Toggles (Camera, Hand Tracking, Audio, API Key) */}
      <div className="flex items-center gap-2">

        {/* Gemini Key Config Button */}
        <button
          onClick={onOpenApiKeyModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs border text-[10px] font-orbitron transition-all cursor-pointer ${
            hasApiKey
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:border-emerald-400"
              : "bg-amber-950/50 text-amber-300 border-amber-500 animate-pulse hover:border-amber-300"
          }`}
          title="Configure Gemini API Key"
        >
          <Key className="w-3 h-3 text-amber-300" />
          <span className="hidden sm:inline">{hasApiKey ? "KEY LINKED" : "SET FREE KEY"}</span>
        </button>

        {/* Hands-Free Auto-Listen Button */}
        {onToggleHandsFree && (
          <button
            onClick={onToggleHandsFree}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs border text-[10px] font-orbitron transition-all cursor-pointer ${
              isHandsFreeActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700"
            }`}
            title="Toggle Hands-free Voice (Jarvis listens continuously without clicking mic)"
          >
            <Radio className={`w-3 h-3 ${isHandsFreeActive ? "text-emerald-400" : "text-slate-500"}`} />
            <span className="hidden sm:inline">{isHandsFreeActive ? "AUTO-LISTEN ON" : "AUTO-LISTEN OFF"}</span>
          </button>
        )}

        {/* Hand Tracking Toggle */}
        <button
          onClick={onToggleHandTracking}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs border text-[10px] font-orbitron transition-all cursor-pointer ${
            handTrackingActive
              ? "bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              : "bg-slate-900 text-slate-500 border-slate-800"
          }`}
          title="Toggle Optical Hand Tracking Controller"
        >
          <Hand className="w-3 h-3" />
          <span className="hidden sm:inline">HAND CONTROL</span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs border text-[10px] font-orbitron transition-all cursor-pointer ${
            isCameraActive
              ? "bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              : "bg-slate-900 text-slate-500 border-slate-800"
          }`}
          title="Toggle Webcam Feed"
        >
          <Camera className="w-3 h-3" />
          <span className="hidden sm:inline">VISION</span>
        </button>

        {/* Audio Mute / Unmute */}
        <button
          onClick={() => {
            if (isSpeaking) {
              onStopSpeaking();
            } else {
              jarvisAudio.speak("Greetings sir, JARVIS is fully active and operational on your desktop.");
            }
          }}
          className={`p-1.5 rounded-xs border text-cyan-300 transition-colors cursor-pointer ${
            isSpeaking
              ? "bg-cyan-500/30 border-cyan-400 shadow-[0_0_10px_#22d3ee]"
              : "bg-slate-900 border-cyan-500/30 hover:border-cyan-400/60"
          }`}
          title={isSpeaking ? "Mute Jarvis Speech" : "Play Jarvis Greeting"}
        >
          {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse text-cyan-300" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
