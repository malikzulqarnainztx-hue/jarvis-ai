import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Eye,
  Scan,
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2,
  Upload,
  AlertCircle,
  Play,
  Layers,
} from "lucide-react";
import { HandPosition } from "../types";
import { jarvisAudio } from "../services/audioSpeech";

interface CameraHUDProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  hand: HandPosition;
  onScanFrame: (imageBase64: string) => void;
  isScanning: boolean;
  isActive: boolean;
  onToggleActive: () => void;
}

export const CameraHUD: React.FC<CameraHUDProps> = ({
  videoRef,
  hand,
  onScanFrame,
  isScanning,
  isActive,
  onToggleActive,
}) => {
  const [filterMode, setFilterMode] = useState<"cyan" | "thermal" | "green" | "clean">("cyan");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const simAnimIdRef = useRef<number | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);

  // Stop any active streams (real or simulated)
  const cleanupStreams = () => {
    if (simAnimIdRef.current) {
      cancelAnimationFrame(simAnimIdRef.current);
      simAnimIdRef.current = null;
    }
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach((track) => track.stop());
      currentStreamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }
  };

  // Start real webcam stream
  const startCamera = async () => {
    cleanupStreams();
    setIsSimulated(false);
    setStreamError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStreamError("Camera device API is not supported in this browser environment.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      currentStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((playErr: any) => {
            console.warn("Camera video play paused:", playErr?.message);
          });
        };
      }
    } catch (err: any) {
      // Graceful permission and device error handling without console.error
      console.warn("Camera request notification:", err?.name, err?.message);

      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError" ||
        err.message?.toLowerCase().includes("denied")
      ) {
        setStreamError(
          "Camera access permission was denied. You can allow it in your browser address bar, or activate the Simulation Sensor Feed below."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setStreamError("No physical webcam detected. Switch to Simulation Sensor Feed or upload an image.");
      } else {
        setStreamError(err.message || "Unable to acquire camera feed. Try Simulation mode.");
      }
    }
  };

  // Start synthetic JARVIS radar simulation stream (works 100% offline and when camera permission is denied)
  const startSimulationFeed = () => {
    cleanupStreams();
    setStreamError(null);
    setIsSimulated(true);

    const canvas = simCanvasRef.current || document.createElement("canvas");
    simCanvasRef.current = canvas;
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;

    const drawSimFrame = () => {
      frame++;
      // High-tech holographic radar grid
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyan grid lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Concentric range circles
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.strokeStyle = "rgba(34, 211, 238, 0.35)";
      [60, 120, 180, 230].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Rotating radar sweep
      const angle = (frame * 0.035) % (Math.PI * 2);
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, 230);
      gradient.addColorStop(0, "rgba(34, 211, 238, 0.4)");
      gradient.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 230, angle - 0.4, angle);
      ctx.closePath();
      ctx.fill();

      // Sweeping radial line
      ctx.strokeStyle = "rgba(103, 232, 249, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 230, cy + Math.sin(angle) * 230);
      ctx.stroke();

      // Simulated target blip
      const blipX = cx + Math.cos(angle - 0.2) * 140;
      const blipY = cy + Math.sin(angle - 0.2) * 140;
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(blipX, blipY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Telemetry HUD overlay
      ctx.fillStyle = "#22d3ee";
      ctx.font = "bold 13px monospace";
      ctx.fillText("JARVIS OPTICAL SENSOR [SYNTHETIC RADAR FEED]", 24, 35);
      ctx.font = "11px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`AZIMUTH: ${(angle * (180 / Math.PI)).toFixed(1)}° | RANGE: 2.4 KM | LOCK: STABLE`, 24, 55);
      ctx.fillText(`TARGET: COORD [${blipX.toFixed(0)}, ${blipY.toFixed(0)}] MARK VII TELEMETRY`, 24, 75);

      simAnimIdRef.current = requestAnimationFrame(drawSimFrame);
    };

    drawSimFrame();

    try {
      if (typeof (canvas as any).captureStream === "function") {
        const stream = (canvas as any).captureStream(30) as MediaStream;
        currentStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (e) {
      console.warn("CaptureStream fallback note:", e);
    }
  };

  // Manage webcam or simulation lifecycle when isActive changes
  useEffect(() => {
    if (!isActive) {
      cleanupStreams();
      setIsSimulated(false);
      setStreamError(null);
      return;
    }

    if (!isSimulated) {
      startCamera();
    }

    return () => {
      cleanupStreams();
    };
  }, [isActive]);

  // Capture snapshot for Gemini Multimodal Vision analysis
  const handleCaptureAndScan = () => {
    const video = videoRef.current;
    if (!video) return;

    jarvisAudio.playScannerBeep();

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If simulated feed canvas exists, snapshot that
    if (isSimulated && simCanvasRef.current) {
      ctx.drawImage(simCanvasRef.current, 0, 0, canvas.width, canvas.height);
    } else if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
      // Draw placeholder visual frame
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#22d3ee";
      ctx.font = "16px monospace";
      ctx.fillText("JARVIS OPTICAL SCANNER SNAPSHOT", 40, 60);
    }

    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    onScanFrame(base64);
  };

  // Handle direct file upload for Vision scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        jarvisAudio.playScannerBeep();
        onScanFrame(base64);
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFilterStyle = () => {
    switch (filterMode) {
      case "cyan":
        return "hue-rotate-180 contrast-125 saturate-150 brightness-90";
      case "thermal":
        return "sepia hue-rotate-30 contrast-150 saturate-200";
      case "green":
        return "hue-rotate-90 contrast-125 saturate-150 brightness-95";
      case "clean":
      default:
        return "";
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none ${
        isExpanded ? "fixed inset-4 z-50 bg-slate-950/95 border-2 border-cyan-400 p-4" : "p-3"
      }`}
    >
      {/* Hidden file input for uploading images directly to JARVIS Vision */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="w-full flex items-center justify-between text-[11px] font-orbitron text-cyan-400 border-b border-cyan-500/20 pb-1.5 z-10">
        <div className="flex items-center gap-1.5">
          <Eye
            className={`w-3.5 h-3.5 ${
              isActive ? "text-cyan-400 animate-pulse" : "text-slate-500"
            }`}
          />
          <span className="tracking-wider">
            {isSimulated ? "OPTICAL RADAR (SIMULATION)" : "OPTICAL SENSOR & VISION"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isActive && !isSimulated && (
            <div className="flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded-xs border border-cyan-500/30 text-[9px] font-mono-tech">
              <button
                onClick={() => setFilterMode("cyan")}
                className={`px-1 rounded-xs ${
                  filterMode === "cyan" ? "bg-cyan-500/30 text-cyan-200" : "text-slate-400"
                }`}
              >
                HUD
              </button>
              <button
                onClick={() => setFilterMode("thermal")}
                className={`px-1 rounded-xs ${
                  filterMode === "thermal" ? "bg-amber-500/30 text-amber-200" : "text-slate-400"
                }`}
              >
                THERM
              </button>
              <button
                onClick={() => setFilterMode("clean")}
                className={`px-1 rounded-xs ${
                  filterMode === "clean" ? "bg-cyan-500/30 text-cyan-200" : "text-slate-400"
                }`}
              >
                RAW
              </button>
            </div>
          )}

          {/* Toggle Real Camera */}
          <button
            onClick={onToggleActive}
            className={`p-1 rounded-xs border transition-colors cursor-pointer ${
              isActive && !isSimulated
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                : "border-slate-700 bg-slate-800 text-slate-400"
            }`}
            title={isActive ? "Disable Camera" : "Enable Camera"}
          >
            {isActive && !isSimulated ? (
              <Camera className="w-3.5 h-3.5" />
            ) : (
              <CameraOff className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Expand / Minimize */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-xs border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Camera Video Area */}
      <div className="relative flex-1 w-full my-2 bg-slate-950 rounded-xs border border-cyan-500/30 overflow-hidden flex items-center justify-center">
        {isActive ? (
          <>
            {/* Real Video Element (Mirrored for natural mirror desktop feel) */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${
                isSimulated ? "" : "-scale-x-100"
              } ${getFilterStyle()}`}
            />

            {/* Holographic HUD Overlay Graticules */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanlines */}
              <div className="absolute inset-0 scanlines opacity-40" />

              {/* Center Targeting Reticle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border border-cyan-400/40 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 border border-cyan-400/60 border-dashed rounded-full animate-spin-slow" />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
                </div>
              </div>

              {/* Corner HUD framing brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              {/* Live Hand Tracking Cursor (Repulsor Ring) */}
              {hand.isDetected && (
                <div
                  className="absolute pointer-events-none transition-all duration-75 flex flex-col items-center"
                  style={{
                    left: `${hand.x * 100}%`,
                    top: `${hand.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={`rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                      hand.gesture === "PINCH_GRAB"
                        ? "w-14 h-14 border-amber-400 bg-amber-400/30 shadow-[0_0_20px_#f59e0b]"
                        : "w-12 h-12 border-cyan-300 bg-cyan-400/20 shadow-[0_0_15px_#22d3ee]"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        hand.gesture === "PINCH_GRAB" ? "bg-amber-300" : "bg-cyan-200"
                      }`}
                    />
                  </div>

                  <div className="mt-1 px-1.5 py-0.5 rounded-xs bg-slate-900/90 border border-cyan-400/60 text-[8px] font-mono-tech text-cyan-300 tracking-wider whitespace-nowrap">
                    {hand.gesture === "PINCH_GRAB"
                      ? "✊ PINCH GRAB"
                      : hand.gesture === "OPEN_PALM"
                      ? "✋ OPEN PALM"
                      : "👆 POINT"}
                  </div>
                </div>
              )}

              {/* Live Scanner Animation when analyzing */}
              {isScanning && (
                <div className="absolute inset-0 bg-cyan-400/10 flex flex-col justify-between">
                  <div className="w-full h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee] animate-pulse" />
                  <div className="w-full text-center py-2 bg-slate-950/80 text-cyan-300 font-orbitron text-[11px] tracking-widest">
                    JARVIS OPTICAL ANALYSIS IN PROGRESS...
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <CameraOff className="w-8 h-8 text-slate-600 mb-2" />
            <span className="text-[11px] font-orbitron text-slate-400 tracking-wider">
              OPTICAL SENSOR STANDBY
            </span>
            <span className="text-[10px] font-mono-tech text-slate-500 mt-1 max-w-xs">
              Activate camera for real-time video vision, run the Hologram Simulation Feed, or upload an image.
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <button
                onClick={onToggleActive}
                className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/60 rounded-xs text-[10px] font-orbitron text-cyan-300 tracking-wider hover:bg-cyan-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3 h-3" />
                <span>ACTIVATE CAMERA</span>
              </button>

              <button
                onClick={() => {
                  if (!isActive) onToggleActive();
                  startSimulationFeed();
                }}
                className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-xs text-[10px] font-orbitron text-slate-300 tracking-wider hover:border-cyan-400/50 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>SIMULATION FEED</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-xs text-[10px] font-orbitron text-slate-300 tracking-wider hover:border-amber-400/50 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3 h-3 text-amber-400" />
                <span>UPLOAD PHOTO</span>
              </button>
            </div>
          </div>
        )}

        {/* Informative error banner with one-click fallback solutions */}
        {streamError && (
          <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col items-center justify-center text-center z-20">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-2 text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-orbitron text-amber-400 mb-1">
              CAMERA ACCESS NOTICE
            </span>
            <span className="text-[10px] font-mono-tech text-slate-300 max-w-sm mb-3">
              {streamError}
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={startCamera}
                className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-400/60 rounded-xs text-[10px] font-orbitron text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>TRY CAMERA</span>
              </button>

              <button
                onClick={startSimulationFeed}
                className="px-2.5 py-1 bg-slate-900 border border-cyan-400/40 rounded-xs text-[10px] font-orbitron text-cyan-200 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>SIMULATION RADAR</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-slate-900 border border-amber-400/50 rounded-xs text-[10px] font-orbitron text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3 h-3 text-amber-400" />
                <span>UPLOAD IMAGE</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls & Scan trigger */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-cyan-400/80 pt-1 border-t border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            {hand.isDetected
              ? `HAND: [${(hand.x * 100).toFixed(0)}%, ${(hand.y * 100).toFixed(0)}%]`
              : isSimulated
              ? "FEED: SYNTHETIC RADAR"
              : "HAND: READY"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Photo Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded-xs font-orbitron text-[9px] tracking-wider bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-400/60 hover:text-amber-300 transition-all cursor-pointer"
            title="Upload photo from disk for Jarvis Vision"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">PHOTO</span>
          </button>

          {/* Main Scan Trigger */}
          <button
            onClick={handleCaptureAndScan}
            disabled={(!isActive && !isSimulated) || isScanning}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xs font-orbitron text-[9px] tracking-wider transition-all ${
              (isActive || isSimulated) && !isScanning
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-cyan-500/40 cursor-pointer"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            }`}
          >
            <Scan className="w-3 h-3" />
            <span>{isScanning ? "SCANNING..." : "SCAN WITH JARVIS"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
