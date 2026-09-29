import React, { useEffect, useState } from "react";
import { Mic, Volume2, Radio, Music, Sliders } from "lucide-react";
import { motion } from "motion/react";
import { jarvisAudio } from "../services/audioSpeech";

interface AudioMatrixProps {
  isSpeaking: boolean;
  isListening: boolean;
  onVoiceTest: () => void;
}

export const AudioMatrix: React.FC<AudioMatrixProps> = ({
  isSpeaking,
  isListening,
  onVoiceTest,
}) => {
  const [bars, setBars] = useState<number[]>(Array(24).fill(15));
  const [pitch, setPitch] = useState<number>(0.88);
  const [rate, setRate] = useState<number>(0.95);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => {
          if (isSpeaking) {
            return Math.floor(Math.random() * 80 + 20);
          } else if (isListening) {
            return Math.floor(Math.random() * 60 + 15);
          } else {
            return Math.floor(Math.random() * 15 + 8);
          }
        })
      );
    }, 90);
    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between text-[11px] font-orbitron text-cyan-400 border-b border-cyan-500/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-cyan-400" />
          <span className="tracking-wider">SONIC SPECTRUM & AUDIO-TO-AUDIO</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono-tech text-cyan-300">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSpeaking ? "bg-cyan-400 animate-ping" : isListening ? "bg-amber-400 animate-pulse" : "bg-slate-600"
            }`}
          />
          <span>{isSpeaking ? "JARVIS TRANSMITTING" : isListening ? "RECORDING AUDIO" : "IDLE"}</span>
        </div>
      </div>

      {/* Spectrum Waveform */}
      <div className="flex-1 flex items-center justify-center my-2">
        <div className="flex items-end justify-center gap-1 w-full h-20 px-2">
          {bars.map((height, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-xs transition-all duration-75"
              style={{
                height: `${height}%`,
                background: isSpeaking
                  ? "linear-gradient(to top, #0891b2, #22d3ee, #e0f2fe)"
                  : isListening
                  ? "linear-gradient(to top, #d97706, #f59e0b, #fef3c7)"
                  : "linear-gradient(to top, #0e7490, #06b6d4)",
                boxShadow: isSpeaking ? "0 0 8px rgba(34, 211, 238, 0.5)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Hindi Voice Tuning & Chime trigger */}
      <div className="space-y-1.5 pt-1 border-t border-cyan-500/20 text-[10px] font-mono-tech text-cyan-300">
        <div className="flex items-center justify-between">
          <span>MALE HINDI VOICE MODULATION</span>
          <button
            onClick={onVoiceTest}
            className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded-xs border border-cyan-400/50 font-orbitron text-[9px] tracking-wider transition-colors"
          >
            TEST VOICE
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-1.5">
            <span className="text-cyan-400/80">PITCH:</span>
            <span className="text-cyan-200">DEEP (0.88)</span>
          </div>
          <div className="flex-1 flex items-center gap-1.5">
            <span className="text-cyan-400/80">ACCENT:</span>
            <span className="text-amber-300">HINDI / HINGLISH</span>
          </div>
        </div>
      </div>
    </div>
  );
};
