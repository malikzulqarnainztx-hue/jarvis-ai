import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Zap,
  Globe,
  Shield,
  Search,
  Cpu,
  Camera,
  CloudRain,
  Music,
  Check,
  Plus,
  Move,
  RotateCcw,
  Sparkles,
  Hand,
  Coins,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { HologramIconId, HologramWidget, HandPosition, GroundingSource } from "../types";
import { JarvisAiVortexCore } from "./JarvisAiVortexCore";
import { HologramGlobe } from "./HologramGlobe";
import { DefenseMatrix } from "./DefenseMatrix";
import { WorldKnowledgePanel } from "./WorldKnowledgePanel";
import { CameraHUD } from "./CameraHUD";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { AudioMatrix } from "./AudioMatrix";
import { WeatherSat } from "./WeatherSat";
import { BitcoinMatrix } from "./BitcoinMatrix";
import { HologramPhotos } from "./HologramPhotos";
import { HandGestureHUD } from "./HandGestureHUD";
import { jarvisAudio } from "../services/audioSpeech";

interface HologramWorkspaceProps {
  hand: HandPosition;
  isSpeaking: boolean;
  isListening: boolean;
  powerLevel: number;
  defenseLevel: number;
  isShieldActive: boolean;
  onToggleShield: () => void;
  onPowerBoost: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onScanFrame: (imageBase64: string) => void;
  isScanning: boolean;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onSearchQuery: (q: string) => void;
  recentSources: GroundingSource[];
  lastAnswer?: string;
  isQueryLoading: boolean;
  onVoiceTest: () => void;
  telemetry: any;
}

