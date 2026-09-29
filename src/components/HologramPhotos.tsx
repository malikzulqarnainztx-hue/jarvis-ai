import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Upload,
  Sparkles,
  Layers,
  Filter,
  Eye,
} from "lucide-react";
import { HandPosition } from "../types";
import { jarvisAudio } from "../services/audioSpeech";

interface PhotoItem {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
}

const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: "vortex_core",
    title: "JARVIS AI VORTEX CORE ARCHITECTURE",
    category: "COSMIC NEURAL ENGINE",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    description: "Swirling galactic particle vortex with central AI hex-core and quantum constellation nodes.",
  },
  {
    id: "skyline_mesh",
    title: "CYBER SKYLINE CONSTELLATION MESH",
    category: "METROPOLITAN TELEMETRY",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
    description: "Topological wireframe city skyline network anchoring metropolitan cyber spires.",
  },
  {
    id: "cosmos",
    title: "DEEP SPACE QUANTUM NEBULA",
    category: "ASTROPHYSICS SAT-FEED",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    description: "Deep infrared spectrum composite captured by orbital telescope sensor array.",
  },
  {
    id: "neural_core",
    title: "JARVIS NEURAL SYNAPSE MATRIX",
    category: "SYNTHETIC COGNITION",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    description: "High-dimensional neural lattice with real-time heuristic logic gates.",
  },
];

interface HologramPhotosProps {
  hand?: HandPosition;
  isGrabbed?: boolean;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
}

