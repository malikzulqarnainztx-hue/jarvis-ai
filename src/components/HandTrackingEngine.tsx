import React, { useEffect, useRef, useState } from "react";
import { HandGestureType, HandPosition } from "../types";
import { jarvisAudio } from "../services/audioSpeech";

interface HandTrackingEngineProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onHandUpdate: (hand: HandPosition) => void;
  enabled: boolean;
}

export const HandTrackingEngine: React.FC<HandTrackingEngineProps> = ({
  videoRef,
  onHandUpdate,
  enabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastGesture = useRef<HandGestureType>("NONE");
  const lastDispatched = useRef<HandPosition | null>(null);
  const lastDispatchTime = useRef<number>(0);
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "fallback">("loading");

  // MediaPipe HandLandmarker reference
  const landmarkerRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      try {
        const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        if (isCancelled) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (!isCancelled) {
          landmarkerRef.current = landmarker;
          setModelStatus("ready");
        }
      } catch (err) {
        console.warn("MediaPipe CDN model unavailable, using optical hand tracking fallback:", err);
        if (!isCancelled) {
          setModelStatus("fallback");
        }
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  // Tracking loop
  useEffect(() => {
    if (!enabled) return;

    let prevX = 0.5;
    let prevY = 0.5;

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        animFrameId.current = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animFrameId.current = requestAnimationFrame(processFrame);
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw mirrored video frame for analysis
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      let detectedHand: HandPosition = {
        x: prevX,
        y: prevY,
        z: 0.5,
        isDetected: false,
        gesture: "NONE",
        pinchDistance: 1.0,
        confidence: 0,
      };

      // 1. Try MediaPipe HandLandmarker if ready
      if (landmarkerRef.current && video.currentTime > 0) {
        try {
          const results = landmarkerRef.current.detectForVideo(video, performance.now());
          if (results && results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0]; // First hand

            // MediaPipe landmark indices:
            // 0: Wrist
            // 4: Thumb Tip
            // 8: Index Tip
            // 12: Middle Tip
            // 16: Ring Tip
            // 20: Pinky Tip
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            const pinkyTip = landmarks[20] || landmarks[16] || landmarks[12];
            const wrist = landmarks[0];

            // Invert X because camera is mirrored
            const normX = 1 - indexTip.x;
            const normY = indexTip.y;
            const normZ = Math.abs(indexTip.z || 0.5);

            // Compute Euclidean distance between thumb and index tip (pinch)
            const dx = indexTip.x - thumbTip.x;
            const dy = indexTip.y - thumbTip.y;
            const dz = (indexTip.z || 0) - (thumbTip.z || 0);
            const pinchDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Compute hand span (thumb tip to pinky tip) for size scaling
            const spanDx = pinkyTip.x - thumbTip.x;
            const spanDy = pinkyTip.y - thumbTip.y;
            const handSpan = Math.sqrt(spanDx * spanDx + spanDy * spanDy);

            // Compute hand apparent size from wrist to index tip
            const sizeDx = indexTip.x - wrist.x;
            const sizeDy = indexTip.y - wrist.y;
            const handSize = Math.sqrt(sizeDx * sizeDx + sizeDy * sizeDy);

            let gesture: HandGestureType = "OPEN_PALM";
            if (pinchDist < 0.075) {
              gesture = "PINCH_GRAB";
            } else if (pinchDist < 0.12 && handSpan < 0.2) {
              gesture = "PINCH_SHRINK";
            } else if (handSpan > 0.32 || pinchDist > 0.24) {
              gesture = "SPREAD_EXPAND";
            } else if (pinchDist < 0.16) {
              gesture = "POINT";
            } else {
              gesture = "OPEN_PALM";
            }

            // Smooth coords
            const smoothX = prevX * 0.35 + normX * 0.65;
            const smoothY = prevY * 0.35 + normY * 0.65;
            prevX = smoothX;
            prevY = smoothY;

            detectedHand = {
              x: smoothX,
              y: smoothY,
              z: normZ,
              isDetected: true,
              gesture,
              pinchDistance: pinchDist,
              confidence: 0.95,
              handSpan: Math.max(0.1, Math.min(0.6, handSpan)),
              isScaling: gesture === "SPREAD_EXPAND" || gesture === "PINCH_SHRINK" || gesture === "PINCH_GRAB",
              scaleDelta: (handSpan - 0.22) * 2.5,
            };
          }
        } catch (e) {
          // Fall back to optical
        }
      }

      // 2. Optical Hand Tracking Fallback (Real-time Skin/Motion Tracking)
      if (!detectedHand.isDetected) {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          let sumX = 0;
          let sumY = 0;
          let count = 0;

          // Sample pixels for skin-like tones (HSV/RGB skin threshold)
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Skin color condition
            if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
              const pixelIndex = i / 4;
              const px = pixelIndex % canvas.width;
              const py = Math.floor(pixelIndex / canvas.width);

              // Prioritize upper/center screen where user holds hand
              if (py < canvas.height * 0.85) {
                sumX += px;
                sumY += py;
                count++;
              }
            }
          }

          if (count > 220) {
            const avgX = sumX / count;
            const avgY = sumY / count;

            // Normalize
            const normX = avgX / canvas.width;
            const normY = avgY / canvas.height;

            const smoothX = prevX * 0.5 + normX * 0.5;
            const smoothY = prevY * 0.5 + normY * 0.5;
            prevX = smoothX;
            prevY = smoothY;

            // Approximate hand span from optical pixel count
            const normSpan = Math.min(0.6, Math.max(0.12, (count / 2500) * 0.45));
            let gesture: HandGestureType = "OPEN_PALM";
            if (count > 1800) {
              gesture = "SPREAD_EXPAND"; // Large hand close to camera = expand big
            } else if (count < 450) {
              gesture = "PINCH_SHRINK"; // Small hand far from camera = shrink small
            } else if (normSpan < 0.22) {
              gesture = "PINCH_GRAB";
            }

            detectedHand = {
              x: smoothX,
              y: smoothY,
              z: 0.5,
              isDetected: true,
              gesture,
              pinchDistance: gesture === "PINCH_GRAB" ? 0.06 : 0.22,
              confidence: 0.75,
              handSpan: normSpan,
              isScaling: gesture === "SPREAD_EXPAND" || gesture === "PINCH_SHRINK",
              scaleDelta: (normSpan - 0.25) * 2,
            };
          }
        } catch (e) {}
      }

      // Audio feedback on gesture transition
      if (detectedHand.gesture !== lastGesture.current) {
        if (detectedHand.gesture === "PINCH_GRAB") {
          jarvisAudio.playRepulsorClick();
        }
        lastGesture.current = detectedHand.gesture;
      }

      // Throttle and deduplicate dispatches to prevent excessive re-renders
      const now = performance.now();
      const prev = lastDispatched.current;
      const shouldDispatch =
        !prev ||
        prev.isDetected !== detectedHand.isDetected ||
        prev.gesture !== detectedHand.gesture ||
        (detectedHand.isDetected &&
          now - lastDispatchTime.current > 40 &&
          (Math.abs(prev.x - detectedHand.x) > 0.01 ||
            Math.abs(prev.y - detectedHand.y) > 0.01 ||
            (detectedHand.handSpan !== undefined &&
              prev.handSpan !== undefined &&
              Math.abs(prev.handSpan - detectedHand.handSpan) > 0.02)));

      if (shouldDispatch) {
        lastDispatched.current = detectedHand;
        lastDispatchTime.current = now;
        onHandUpdate(detectedHand);
      }

      animFrameId.current = requestAnimationFrame(processFrame);
    };

    animFrameId.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [enabled, onHandUpdate, videoRef]);

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};
