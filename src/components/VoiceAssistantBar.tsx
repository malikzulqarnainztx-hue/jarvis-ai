import React, { useState } from "react";
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, MessageSquare, Copy, Check, ChevronUp, ChevronDown } from "lucide-react";
import { jarvisAudio } from "../services/audioSpeech";

interface VoiceAssistantBarProps {
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  voiceLanguage: "hi" | "en";
  onToggleLanguage: () => void;
  isHandsFreeActive: boolean;
  onToggleHandsFree: () => void;
  interimTranscript?: string;
  isMicrophoneActive?: boolean;
  lastAnswer?: string;
  lastUserQuery?: string;
}

const QUICK_COMMANDS = [
  { text: "Jarvis, what is the current system status and diagnostics?", label: "SYSTEM STATUS" },
  { text: "Jarvis, provide top world news and breaking intelligence", label: "WORLD INTEL" },
  { text: "Jarvis, analyze what is visible in front of my camera", label: "CAMERA VISION" },
  { text: "Jarvis, synchronize neural vortex frequency and core telemetry", label: "VORTEX CORE" },
  { text: "Jarvis, engage cyber defense firewall and report security integrity", label: "CYBER FIREWALL" },
];

export const VoiceAssistantBar: React.FC<VoiceAssistantBarProps> = ({
  onSendMessage,
  isProcessing,
  isSpeaking,
  onStopSpeaking,
  voiceLanguage,
  onToggleLanguage,
  isHandsFreeActive,
  onToggleHandsFree,
  interimTranscript = "",
  isMicrophoneActive = false,
  lastAnswer,
  lastUserQuery,
}) => {
  const [inputText, setInputText] = useState("");
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleReplayVoice = () => {
    if (!lastAnswer) return;
    jarvisAudio.speak(lastAnswer, {
      lang: voiceLanguage === "hi" ? "hi-IN" : "en-US",
    });
  };

  const handleCopy = () => {
    if (!lastAnswer) return;
    navigator.clipboard.writeText(lastAnswer);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-950/95 border-t border-cyan-500/40 p-3 backdrop-blur-xl shadow-[0_-5px_25px_rgba(6,182,212,0.2)] select-none">
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Quick Voice Command Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px] font-mono-tech scrollbar-none">
          <span className="text-cyan-400 font-orbitron text-[9px] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>VOICE PROMPTS:</span>
          </span>
          {QUICK_COMMANDS.map((cmd, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(cmd.text)}
              disabled={isProcessing}
              className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-500/30 hover:border-cyan-400/80 text-cyan-300 hover:text-white transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>

        {/* Live Continuous Hands-Free Status Banner */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xs border border-cyan-500/20 bg-slate-900/60 text-xs font-mono-tech transition-all">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-cyan-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-orbitron text-[11px]">JARVIS IS THINKING...</span>
            </div>
          ) : isSpeaking ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-cyan-300">
                <Volume2 className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span className="font-orbitron text-[11px]">JARVIS SPEAKING (MALE SYNTHESIS)</span>
              </div>
              <button
                onClick={onStopSpeaking}
                className="px-2 py-0.5 rounded-xs bg-rose-950/60 border border-rose-500/60 text-rose-300 text-[10px] font-orbitron hover:bg-rose-900/80 cursor-pointer"
              >
                MUTE
              </button>
            </div>
          ) : isHandsFreeActive ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-emerald-300">
                {/* Visual Animated Sound Wave Bars */}
                <div className="flex items-end gap-0.5 h-3.5 px-1">
                  <span className={`w-0.5 bg-emerald-400 rounded-full transition-all ${interimTranscript ? "h-3.5 animate-pulse" : "h-1.5"}`} />
                  <span className={`w-0.5 bg-emerald-400 rounded-full transition-all ${interimTranscript ? "h-2.5 animate-bounce" : "h-2"}`} />
                  <span className={`w-0.5 bg-emerald-400 rounded-full transition-all ${interimTranscript ? "h-3.5 animate-pulse" : "h-1"}`} />
                  <span className={`w-0.5 bg-emerald-400 rounded-full transition-all ${interimTranscript ? "h-2 animate-bounce" : "h-2.5"}`} />
                </div>
                <span className="font-orbitron text-[11px] text-emerald-400 font-bold">
                  AUTO-LISTENING ACTIVE:
                </span>
                <span className="text-white italic text-xs max-w-md truncate">
                  {interimTranscript ? `"${interimTranscript}"` : "Speak freely without clicking mic..."}
                </span>
              </div>
              <button
                onClick={onToggleHandsFree}
                className="text-[10px] text-emerald-400/80 hover:text-emerald-300 underline uppercase tracking-wider cursor-pointer"
                title="Mute hands-free listening"
              >
                MUTE AUTO-MIC
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-slate-400">
              <div className="flex items-center gap-2">
                <MicOff className="w-3.5 h-3.5 text-slate-500" />
                <span>HANDS-FREE MUTED — Click mic button to enable continuous voice</span>
              </div>
              <button
                onClick={onToggleHandsFree}
                className="px-2 py-0.5 rounded-xs bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-[10px] font-orbitron hover:border-emerald-400 cursor-pointer"
              >
                ACTIVATE
              </button>
            </div>
          )}
        </div>

        {/* Live JARVIS Response Display Card */}
        {lastAnswer && (
          <div className="rounded-xs border border-cyan-500/40 bg-slate-900/80 p-2.5 text-xs font-mono-tech transition-all">
            <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20 text-[10px] font-orbitron text-cyan-400">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-cyan-400" />
                <span className="font-bold">JARVIS INTEL RESPONSE</span>
                {lastUserQuery && (
                  <span className="text-slate-400 normal-case font-mono-tech italic truncate max-w-[200px] sm:max-w-md">
                    — "{lastUserQuery}"
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReplayVoice}
                  className="px-2 py-0.5 rounded-xs bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Replay speech in Butler voice"
                >
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <span>VOICE</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded-xs bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Copy response"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnswerExpanded((prev) => !prev)}
                  className="p-1 rounded-xs bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title={isAnswerExpanded ? "Collapse" : "Expand"}
                >
                  {isAnswerExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {isAnswerExpanded && (
              <div className="pt-2 text-cyan-100 text-xs sm:text-[13px] leading-relaxed max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/40 whitespace-pre-wrap">
                {lastAnswer}
              </div>
            )}
          </div>
        )}

        {/* Command bar input row */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          {/* Main Audio Mic Button (Toggles Hands-Free Auto-Listening) */}
          <button
            type="button"
            onClick={onToggleHandsFree}
            className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isHandsFreeActive
                ? isMicrophoneActive || interimTranscript
                  ? "bg-emerald-400 text-slate-950 shadow-[0_0_22px_#34d399] scale-105 animate-pulse"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                : "bg-slate-900 text-slate-500 border border-slate-700 hover:border-cyan-500/50"
            }`}
            title={
              isHandsFreeActive
                ? "Jarvis is listening continuously without clicking! Click to mute hands-free listening."
                : "Click to enable continuous hands-free voice listening."
            }
          >
            {isHandsFreeActive ? (
              <Mic className="w-5 h-5 text-emerald-300" />
            ) : (
              <MicOff className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Text Input for Typing commands */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Jarvis anything (Hands-Free Voice or Text)... e.g. 'Status report on all systems'"
              disabled={isProcessing}
              className="w-full bg-slate-950/90 border border-cyan-500/40 rounded-full px-4 py-2.5 text-xs sm:text-sm font-mono-tech text-cyan-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            />
            {isProcessing && (
              <div className="absolute right-4 top-3 text-[10px] font-orbitron text-cyan-400 animate-pulse">
                PROCESSING INTEL...
              </div>
            )}
          </div>

          {/* Language Switcher (Hindi Male Voice vs English) */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-2.5 py-2 rounded-full bg-slate-900 border border-cyan-500/40 text-[10px] font-orbitron text-cyan-300 hover:border-cyan-300 transition-colors shrink-0 cursor-pointer"
            title="Toggle Voice Engine Language (Hindi / English)"
          >
            {voiceLanguage === "hi" ? "HINDI VOICE" : "ENG VOICE"}
          </button>

          {/* Stop speaking button if Jarvis is speaking */}
          {isSpeaking && (
            <button
              type="button"
              onClick={onStopSpeaking}
              className="p-2.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/50 hover:bg-rose-500/30 transition-colors shrink-0 cursor-pointer"
              title="Mute Jarvis Speech"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className={`p-2.5 rounded-full transition-all shrink-0 ${
              inputText.trim() && !isProcessing
                ? "bg-cyan-400 text-slate-950 shadow-[0_0_15px_#22d3ee] cursor-pointer"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