export const HologramPhotos: React.FC<HologramPhotosProps> = ({
  hand,
  isGrabbed = false,
  scale = 1.0,
  onScaleChange,
}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 50% to 200%
  const [filterMode, setFilterMode] = useState<"cyan" | "gold" | "normal">("cyan");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentPhoto = photos[currentIndex] || photos[0];

  // Adjust zoom with hand gestures if hand detected
  useEffect(() => {
    if (!hand || !hand.isDetected) return;

    if (hand.gesture === "SPREAD_EXPAND" || (hand.handSpan && hand.handSpan > 0.32)) {
      setZoomLevel((prev) => (prev < 220 ? Math.min(220, prev + 3) : prev));
    } else if (hand.gesture === "PINCH_SHRINK" || (hand.handSpan && hand.handSpan < 0.18)) {
      setZoomLevel((prev) => (prev > 50 ? Math.max(50, prev - 3) : prev));
    }
  }, [hand?.isDetected, hand?.gesture, hand?.handSpan]);

  const handleNextPhoto = () => {
    jarvisAudio.playRepulsorClick();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    jarvisAudio.playRepulsorClick();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const newPhoto: PhotoItem = {
        id: `custom_${Date.now()}`,
        title: file.name.toUpperCase().replace(/\.[^/.]+$/, ""),
        category: "USER HOLOGRAPHIC UPLOAD",
        url: result,
        description: `Imported asset (${(file.size / 1024).toFixed(1)} KB) - Ready for holographic inspection.`,
      };
      setPhotos((prev) => [newPhoto, ...prev]);
      setCurrentIndex(0);
      jarvisAudio.playHologramChime();
    };
    reader.readAsDataURL(file);
  };

  const handleQuickSize = (newScale: number) => {
    jarvisAudio.playRepulsorClick();
    if (onScaleChange) {
      onScaleChange(newScale);
    }
    // Also adjust inner zoom
    setZoomLevel(Math.round(newScale * 100));
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 font-mono-tech text-cyan-400 select-none overflow-hidden relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadPhoto}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10 border-b border-cyan-500/30 pb-1.5 text-[10px]">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-orbitron font-semibold text-cyan-300 tracking-wider truncate">
            HOLOGRAPHIC PHOTOS & BLUEPRINTS
          </span>
        </div>

        {/* Hand Size Quick Controls */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-cyan-500 hidden sm:inline">HAND SIZING:</span>
          <button
            onClick={() => handleQuickSize(0.75)}
            className={`px-1.5 py-0.5 rounded-xs text-[9px] border transition-colors cursor-pointer ${
              scale <= 0.8
                ? "bg-cyan-400 text-slate-950 font-bold border-cyan-300"
                : "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20"
            }`}
            title="Make Small with Hand Pinch"
          >
            SMALL
          </button>
          <button
            onClick={() => handleQuickSize(1.0)}
            className={`px-1.5 py-0.5 rounded-xs text-[9px] border transition-colors cursor-pointer ${
              scale > 0.8 && scale < 1.3
                ? "bg-cyan-400 text-slate-950 font-bold border-cyan-300"
                : "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20"
            }`}
            title="Standard Normal Size"
          >
            MED
          </button>
          <button
            onClick={() => handleQuickSize(1.4)}
            className={`px-1.5 py-0.5 rounded-xs text-[9px] border transition-colors cursor-pointer ${
              scale >= 1.3
                ? "bg-cyan-400 text-slate-950 font-bold border-cyan-300"
                : "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20"
            }`}
            title="Make Big with Hand Spread"
          >
            BIG
          </button>
        </div>
      </div>

      {/* Main Holographic Image Stage */}
      <div className="relative flex-1 my-1.5 overflow-hidden rounded-xs border border-cyan-500/30 bg-slate-950/90 flex items-center justify-center group">
        {/* Holographic Scanlines on Image */}
        <div className="absolute inset-0 scanlines pointer-events-none z-10 opacity-30" />

        {/* The Photo with Dynamic Zoom & Sizing */}
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel / 100})`,
          }}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            className={`max-h-full max-w-full object-contain transition-all duration-300 ${
              filterMode === "cyan"
                ? "brightness-95 contrast-125 sepia-[0.3] hue-rotate-[160deg] saturate-150"
                : filterMode === "gold"
                ? "brightness-100 contrast-125 sepia-[0.8] saturate-200 hue-rotate-[15deg]"
                : "brightness-100 contrast-105"
            }`}
          />
        </div>

        {/* Previous & Next Floating Buttons */}
        <button
          onClick={handlePrevPhoto}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition-all opacity-75 hover:opacity-100 cursor-pointer"
          title="Previous Photo"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNextPhoto}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition-all opacity-75 hover:opacity-100 cursor-pointer"
          title="Next Photo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Floating Metadata Card */}
        <div className="absolute bottom-1 left-1 right-1 z-20 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-xs border border-cyan-500/30 flex items-center justify-between text-[9px]">
          <div className="truncate pr-2">
            <span className="text-cyan-200 font-semibold font-orbitron block truncate">
              {currentPhoto.title}
            </span>
            <span className="text-slate-400 text-[8px] truncate block">
              {currentPhoto.description}
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1 font-mono text-[9px] text-cyan-400">
            <span>SIZE: {zoomLevel}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Tool Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-cyan-500/20 text-[9px] text-cyan-400/80">
        {/* Navigation Dots */}
        <div className="flex items-center gap-1">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === currentIndex
                  ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)] scale-125"
                  : "bg-slate-700 hover:bg-cyan-600"
              }`}
            />
          ))}
          <span className="ml-1 text-[8px] text-slate-500">
            ({currentIndex + 1}/{photos.length})
          </span>
        </div>

        {/* Filter Switcher & Upload */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              setFilterMode((prev) =>
                prev === "cyan" ? "gold" : prev === "gold" ? "normal" : "cyan"
              )
            }
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-slate-900 border border-cyan-500/30 text-[8px] text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
            title="Toggle Hologram Shading Filter"
          >
            <Filter className="w-2.5 h-2.5" />
            <span>{filterMode.toUpperCase()}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-cyan-950/60 border border-cyan-400/50 text-[8px] text-cyan-200 hover:bg-cyan-500/30 cursor-pointer"
            title="Upload Photo to Hologram Projector"
          >
            <Upload className="w-2.5 h-2.5" />
            <span>UPLOAD PHOTO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
