export type HologramIconId =
  | "jarvis_core"
  | "globe"
  | "defense_matrix"
  | "world_knowledge"
  | "diagnostics"
  | "camera_vision"
  | "weather_sat"
  | "audio_matrix"
  | "bitcoin"
  | "photos";

export interface HologramWidget {
  id: HologramIconId;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  x: number; // percentage or px
  y: number;
  scale: number;
  rotationY: number;
  sizeMode?: "small" | "medium" | "large";
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "jarvis";
  text: string;
  timestamp: string;
  sources?: GroundingSource[];
  isVoice?: boolean;
  imageThumbnail?: string;
  telemetry?: {
    cpuLoad?: string;
    memory?: string;
    latency?: string;
    neuralSync?: string;
  };
}

export type HandGestureType =
  | "NONE"
  | "OPEN_PALM"
  | "PINCH_GRAB"
  | "POINT"
  | "FIST"
  | "SPREAD_EXPAND"
  | "PINCH_SHRINK"
  | "SWIPE_LEFT"
  | "SWIPE_RIGHT";

export interface HandPosition {
  x: number; // 0 to 1 normalized
  y: number;
  z: number;
  isDetected: boolean;
  gesture: HandGestureType;
  pinchDistance: number;
  confidence: number;
  handSpan?: number; // Spread distance between fingers
  isScaling?: boolean;
  scaleDelta?: number;
}

export interface SystemStatus {
  online: boolean;
  model: string;
  hasApiKey: boolean;
  powerLevel: number;
  defenseLevel: number;
  audioActive: boolean;
  cameraActive: boolean;
  handTrackingActive: boolean;
  language: "hi" | "en";
}
