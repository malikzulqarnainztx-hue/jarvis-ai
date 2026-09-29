import React from "react";
import { Shield, ShieldAlert, Lock, Activity, Server, Radio } from "lucide-react";
import { motion } from "motion/react";
import { jarvisAudio } from "../services/audioSpeech";

interface DefenseMatrixProps {
  defenseLevel: number;
  onToggleShield: () => void;
  isShieldActive: boolean;
}

export const DefenseMatrix: React.FC<DefenseMatrixProps> = ({
  defenseLevel,
  onToggleShield,
  isShieldActive,
}) => {
  const handleToggle = () => {
    jarvisAudio.playRepulsorClick();
    onToggleShield();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between text-[11px] font-orbitron text-cyan-400 border-b border-cyan-500/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Shield className={`w-3.5 h-3.5 ${isShieldActive ? "text-cyan-400" : "text-amber-400"}`} />
          <span className="tracking-wider">CYBER DEFENSE & FIREWALL</span>
        </div>
        <button
          onClick={handleToggle}
          className={`px-2 py-0.5 rounded-xs text-[9px] font-orbitron tracking-widest uppercase transition-colors cursor-pointer ${
            isShieldActive
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
              : "bg-amber-500/20 text-amber-300 border border-amber-400/60"
          }`}
        >
          {isShieldActive ? "FIREWALL ON" : "STANDBY"}
        </button>
      </div>

      {/* Main Cyber Security Shield Visual */}
      <div className="flex-1 flex items-center justify-center py-2 relative">
        <div className="relative w-40 h-40 flex flex-col items-center justify-center">
          {/* Outer rotating quantum encryption ring */}
          <div
            className={`w-32 h-32 rounded-full border-2 border-dashed ${
              isShieldActive ? "border-cyan-400 animate-spin-slow" : "border-amber-500/40"
            } flex items-center justify-center`}
          >
            {/* Middle protective hex/ring */}
            <div className="w-24 h-24 rounded-full border border-cyan-500/40 flex items-center justify-center">
              <motion.div
                animate={isShieldActive ? { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center"
              >
                <Lock className={`w-7 h-7 ${isShieldActive ? "text-cyan-300" : "text-amber-400"}`} />
                <span className="text-[9px] font-orbitron text-cyan-200 mt-1 font-bold">
                  {isShieldActive ? "ENCRYPTED" : "UNSECURED"}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Lateral node telemetry pills */}
          <div className="absolute top-2 left-0 flex flex-col items-start text-[8px] font-mono-tech text-cyan-400">
            <span>NODE-ALPHA</span>
            <div className="w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] mt-0.5" />
          </div>

          <div className="absolute top-2 right-0 flex flex-col items-end text-[8px] font-mono-tech text-cyan-400">
            <span>ZERO-TRUST</span>
            <div className="w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] mt-0.5" />
          </div>
        </div>
      </div>

      {/* Metrics bars */}
      <div className="w-full space-y-1.5 font-mono-tech text-[10px]">
        <div>
          <div className="flex justify-between text-cyan-300 mb-0.5">
            <span>NETWORK INTEGRITY</span>
            <span>{isShieldActive ? `${defenseLevel}%` : "34%"}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
            <motion.div
              className={`h-full ${isShieldActive ? "bg-cyan-400" : "bg-amber-400"}`}
              style={{ width: `${isShieldActive ? defenseLevel : 34}%` }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-cyan-500/20 text-cyan-400/80 text-[9px]">
          <div className="flex items-center gap-1">
            <Server className="w-3 h-3 text-cyan-400" />
            <span>PORT SHIELDING: ACTIVE</span>
          </div>
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>THREAT DETECT: 0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
