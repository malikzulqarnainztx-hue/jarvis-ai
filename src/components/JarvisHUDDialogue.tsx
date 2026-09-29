import React, { useState } from "react";
import { Volume2, VolumeX, Copy, Check, Sparkles, X, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { jarvisAudio } from "../services/audioSpeech";

interface JarvisHUDDialogueProps {
  lastUserQuery?: string;
  lastAnswer?: string;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  voiceLanguage: "hi" | "en";
}

export const JarvisHUDDialogue: React.FC<JarvisHUDDialogueProps> = ({
  lastUserQuery,
  lastAnswer,
  isProcessing,
  isSpeaking,
  onStopSpeaking,
  voiceLanguage,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If user hasn't asked anything and there's no answer or dismissed
  if ((!lastAnswer && !isProcessing) || isDismissed) {
    return null;
  }

  const handleCopy = () => {
    if (!lastAnswer) return;
    navigator.clipboard.writeText(lastAnswer);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReplayVoice = () => {
    if (!lastAnswer) return;
    jarvisAudio.speak(lastAnswer, {
      lang: voiceLanguage === "hi" ? "hi-IN" : "en-US",
    });
  };

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-2xl transition-all duration-300 pointer-events-auto">
      <div className="relative rounded-lg border border-cyan-500/50 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.25)] overflow-hidden">
        {/* Hologram Top Scanline Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Header Bar */}
        <div className="px-3.5 py-2 flex items-center justify-between border-b border-cyan-500/30 bg-slate-900/70 text-xs font-orbitron text-cyan-300">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400">
              <Bot className="w-3 h-3 text-cyan-300" />
              {isSpeaking && (
                <span className="absolute -inset-0.5 rounded-full border border-cyan-400 animate-ping opacity-75" />
              )}
            </div>
            <span className="tracking-widest font-bold text-[11px] text-white flex items-center gap-1.5">
              <span>JARVIS</span>
              <span className="text-cyan-400 text-[10px] font-normal">// LIVE RESPONSE HUD</span>
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5">
            {isSpeaking ? (
              <button
                onClick={onStopSpeaking}
                className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/60 text-rose-300 text-[10px] hover:bg-rose-900 transition-colors flex items-center gap-1 cursor-pointer"
                title="Stop Speech"
              >
                <VolumeX className="w-3 h-3" />
                <span>MUTE</span>
              </button>
            ) : (
              lastAnswer && (
                <button
                  onClick={handleReplayVoice}
                  className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-[10px] hover:bg-cyan-900 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Replay Voice (Male Butler)"
                >
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <span>REPLAY VOICE</span>
                </button>
              )
            )}

            {lastAnswer && (
              <button
                onClick={handleCopy}
                className="p-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy Answer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}

            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMinimized ? "Expand" : "Collapse"}
            >
              {isMinimized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Close Notification"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="p-3.5 space-y-2 text-xs font-mono-tech max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/40">
            {/* User prompt preview if available */}
            {lastUserQuery && (
              <div className="flex items-start gap-1.5 text-slate-400 text-[11px] pb-1 border-b border-cyan-500/20">
                <span className="text-cyan-400 font-orbitron shrink-0 uppercase tracking-wider">COMMAND:</span>
                <span className="italic text-slate-300 break-words">"{lastUserQuery}"</span>
              </div>
            )}

            {/* Answer Display */}
            {isProcessing ? (
              <div className="flex items-center gap-2.5 py-2 text-cyan-300 animate-pulse">
                <div className="flex gap-1 items-end h-4">
                  <span className="w-1 bg-cyan-400 h-2 animate-bounce" />
                  <span className="w-1 bg-cyan-400 h-4 animate-bounce delay-75" />
                  <span className="w-1 bg-cyan-400 h-3 animate-bounce delay-150" />
                </div>
                <span className="font-orbitron tracking-wide text-xs">
                  JARVIS NEURAL CORE IS FORMULATING INTEL...
                </span>
              </div>
            ) : (
              <div className="text-cyan-100 leading-relaxed text-[13px] whitespace-pre-wrap selection:bg-cyan-500 selection:text-black">
                {lastAnswer}
              </div>
            )}

            {/* Speech Wave Visualizer when Jarvis is actively speaking */}
            {isSpeaking && (
              <div className="flex items-center justify-between pt-1 border-t border-cyan-500/20 text-[10px] text-cyan-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="font-orbitron uppercase tracking-wider">
                    VOCAL SYNTHESIS ACTIVE ({voiceLanguage === "hi" ? "HINDI" : "ENGLISH"} BUTLER)
                  </span>
                </div>
                <div className="flex items-end gap-0.5 h-3">
                  {[4, 12, 8, 16, 10, 14, 6, 11].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-0.5 bg-cyan-400 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
