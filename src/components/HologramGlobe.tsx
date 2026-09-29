import React, { useEffect, useRef, useState } from "react";
import { Globe, Radio, Compass, Navigation } from "lucide-react";

interface HologramGlobeProps {
  handX?: number; // 0 to 1
  isGrabbed?: boolean;
}

export const HologramGlobe: React.FC<HologramGlobeProps> = ({ handX, isGrabbed }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const [worldTime, setWorldTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setWorldTime(
        now.toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" }) + " UTC"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let manualSpeed = 0.008;

    const render = () => {
      // If hand is controlling it, spin based on hand position
      if (isGrabbed && handX !== undefined) {
        rotationRef.current += (handX - 0.5) * 0.04;
      } else {
        rotationRef.current += manualSpeed;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      // Outer glow circle
      const gradient = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.2);
      gradient.addColorStop(0, "rgba(6, 182, 212, 0.15)");
      gradient.addColorStop(0.8, "rgba(6, 182, 212, 0.05)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Globe sphere outline
      ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Latitudinal rings (parallels)
      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const r = radius * Math.cos(rad);
        const y = cy - radius * Math.sin(rad);

        ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, y, r, r * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitudinal meridians rotating in 3D
      const rot = rotationRef.current;
      for (let lon = 0; lon < 180; lon += 30) {
        const lonRad = ((lon * Math.PI) / 180) + rot;
        const xOffset = Math.sin(lonRad) * radius;

        ctx.strokeStyle = Math.cos(lonRad) > 0 ? "rgba(6, 182, 212, 0.45)" : "rgba(6, 182, 212, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(xOffset), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Orbiting Satellites with blinking beacons
      const t = Date.now() * 0.002;
      for (let s = 0; s < 3; s++) {
        const satAngle = t + (s * (Math.PI * 2)) / 3;
        const satRadius = radius * 1.25;
        const satX = cx + Math.cos(satAngle) * satRadius;
        const satY = cy + Math.sin(satAngle) * (satRadius * 0.45);

        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.arc(satX, satY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Satellite trajectory ring
        ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, satRadius, satRadius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Delhi & Major Telemetry Point on Globe
      const delhiAngle = rot + 1.2;
      if (Math.cos(delhiAngle) > -0.2) {
        const dx = cx + Math.sin(delhiAngle) * (radius * 0.8);
        const dy = cy - radius * 0.35;

        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing radar ring
        ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
        ctx.beginPath();
        ctx.arc(dx, dy, 6 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#fde68a";
        ctx.font = "9px 'Share Tech Mono', monospace";
        ctx.fillText("DELHI [28.6°N, 77.2°E]", dx + 8, dy - 4);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [handX, isGrabbed]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-3 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between text-[11px] font-orbitron text-cyan-400 border-b border-cyan-500/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span className="tracking-wider">GLOBAL SATELLITE ORBIT</span>
        </div>
        <div className="flex items-center gap-1 font-mono-tech text-cyan-300">
          <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>{worldTime}</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        <canvas ref={canvasRef} width={280} height={220} className="w-full h-full object-contain" />
      </div>

      {/* Footer telemetry */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-cyan-400/80 pt-1 border-t border-cyan-500/20">
        <div className="flex items-center gap-1">
          <Navigation className="w-2.5 h-2.5 text-cyan-400" />
          <span>GEO-SYNC: 99.4%</span>
        </div>
        <div className="text-amber-400">
          {isGrabbed ? "HAND ROTATION LOCKED" : "ORBITAL ROTATION NOMINAL"}
        </div>
      </div>
    </div>
  );
};
