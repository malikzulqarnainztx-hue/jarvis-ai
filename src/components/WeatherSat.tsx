import React from "react";
import { CloudRain, Wind, Thermometer, Compass, Sun } from "lucide-react";

export const WeatherSat: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between text-[11px] font-orbitron text-cyan-400 border-b border-cyan-500/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          <span className="tracking-wider">ATMOSPHERIC RADAR & SAT-LINK</span>
        </div>
        <div className="text-[9px] font-mono-tech text-amber-400">DOPPLER ACTIVE</div>
      </div>

      {/* Radar circle with sweeping line */}
      <div className="relative flex-1 flex items-center justify-center my-1">
        <div className="relative w-36 h-36 rounded-full border border-cyan-500/40 flex items-center justify-center overflow-hidden bg-cyan-950/20">
          {/* Inner concentric rings */}
          <div className="absolute w-28 h-28 rounded-full border border-cyan-500/25" />
          <div className="absolute w-16 h-16 rounded-full border border-cyan-500/20" />

          {/* Cross lines */}
          <div className="absolute w-full h-[1px] bg-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20" />

          {/* Radar sweeping beam */}
          <div className="absolute inset-0 animate-radar origin-center pointer-events-none">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/40 to-transparent transform -rotate-45 origin-bottom-right" />
          </div>

          {/* Blips */}
          <div className="absolute top-8 right-10 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-ping" />
          <div className="absolute bottom-10 left-8 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee]" />

          {/* Center pinpoint */}
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        </div>
      </div>

      {/* Weather telemetry */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-cyan-500/20 text-[9px] font-mono-tech text-cyan-300">
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xs border border-cyan-500/20">
          <Thermometer className="w-3 h-3 text-amber-400" />
          <div>
            <div className="text-[8px] text-slate-400">TEMP</div>
            <div>29°C / 84°F</div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xs border border-cyan-500/20">
          <Wind className="w-3 h-3 text-cyan-400" />
          <div>
            <div className="text-[8px] text-slate-400">WIND</div>
            <div>14 KM/H NW</div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xs border border-cyan-500/20">
          <Compass className="w-3 h-3 text-cyan-400" />
          <div>
            <div className="text-[8px] text-slate-400">BAROMETER</div>
            <div>1013 HPA</div>
          </div>
        </div>
      </div>
    </div>
  );
};