const DEFAULT_WIDGETS: HologramWidget[] = [
  {
    id: "jarvis_core",
    name: "JARVIS AI Vortex Core",
    description: "Cosmic Neural Engine & Sky-Node Constellation",
    icon: "cpu",
    active: true,
    x: 10,
    y: 10,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "bitcoin",
    name: "Bitcoin 3D Hologram",
    description: "Cryptographic Node & 3D Rotating Token",
    icon: "coins",
    active: true,
    x: 400,
    y: 10,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "photos",
    name: "Holographic Photos Projector",
    description: "Constellation Schematics & Deep Space Gallery",
    icon: "image",
    active: true,
    x: 780,
    y: 10,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "camera_vision",
    name: "Optical Camera Vision",
    description: "Webcam Multimodal Vision & Gesture Capture",
    icon: "camera",
    active: true,
    x: 10,
    y: 350,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "world_knowledge",
    name: "World Knowledge Base",
    description: "Real-time Google Grounded World Intelligence",
    icon: "search",
    active: true,
    x: 400,
    y: 350,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "globe",
    name: "3D Earth Hologram",
    description: "Orbital Sat-Net, Continents & Geo-Sync",
    icon: "globe",
    active: true,
    x: 780,
    y: 350,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "defense_matrix",
    name: "Cyber Security & Firewall",
    description: "Quantum Encryption & Port Shielding",
    icon: "shield",
    active: false,
    x: 10,
    y: 680,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "diagnostics",
    name: "Quantum Diagnostics",
    description: "Neural Load, RAM, Latency & Core Clocks",
    icon: "activity",
    active: false,
    x: 400,
    y: 680,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "audio_matrix",
    name: "Sonic Frequency Matrix",
    description: "Harmonic Spectrum & Voice Diagnostics",
    icon: "music",
    active: false,
    x: 780,
    y: 680,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
  {
    id: "weather_sat",
    name: "Atmospheric Sat-Radar",
    description: "Global Doppler Radar & Atmospheric Telemetry",
    icon: "cloud",
    active: false,
    x: 400,
    y: 1000,
    scale: 1,
    rotationY: 0,
    sizeMode: "medium",
  },
];

export const HologramWorkspace: React.FC<HologramWorkspaceProps> = ({
  hand,
  isSpeaking,
  isListening,
  powerLevel,
  defenseLevel,
  isShieldActive,
  onToggleShield,
  onPowerBoost,
  videoRef,
  onScanFrame,
  isScanning,
  isCameraActive,
  onToggleCamera,
  onSearchQuery,
  recentSources,
  lastAnswer,
  isQueryLoading,
  onVoiceTest,
  telemetry,
}) => {
  const [widgets, setWidgets] = useState<HologramWidget[]>(DEFAULT_WIDGETS);
  const widgetsRef = useRef<HologramWidget[]>(widgets);
  widgetsRef.current = widgets;

  const [grabbedWidgetId, setGrabbedWidgetId] = useState<HologramIconId | null>(null);
  const grabbedWidgetIdRef = useRef<HologramIconId | null>(null);
  grabbedWidgetIdRef.current = grabbedWidgetId;

  const [selectedWidgetId, setSelectedWidgetId] = useState<HologramIconId>("jarvis_core");
  const selectedWidgetIdRef = useRef<HologramIconId>("jarvis_core");
  selectedWidgetIdRef.current = selectedWidgetId;

  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);

  const handleWidgetScaleChange = (id: HologramIconId, newScale: number) => {
    const clamped = Math.max(0.65, Math.min(1.65, Math.round(newScale * 100) / 100));
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              scale: clamped,
              sizeMode: clamped >= 1.3 ? "large" : clamped <= 0.8 ? "small" : "medium",
            }
          : w
      )
    );
  };

  // Hand gesture physics, dragging & real-time hand-sizing
  useEffect(() => {
    if (!hand.isDetected) {
      if (grabbedWidgetIdRef.current !== null) {
        setGrabbedWidgetId(null);
      }
      return;
    }

    // Convert hand coordinates (0 to 1) to screen approximate coordinates
    const handScreenX = hand.x * (typeof window !== "undefined" ? window.innerWidth : 1200);
    const handScreenY = hand.y * (typeof window !== "undefined" ? window.innerHeight : 800);

    const targetWidgetId = grabbedWidgetIdRef.current || selectedWidgetIdRef.current;

    // 1. Hand Gesture Resizing ("small big size I will control with my hands")
    // If hand is spread wide (SPREAD_EXPAND or handSpan > 0.32): increase size to BIG
    if (hand.gesture === "SPREAD_EXPAND" || (hand.handSpan && hand.handSpan > 0.32)) {
      if (targetWidgetId) {
        setWidgets((prev) => {
          const target = prev.find((w) => w.id === targetWidgetId);
          if (!target || (target.scale && target.scale >= 1.6)) return prev;
          const currentScale = target.scale || 1.0;
          const nextScale = Math.min(1.6, Math.round((currentScale + 0.02) * 100) / 100);
          return prev.map((w) =>
            w.id === targetWidgetId
              ? {
                  ...w,
                  scale: nextScale,
                  sizeMode: nextScale >= 1.3 ? "large" : "medium",
                }
              : w
          );
        });
      }
    }
    // If hand is pinching tight / compact (PINCH_SHRINK or small hand far away): decrease size to SMALL
    else if (hand.gesture === "PINCH_SHRINK" || (hand.handSpan && hand.handSpan < 0.18)) {
      if (targetWidgetId) {
        setWidgets((prev) => {
          const target = prev.find((w) => w.id === targetWidgetId);
          if (!target || (target.scale && target.scale <= 0.68)) return prev;
          const currentScale = target.scale || 1.0;
          const nextScale = Math.max(0.68, Math.round((currentScale - 0.02) * 100) / 100);
          return prev.map((w) =>
            w.id === targetWidgetId
              ? {
                  ...w,
                  scale: nextScale,
                  sizeMode: nextScale <= 0.8 ? "small" : "medium",
                }
              : w
          );
        });
      }
    }

    // 2. Hand Gesture Grabbing & Dragging
    if (hand.gesture === "PINCH_GRAB") {
      // If not holding a widget, find the closest active widget to grab
      if (!grabbedWidgetIdRef.current) {
        let closestId: HologramIconId | null = null;
        let minDistance = 500;

        widgetsRef.current.filter((w) => w.active).forEach((w) => {
          const dx = w.x + 180 - handScreenX;
          const dy = w.y + 140 - handScreenY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            minDistance = dist;
            closestId = w.id;
          }
        });

        if (closestId) {
          grabbedWidgetIdRef.current = closestId;
          setGrabbedWidgetId(closestId);
          setSelectedWidgetId(closestId);
          jarvisAudio.playRepulsorClick();
        }
      } else {
        // Drag grabbed widget with hand
        const gid = grabbedWidgetIdRef.current;
        const newX = Math.round(Math.max(10, Math.min(window.innerWidth - 360, handScreenX - 180)));
        const newY = Math.round(Math.max(10, Math.min(window.innerHeight - 320, handScreenY - 140)));

        setWidgets((prev) => {
          const current = prev.find((w) => w.id === gid);
          if (current && Math.abs(current.x - newX) < 4 && Math.abs(current.y - newY) < 4) {
            return prev;
          }
          return prev.map((w) => {
            if (w.id === gid) {
              return { ...w, x: newX, y: newY };
            }
            return w;
          });
        });
      }
    } else if (hand.gesture === "OPEN_PALM") {
      // Release grab if currently grabbing
      if (grabbedWidgetIdRef.current !== null) {
        grabbedWidgetIdRef.current = null;
        setGrabbedWidgetId(null);
      }

      // If open palm, gently rotate selected widget based on hand X position
      const newRotation = Math.round((hand.x - 0.5) * 25);
      const selId = selectedWidgetIdRef.current;
      setWidgets((prev) => {
        const current = prev.find((w) => w.id === selId);
        if (current && Math.abs(current.rotationY - newRotation) < 2) {
          return prev;
        }
        return prev.map((w) => {
          if (w.id === selId) {
            return { ...w, rotationY: newRotation };
          }
          return w;
        });
      });
    } else {
      if (grabbedWidgetIdRef.current !== null) {
        grabbedWidgetIdRef.current = null;
        setGrabbedWidgetId(null);
      }
    }
  }, [hand.isDetected, hand.gesture, hand.x, hand.y, hand.handSpan]);

  const toggleWidgetActive = (id: HologramIconId) => {
    jarvisAudio.playRepulsorClick();
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const resetLayout = () => {
    jarvisAudio.playHologramChime();
    setWidgets(DEFAULT_WIDGETS);
  };

  const activeSelectedWidget = widgets.find((w) => w.id === (grabbedWidgetId || selectedWidgetId));

  const renderWidgetContent = (widget: HologramWidget) => {
    switch (widget.id) {
      case "jarvis_core":
        return (
          <div className="w-full h-full flex items-center justify-center p-2">
            <JarvisAiVortexCore
              isSpeaking={isSpeaking}
              isListening={isListening}
              onSyncCore={onPowerBoost}
              handHover={grabbedWidgetId === "jarvis_core"}
            />
          </div>
        );
      case "bitcoin":
        return (
          <BitcoinMatrix
            hand={hand}
            isGrabbed={grabbedWidgetId === "bitcoin"}
            scale={widget.scale}
            onScaleChange={(newScale) => handleWidgetScaleChange("bitcoin", newScale)}
          />
        );
      case "photos":
        return (
          <HologramPhotos
            hand={hand}
            isGrabbed={grabbedWidgetId === "photos"}
            scale={widget.scale}
            onScaleChange={(newScale) => handleWidgetScaleChange("photos", newScale)}
          />
        );
      case "globe":
        return <HologramGlobe handX={hand.x} isGrabbed={grabbedWidgetId === "globe"} />;
      case "defense_matrix":
        return (
          <DefenseMatrix
            defenseLevel={defenseLevel}
            onToggleShield={onToggleShield}
            isShieldActive={isShieldActive}
          />
        );
      case "world_knowledge":
        return (
          <WorldKnowledgePanel
            onSearchQuery={onSearchQuery}
            recentSources={recentSources}
            lastAnswer={lastAnswer}
            isLoading={isQueryLoading}
          />
        );
      case "camera_vision":
        return (
          <CameraHUD
            videoRef={videoRef}
            hand={hand}
            onScanFrame={onScanFrame}
            isScanning={isScanning}
            isActive={isCameraActive}
            onToggleActive={onToggleCamera}
          />
        );
      case "diagnostics":
        return <DiagnosticsPanel telemetry={telemetry} />;
      case "audio_matrix":
        return (
          <AudioMatrix
            isSpeaking={isSpeaking}
            isListening={isListening}
            onVoiceTest={onVoiceTest}
          />
        );
      case "weather_sat":
        return <WeatherSat />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Background Hologram Grid & Radial Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating Hand Gesture HUD & Size Indicator */}
      <HandGestureHUD
        hand={hand}
        activeWidgetName={activeSelectedWidget?.name}
        activeWidgetScale={activeSelectedWidget?.scale || 1.0}
        onScaleChange={(s) => {
          if (activeSelectedWidget) {
            handleWidgetScaleChange(activeSelectedWidget.id, s);
          }
        }}
        isCameraActive={isCameraActive}
        onToggleCamera={onToggleCamera}
      />

      {/* Main Holographic Workspace Stage (Bento / Responsive Grid with Drag) */}
      <div className="relative w-full h-full p-4 overflow-y-auto pb-24 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto items-start">
          {widgets
            .filter((w) => w.active)
            .map((widget) => {
              const isGrabbed = grabbedWidgetId === widget.id;
              const isSelected = selectedWidgetId === widget.id;
              const currentScale = widget.scale || 1.0;
              const isLarge = currentScale >= 1.25 || widget.sizeMode === "large";
              const isSmall = currentScale <= 0.82 || widget.sizeMode === "small";

              return (
                <motion.div
                  key={widget.id}
                  layout
                  onClick={() => setSelectedWidgetId(widget.id)}
                  className={`relative rounded-xs border transition-all duration-300 flex flex-col bg-slate-950/85 backdrop-blur-md ${
                    isLarge
                      ? "col-span-1 md:col-span-2 h-96 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                      : isSmall
                      ? "col-span-1 h-64"
                      : "col-span-1 h-76 sm:h-80"
                  } ${
                    isGrabbed
                      ? "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-[1.02] z-30 ring-2 ring-amber-400/40"
                      : isSelected
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] z-20"
                      : "border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                  }`}
                  style={{
                    transform: `perspective(1000px) rotateY(${widget.rotationY}deg)`,
                  }}
                >
                  {/* Cyber Holographic Corner Brackets */}
                  <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                  {/* Top Bar with Hologram Title, Hand Size Buttons, and Close */}
                  <div className="w-full flex items-center justify-between px-3 py-1 bg-cyan-950/40 border-b border-cyan-500/20 text-[10px] font-orbitron text-cyan-300">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="truncate">{widget.name}</span>
                      {isSelected && (
                        <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1 rounded-xs border border-cyan-500/30">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Individual Widget Size Steppers */}
                      <div className="flex items-center gap-0.5 bg-slate-900/80 px-1 py-0.5 rounded-xs border border-cyan-500/30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWidgetScaleChange(widget.id, 0.75);
                          }}
                          className={`px-1 text-[8px] rounded-xs cursor-pointer ${
                            isSmall ? "bg-cyan-400 text-slate-950 font-bold" : "text-cyan-400 hover:text-white"
                          }`}
                          title="Small Size (Pinch hand to shrink)"
                        >
                          S
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWidgetScaleChange(widget.id, 1.0);
                          }}
                          className={`px-1 text-[8px] rounded-xs cursor-pointer ${
                            !isSmall && !isLarge ? "bg-cyan-400 text-slate-950 font-bold" : "text-cyan-400 hover:text-white"
                          }`}
                          title="Medium Size"
                        >
                          M
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWidgetScaleChange(widget.id, 1.45);
                          }}
                          className={`px-1 text-[8px] rounded-xs cursor-pointer ${
                            isLarge ? "bg-amber-400 text-slate-950 font-bold" : "text-cyan-400 hover:text-white"
                          }`}
                          title="Big Size (Spread hand to expand)"
                        >
                          L
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWidgetActive(widget.id);
                        }}
                        className="text-slate-400 hover:text-rose-400 transition-colors text-xs px-1 cursor-pointer"
                        title="Hide Module"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Widget Body */}
                  <div className="relative flex-1 w-full overflow-hidden">
                    {renderWidgetContent(widget)}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Holographic Icon Deck (Choose which icons are active on desk) */}
      <div className="absolute bottom-2 left-0 right-0 z-40 px-4">
        <div className="max-w-4xl mx-auto bg-slate-950/90 border border-cyan-500/50 rounded-full px-4 py-2 backdrop-blur-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-orbitron text-cyan-300 shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">HOLOGRAPHIC ICONS:</span>
          </div>

          {/* Module Icons Quick Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-1">
            {widgets.map((widget) => {
              const isActive = widget.active;
              return (
                <button
                  key={widget.id}
                  onClick={() => toggleWidgetActive(widget.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono-tech transition-all border whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      : "bg-slate-900/60 text-slate-500 border-slate-800 hover:border-cyan-500/40"
                  }`}
                  title={`${widget.name} - Click to toggle on desktop`}
                >
                  {isActive ? (
                    <Check className="w-2.5 h-2.5 text-cyan-400" />
                  ) : (
                    <Plus className="w-2.5 h-2.5 text-slate-500" />
                  )}
                  <span>{widget.name}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Layout */}
          <button
            onClick={resetLayout}
            className="p-1.5 rounded-full hover:bg-cyan-500/20 text-cyan-400 transition-colors shrink-0 cursor-pointer"
            title="Reset Holographic Layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
