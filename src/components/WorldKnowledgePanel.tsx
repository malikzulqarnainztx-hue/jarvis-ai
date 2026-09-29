import React, { useState } from "react";
import { Globe2, Search, ExternalLink, Volume2, Sparkles, Compass, Radio } from "lucide-react";
import { GroundingSource } from "../types";
import { jarvisAudio } from "../services/audioSpeech";

interface WorldKnowledgePanelProps {
  onSearchQuery: (query: string) => void;
  recentSources: GroundingSource[];
  lastAnswer?: string;
  isLoading: boolean;
}

const KNOWLEDGE_TOPICS = [
  {
    label: "Global News & Updates",
    query: "What are the latest important news headlines today?",
  },
  {
    label: "Sports & Tournament Scores",
    query: "Latest cricket match scores and tournament updates",
  },
  {
    label: "Space & Satellite Missions",
    query: "Latest space discoveries and scientific missions",
  },
  {
    label: "Tech & AI Breakthroughs",
    query: "Recent major advancements in AI and computing",
  },
  {
    label: "Global Weather Telemetry",
    query: "Current major global weather events and patterns",
  },
];

export const WorldKnowledgePanel: React.FC<WorldKnowledgePanelProps> = ({
  onSearchQuery,
  recentSources,
  lastAnswer,
  isLoading,
}) => {
  const [customInput, setCustomInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSearchQuery(customInput.trim());
    setCustomInput("");
  };

  const handleSpeak = (text: string) => {
    jarvisAudio.speak(text);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between text-[11px] font-orbitron text-cyan-400 border-b border-cyan-500/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="tracking-wider">REAL-TIME GLOBAL KNOWLEDGE DATABASE</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono-tech text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>GOOGLE SEARCH GROUNDED</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto my-2 pr-1 space-y-3">
        {/* Knowledge Query Input */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Ask Jarvis any world knowledge, news, or fact... e.g. 'What are today's top science discoveries?'"
            className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-xs px-3 py-1.5 pl-8 text-xs font-mono-tech text-cyan-200 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          />
          <Search className="w-3.5 h-3.5 text-cyan-500 absolute left-2.5 top-2.5" />
          <button
            type="submit"
            disabled={isLoading || !customInput.trim()}
            className="absolute right-1.5 top-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-xs text-[10px] font-orbitron hover:bg-cyan-500/30 transition-colors"
          >
            SCAN
          </button>
        </form>

        {/* Quick Knowledge Topics */}
        <div>
          <div className="text-[10px] font-orbitron text-cyan-400/80 mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>INSTANT TELEMETRY TOPICS</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {KNOWLEDGE_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => onSearchQuery(topic.query)}
                disabled={isLoading}
                className="px-2 py-1 bg-slate-900/80 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xs text-[10px] font-mono-tech text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{topic.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Latest Knowledge Result */}
        {lastAnswer && (
          <div className="p-2.5 rounded-xs bg-slate-900/80 border border-cyan-500/40 text-xs text-cyan-100 font-mono-tech leading-relaxed relative">
            <div className="flex items-center justify-between text-[9px] font-orbitron text-cyan-400 mb-1">
              <span>JARVIS INTEL BRIEFING</span>
              <button
                onClick={() => handleSpeak(lastAnswer)}
                className="flex items-center gap-1 text-cyan-300 hover:text-cyan-100 transition-colors"
                title="Speak in Male Hindi Voice"
              >
                <Volume2 className="w-3 h-3" />
                <span>SPEAK</span>
              </button>
            </div>
            <p className="whitespace-pre-wrap">{lastAnswer}</p>
          </div>
        )}

        {/* Real-time Grounding Sources */}
        {recentSources.length > 0 && (
          <div>
            <div className="text-[10px] font-orbitron text-cyan-400/80 mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>VERIFIED GLOBAL SOURCES & CITATIONS</span>
            </div>
            <div className="space-y-1">
              {recentSources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-1.5 bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-400/50 rounded-xs text-[10px] font-mono-tech text-cyan-300 hover:text-cyan-100 transition-all group"
                >
                  <span className="truncate max-w-[200px] sm:max-w-xs">{source.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0 ml-1 text-cyan-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer telemetry */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-cyan-400/80 pt-1 border-t border-cyan-500/20">
        <div className="flex items-center gap-1">
          <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
          <span>GLOBAL FEED: ACTIVE</span>
        </div>
        <span className="text-amber-400">UNRESTRICTED WORLD DATA</span>
      </div>
    </div>
  );
};
