import React from "react";
import { Cpu, HardDrive, Activity, Wifi, CheckCircle2 } from "lucide-react";

interface DiagnosticsPanelProps {
  telemetry: {
    cpuLoad?: string;
    memory?: string;
    latency?: string;
    neuralSync?: string;
  };
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ telemetry }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between text-[11px] font-orbitron text-cyan-400 border-b border-cyan-500/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="tracking-wider">QUANTUM DIAGNOSTICS</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono-tech text-cyan-300">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          <span>NOMINAL</span>
        </div>
      </div>

      {/* Grid of gauges */}
      <div className="grid grid-cols-2 gap-2 my-2">
        <div className="bg-slate-900/80 border border-cyan-500/30 p-2 rounded-xs">
          <div className="flex items-center justify-between text-[9px] font-orbitron text-cyan-400/80 mb-1">
            <span>NEURAL LOAD</span>
            <Activity className="w-2.5 h-2.5 text-cyan-400" />
          </div>
          <div className="text-sm font-mono-tech text-cyan-200">{telemetry.cpuLoad || "28%"}</div>
          <div className="w-full h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-cyan-400 w-[28%]" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-cyan-500/30 p-2 rounded-xs">
          <div className="flex items-center justify-between text-[9px] font-orbitron text-cyan-400/80 mb-1">
            <span>QUANTUM RAM</span>
            <HardDrive className="w-2.5 h-2.5 text-cyan-400" />
          </div>
          <div className="text-sm font-mono-tech text-cyan-200">{telemetry.memory || "3.4 GB"}</div>
          <div className="w-full h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-cyan-400 w-[45%]" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-cyan-500/30 p-2 rounded-xs">
          <div className="flex items-center justify-between text-[9px] font-orbitron text-cyan-400/80 mb-1">
            <span>SYNAPSE PING</span>
            <Wifi className="w-2.5 h-2.5 text-cyan-400" />
          </div>
          <div className="text-sm font-mono-tech text-cyan-200">{telemetry.latency || "38ms"}</div>
          <div className="w-full h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-emerald-400 w-[15%]" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-cyan-500/30 p-2 rounded-xs">
          <div className="flex items-center justify-between text-[9px] font-orbitron text-cyan-400/80 mb-1">
            <span>NEURAL SYNC</span>
            <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
          </div>
          <div className="text-sm font-mono-tech text-amber-300">{telemetry.neuralSync || "99.2%"}</div>
          <div className="w-full h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-amber-400 w-[99%]" />
          </div>
        </div>
      </div>

      {/* Subsystem status checklist */}
      <div className="space-y-1 text-[9px] font-mono-tech text-cyan-300/90 border-t border-cyan-500/20 pt-1.5">
        <div className="flex justify-between">
          <span>VOICE SYNTHESIS ENGINE</span>
          <span className="text-cyan-400">ONLINE</span>
        </div>
        <div className="flex justify-between">
          <span>OPTICAL VISION AI</span>
          <span className="text-emerald-400">MULTIMODAL ACTIVE</span>
        </div>
        <div className="flex justify-between">
          <span>GESTURE RECOGNITION</span>
          <span className="text-cyan-400">PINCH & PALM TRACKING</span>
        </div>
      </div>
    </div>
  );
};
