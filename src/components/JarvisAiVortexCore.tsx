import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Radio, Activity, RefreshCw, Cpu, Layers } from "lucide-react";
import { motion } from "motion/react";
import { jarvisAudio } from "../services/audioSpeech";

interface JarvisAiVortexCoreProps {
  isSpeaking: boolean;
  isListening?: boolean;
  onSyncCore?: () => void;
  handHover?: boolean;
  className?: string;
}

export const JarvisAiVortexCore: React.FC<JarvisAiVortexCoreProps> = ({
  isSpeaking,
  isListening = false,
  onSyncCore,
  handHover = false,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coreStatus, setCoreStatus] = useState("SYNCHRONIZED");
  const [pulseLevel, setPulseLevel] = useState(100);

  // Canvas-based cosmic vortex animation matching the uploaded design
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // Generate stars/particles for the cosmic spiral
    const particleCount = 140;
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const arm = i % 3; // 3 spiral arms
      const dist = 30 + Math.pow(Math.random(), 0.8) * 190;
      const baseAngle = (arm * (2 * Math.PI)) / 3 + dist * 0.025;
      const speed = (0.003 + Math.random() * 0.004) * (arm % 2 === 0 ? 1 : 1.1);
      const size = 1 + Math.random() * 2.2;
      const opacity = 0.3 + Math.random() * 0.7;
      const color =
        i % 4 === 0 ? "#ffffff" : i % 4 === 1 ? "#38bdf8" : i % 4 === 2 ? "#00e5ff" : "#818cf8";

      return {
        dist,
        baseAngle,
        speed,
        size,
        opacity,
        color,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      angle += isSpeaking ? 0.02 : 0.008;

      // Outer elliptical glow & nebula gradient
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 210);
      grad.addColorStop(0, isSpeaking ? "rgba(6,182,212,0.22)" : "rgba(6,182,212,0.12)");
      grad.addColorStop(0.5, "rgba(30,58,138,0.15)");
      grad.addColorStop(1, "rgba(3,7,18,0)");

      ctx.save();
      // Elliptical galaxy perspective tilt (like in the uploaded image)
      ctx.translate(cx, cy);
      ctx.scale(1.2, 0.75);
      ctx.translate(-cx, -cy);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 210, 0, Math.PI * 2);
      ctx.fill();

      // Draw cosmic vortex particle spiral
      particles.forEach((p) => {
        const currentAngle = p.baseAngle + angle * (p.dist / 60);
        const x = cx + Math.cos(currentAngle) * p.dist;
        const y = cy + Math.sin(currentAngle) * p.dist;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = isSpeaking ? Math.min(1, p.opacity + 0.25) : p.opacity;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw faint starlight filament connections between close particles
        if (p.dist > 70 && p.dist < 150 && Math.random() > 0.94) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.18)";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
      });

      // Concentric glowing galaxy orbital rings
      const rings = [65, 115, 160, 195];
      rings.forEach((r, idx) => {
        ctx.strokeStyle =
          idx % 2 === 0
            ? "rgba(6, 182, 212, 0.28)"
            : "rgba(99, 102, 241, 0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([idx * 4 + 4, idx * 6 + 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      ctx.restore();
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking]);

  const handleTriggerSync = () => {
    jarvisAudio.playHologramChime();
    setPulseLevel(100);
    setCoreStatus("RECALIBRATED");
    onSyncCore?.();
    setTimeout(() => setCoreStatus("SYNCHRONIZED"), 2200);
  };

  return (
    <div
      id="jarvis-ai-core-module"
      onClick={handleTriggerSync}
      className={`relative w-full h-full flex flex-col items-center justify-between p-3 select-none cursor-pointer group ${className}`}
      title="JARVIS AI Neural Core — Click to synchronize vortex frequency"
    >
      {/* Top Telemetry Header */}
      <div className="w-full flex items-center justify-between text-[11px] font-orbitron text-cyan-400 border-b border-cyan-500/20 pb-1.5 z-20">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="tracking-widest font-bold">JARVIS AI NEURAL VORTEX</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono-tech">
          <span
            className={`px-1.5 py-0.5 rounded-xs border text-[9px] uppercase tracking-wider ${
              isSpeaking
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_#06b6d4]"
                : "bg-slate-900 text-cyan-400/80 border-cyan-500/30"
            }`}
          >
            {coreStatus} • 432 THz
          </span>
        </div>
      </div>

      {/* Main Holographic Centerpiece matching the uploaded image */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {/* Animated Canvas Particle Spiral Galaxy (Tilted Ellipse) */}
        <canvas
          ref={canvasRef}
          width={520}
          height={380}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
        />

        {/* Geometric Constellation Web Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 500 360"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Wireframe Constellation Polygon Lines */}
          <g stroke="rgba(56, 189, 248, 0.25)" strokeWidth="0.8" fill="none">
            {/* Left side constellation nodes */}
            <polygon points="50,180 110,120 160,150 120,220 70,230" />
            <line x1="110" y1="120" x2="200" y2="100" />
            <line x1="160" y1="150" x2="210" y2="170" />
            <line x1="120" y1="220" x2="190" y2="250" />

            {/* Right side constellation nodes */}
            <polygon points="450,180 390,120 340,150 380,220 430,230" />
            <line x1="390" y1="120" x2="300" y2="100" />
            <line x1="340" y1="150" x2="290" y2="170" />
            <line x1="380" y1="220" x2="310" y2="250" />

            {/* Top & Bottom skyline anchors */}
            <line x1="250" y1="40" x2="200" y2="100" />
            <line x1="250" y1="40" x2="300" y2="100" />
            <line x1="250" y1="320" x2="190" y2="250" />
            <line x1="250" y1="320" x2="310" y2="250" />
          </g>

          {/* Futuristic Wireframe City Skyline Silhouettes (Left: Shard spire; Right: Gherkin / 30 St Mary Axe) */}
          <g stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1.2" fill="none" opacity="0.85">
            {/* Left Skyscraper: Angular Pinnacle / The Shard Silhouette */}
            <path d="M 175 140 L 180 50 L 185 140 Z" />
            <line x1="180" y1="50" x2="180" y2="140" strokeDasharray="2,3" />
            <line x1="177" y1="90" x2="183" y2="90" />
            <line x1="176" y1="115" x2="184" y2="115" />

            {/* Lower cyber blocks next to Shard */}
            <rect x="150" y="110" width="20" height="30" stroke="rgba(56, 189, 248, 0.45)" />
            <line x1="150" y1="120" x2="170" y2="120" />
            <rect x="135" y="125" width="12" height="15" stroke="rgba(56, 189, 248, 0.4)" />

            {/* Right Skyscraper: Curved Oval / Gherkin Tower Silhouette */}
            <path d="M 320 145 C 316 110, 318 65, 330 55 C 342 65, 344 110, 340 145 Z" />
            {/* Diagonal lattice pattern on Gherkin tower */}
            <line x1="320" y1="125" x2="338" y2="75" strokeWidth="0.8" stroke="rgba(56, 189, 248, 0.4)" />
            <line x1="340" y1="125" x2="322" y2="75" strokeWidth="0.8" stroke="rgba(56, 189, 248, 0.4)" />
            <line x1="321" y1="100" x2="339" y2="100" strokeWidth="0.8" stroke="rgba(56, 189, 248, 0.4)" />

            {/* Right side cyber building block */}
            <rect x="305" y="100" width="12" height="45" stroke="rgba(56, 189, 248, 0.4)" />
          </g>

          {/* Geometric Node Points (Glowing dots at vertices) */}
          {[
            [180, 50],
            [150, 110],
            [110, 120],
            [160, 150],
            [330, 55],
            [390, 120],
            [340, 150],
            [250, 40],
            [250, 320],
            [120, 220],
            [380, 220],
          ].map(([x, y], idx) => (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="2.5"
              fill="#ffffff"
              stroke="#00e5ff"
              strokeWidth="1"
              className="animate-pulse"
            />
          ))}
        </svg>

        {/* Central Core Emblem and Typography (Matching the uploaded image) */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center">
          {/* Top Emblem: Antenna Radar Waves + Hexagonal Core + Circuit Traces */}
          <div className="relative flex flex-col items-center mb-1">
            {/* Radiating Antenna Radar Waves */}
            <div className="flex items-center justify-center mb-0.5">
              <svg className="w-16 h-8 text-cyan-400" viewBox="0 0 64 32" fill="none">
                {/* Wave 1 (Inner) */}
                <path
                  d="M 22 22 A 14 14 0 0 1 42 22"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={isSpeaking ? "animate-pulse" : ""}
                />
                {/* Wave 2 (Middle) */}
                <path
                  d="M 16 16 A 22 22 0 0 1 48 16"
                  stroke="#00e5ff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className={isSpeaking ? "animate-ping opacity-75" : ""}
                />
                {/* Wave 3 (Outer) */}
                <path
                  d="M 10 10 A 30 30 0 0 1 54 10"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={isSpeaking ? "animate-pulse delay-100" : "opacity-70"}
                />
              </svg>
            </div>

            {/* Central Hexagon Cyber Eye + Circuit Traces extending Outward */}
            <div className="relative flex items-center justify-center">
              {/* Left Circuit Board Trace Bus */}
              <svg className="w-20 h-10 -mr-2" viewBox="0 0 80 40" fill="none">
                <path
                  d="M 80 20 L 50 20 L 35 10 L 10 10"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="10" r="3.5" fill="#38bdf8" />
                <path
                  d="M 50 20 L 35 30 L 15 30"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="15" cy="30" r="3.5" fill="#38bdf8" />
              </svg>

              {/* Core Hexagonal Ring */}
              <div
                className={`relative w-14 h-14 flex items-center justify-center rounded-xl bg-slate-950/80 border-2 transition-all duration-300 ${
                  isSpeaking
                    ? "border-cyan-300 shadow-[0_0_28px_#00e5ff] scale-110"
                    : "border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.6)]"
                }`}
              >
                {/* Inner circular optic lens */}
                <div className="w-9 h-9 rounded-full border-2 border-cyan-400/80 flex items-center justify-center bg-cyan-950/50">
                  <div
                    className={`w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8] transition-all ${
                      isSpeaking ? "scale-125 bg-white animate-pulse" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Right Circuit Board Trace Bus */}
              <svg className="w-20 h-10 -ml-2" viewBox="0 0 80 40" fill="none">
                <path
                  d="M 0 20 L 30 20 L 45 10 L 70 10"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="70" cy="10" r="3.5" fill="#38bdf8" />
                <path
                  d="M 30 20 L 45 30 L 65 30"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="65" cy="30" r="3.5" fill="#38bdf8" />
              </svg>
            </div>
          </div>

          {/* Bold Central Typography: JARVIS in crisp white, AI in electric cyan */}
          <div className="relative flex flex-col items-center justify-center select-none py-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[0.18em] font-orbitron text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] filter drop-shadow-[0_4px_16px_rgba(6,182,212,0.8)]">
              JARVIS
            </h1>
            <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.25em] font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] -mt-1">
              AI
            </span>
          </div>

          {/* Subtitle Telemetry Pill */}
          <div className="mt-1 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/40 text-[10px] font-mono-tech text-cyan-300 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="uppercase tracking-widest">
              {isSpeaking ? "TRANSMITTING NEURAL SPEECH" : "CONTINUOUS INTELLIGENCE LINK"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-cyan-400/80 pt-1.5 border-t border-cyan-500/20 z-20">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>VORTEX FREQUENCY: 432.08 MHz</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-300">NEURAL HARMONICS: 100%</span>
          <RefreshCw className="w-2.5 h-2.5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
};
