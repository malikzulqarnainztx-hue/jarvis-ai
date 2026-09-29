/**
 * JARVIS Desktop AI Assistant
 * Featuring the JARVIS AI Cosmic Vortex Core & Holographic Desktop Interface.
 * Features:
 * - Audio-to-Audio communication with articulate voice (Web Speech + Gemini API)
 * - Computer Camera Multimodal Vision & Optical Scanner
 * - Holographic Hand Gesture Tracking (Pinch-to-grab, open palm rotate, drag modules)
 * - Real-time World Knowledge with Google Search Grounding & Citations
 * - Interactive Modules: JARVIS AI Vortex Core, 3D Globe, Cyber Defense Firewall, Quantum Diagnostics
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { HUDHeader } from "./components/HUDHeader";
import { HologramWorkspace } from "./components/HologramWorkspace";
import { VoiceAssistantBar } from "./components/VoiceAssistantBar";
import { HandTrackingEngine } from "./components/HandTrackingEngine";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { JarvisHUDDialogue } from "./components/JarvisHUDDialogue";
import { HandPosition, GroundingSource, ChatMessage } from "./types";
import { jarvisAudio, continuousVoiceListener } from "./services/audioSpeech";

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Core System States
  const [powerLevel, setPowerLevel] = useState<number>(100);
  const [defenseLevel, setDefenseLevel] = useState<number>(98);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [handTrackingActive, setHandTrackingActive] = useState<boolean>(true);
  const [voiceLanguage, setVoiceLanguage] = useState<"hi" | "en">("en");

  // Hands-Free Auto-Listening States (speaks without clicking mic)
  const [isHandsFreeActive, setIsHandsFreeActive] = useState<boolean>(true);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isMicrophoneActive, setIsMicrophoneActive] = useState<boolean>(false);

  // Key & Modal States
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jarvis_user_gemini_key") || "";
    }
    return "";
  });

  // Interaction States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => Boolean(userApiKey));

  // Check server API key status
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey || userApiKey));
      })
      .catch(() => {});
  }, [userApiKey]);

  // Knowledge & Citations
  const [recentSources, setRecentSources] = useState<GroundingSource[]>([]);
  const [lastUserQuery, setLastUserQuery] = useState<string>("");
  const [lastAnswer, setLastAnswer] = useState<string>(
    "Good day, sir. I am JARVIS, your desktop AI assistant. Camera vision, gesture tracking, and real-time intelligence systems are fully operational."
  );
  const [telemetry, setTelemetry] = useState<any>({
    cpuLoad: "28%",
    memory: "3.4 GB",
    latency: "38ms",
    neuralSync: "99.2%",
  });

  // Hand Position tracking
  const [hand, setHand] = useState<HandPosition>({
    x: 0.5,
    y: 0.5,
    z: 0.5,
    isDetected: false,
    gesture: "NONE",
    pinchDistance: 1.0,
    confidence: 0,
  });

  // Initial Jarvis voice greeting on first user interaction
  useEffect(() => {
    const handleInitialGesture = () => {
      jarvisAudio.playHologramChime();
      jarvisAudio.speak(
        "Good day, sir. All desktop controls, camera vision, and holographic systems are online.",
        {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        }
      );
      window.removeEventListener("click", handleInitialGesture);
    };

    window.addEventListener("click", handleInitialGesture, { once: true });
    return () => {
      window.removeEventListener("click", handleInitialGesture);
    };
  }, []);

  // Hand tracking update callback
  const handleHandUpdate = useCallback((newHand: HandPosition) => {
    setHand(newHand);
  }, []);

  // Core JARVIS AI Query Handler (Audio transcribed text or written prompt)
  const handleSendMessage = async (text: string, imageBase64?: string) => {
    if (!text && !imageBase64) return;
    setIsProcessing(true);
    setLastUserQuery(text || (imageBase64 ? "Camera Frame Visual Scan" : ""));

    try {
      jarvisAudio.playHologramChime();

      const res = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          imageBase64,
          voiceLanguage,
          userApiKey: userApiKey || undefined,
        }),
      });

      const data = await res.json();

      if (data.needsApiKey && !data.quotaExhausted) {
        setHasApiKey(false);
        setIsApiKeyModalOpen(true);
      }

      if (data.reply) {
        setLastAnswer(data.reply);

        if (data.groundingSources && data.groundingSources.length > 0) {
          setRecentSources(data.groundingSources);
        }

        if (data.telemetry) {
          setTelemetry(data.telemetry);
        }

        // Trigger suggested UI actions if detected
        if (data.suggestedAction === "sync_core" || data.suggestedAction === "boost_reactor") {
          setPowerLevel(100);
          jarvisAudio.playHologramChime();
        } else if (data.suggestedAction === "activate_shields") {
          setIsShieldActive(true);
          setDefenseLevel(100);
        } else if (data.suggestedAction === "scan_camera" && !isCameraActive) {
          setIsCameraActive(true);
        }

        // Speak the reply in the selected voice language
        jarvisAudio.speak(data.speechText || data.reply, {
          lang: voiceLanguage === "hi" ? "hi-IN" : "en-US",
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    } catch (err) {
      console.warn("Communication with JARVIS status:", err);
      const fallbackMsg = "Pardon me, sir. An error occurred in the neural communication link. Please try again.";
      setLastAnswer(fallbackMsg);
      jarvisAudio.speak(fallbackMsg, {
        lang: voiceLanguage === "hi" ? "hi-IN" : "en-US",
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
    }
  };

  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Continuous Hands-Free Voice Listener Effect (Auto-listening without clicking mic)
  useEffect(() => {
    if (!continuousVoiceListener.isSupported()) {
      return;
    }

    const langCode = voiceLanguage === "hi" ? "hi-IN" : "en-US";

    if (isHandsFreeActive) {
      continuousVoiceListener.start(
        {
          onInterimText: (text) => {
            setInterimTranscript(text);
          },
          onFinalCommand: (text) => {
            setInterimTranscript("");
            if (text.trim() && !isProcessing && !isSpeaking) {
              handleSendMessageRef.current(text.trim());
            }
          },
          onListeningStateChange: (listening) => {
            setIsMicrophoneActive(listening);
          },
          onError: (err) => {
            console.warn("Hands-free listener error:", err);
          },
        },
        langCode
      );
    } else {
      continuousVoiceListener.stop();
      setIsMicrophoneActive(false);
      setInterimTranscript("");
    }

    return () => {
      continuousVoiceListener.stop();
    };
  }, [isHandsFreeActive, voiceLanguage]);

  // Pause continuous voice listener while Jarvis speaks, processes, or while modal is open
  useEffect(() => {
    if (isSpeaking || isProcessing || isApiKeyModalOpen) {
      continuousVoiceListener.pause();
    } else if (isHandsFreeActive) {
      continuousVoiceListener.resume();
    }
  }, [isSpeaking, isProcessing, isHandsFreeActive, isApiKeyModalOpen]);

  // Multimodal Camera Snapshot Scan Handler
  const handleScanFrame = async (imageBase64: string) => {
    setIsScanning(true);
    const query = "Sir, please analyze this camera frame and describe in detail what you observe in front of the lens.";
    await handleSendMessage(query, imageBase64);
  };

  // Stop current speech
  const handleStopSpeaking = () => {
    jarvisAudio.stopSpeaking();
    setIsSpeaking(false);
  };

  // Synchronize JARVIS AI Vortex Core
  const handlePowerBoost = () => {
    jarvisAudio.playHologramChime();
    setPowerLevel((prev) => (prev >= 100 ? 80 : 100));
    jarvisAudio.speak(
      powerLevel >= 100
        ? "Vortex core frequency normalized to 80%."
        : "Vortex neural core harmonics synchronized to 100%, sir."
    );
  };

  // Toggle Cyber Defense Firewall
  const handleToggleShield = () => {
    jarvisAudio.playRepulsorClick();
    setIsShieldActive((prev) => !prev);
    jarvisAudio.speak(!isShieldActive ? "Cyber defense firewall and quantum encryption online, sir." : "Firewall switched to standby mode.");
  };

  // Test Voice
  const handleVoiceTest = () => {
    jarvisAudio.speak(
      "System check complete. Audio modulation and synthetic acoustics are nominal, sir.",
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      }
    );
  };

  return (
    <div className="relative w-screen h-screen bg-[#030712] text-cyan-400 flex flex-col overflow-hidden select-none font-sans">
      {/* Background Hologram Scanlines */}
      <div className="absolute inset-0 scanlines pointer-events-none z-10 opacity-60" />

      {/* Hand Tracking Engine (processes camera frames in background) */}
      <HandTrackingEngine
        videoRef={videoRef}
        onHandUpdate={handleHandUpdate}
        enabled={handTrackingActive && isCameraActive}
      />

      {/* Top HUD Header */}
      <HUDHeader
        isCameraActive={isCameraActive}
        onToggleCamera={() => setIsCameraActive(!isCameraActive)}
        handTrackingActive={handTrackingActive}
        onToggleHandTracking={() => setHandTrackingActive(!handTrackingActive)}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
        powerLevel={powerLevel}
        hasApiKey={hasApiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        isHandsFreeActive={isHandsFreeActive}
        onToggleHandsFree={() => setIsHandsFreeActive((prev) => !prev)}
      />

      {/* Main Hologram Workspace Stage with Hand Control and Customizable Icons */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* Holographic JARVIS Dialogue / HUD Subtitle Card */}
        <JarvisHUDDialogue
          lastUserQuery={lastUserQuery}
          lastAnswer={lastAnswer}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          onStopSpeaking={handleStopSpeaking}
          voiceLanguage={voiceLanguage}
        />

        <HologramWorkspace
          hand={hand}
          isSpeaking={isSpeaking}
          isListening={isMicrophoneActive || Boolean(interimTranscript)}
          powerLevel={powerLevel}
          defenseLevel={defenseLevel}
          isShieldActive={isShieldActive}
          onToggleShield={handleToggleShield}
          onPowerBoost={handlePowerBoost}
          videoRef={videoRef}
          onScanFrame={handleScanFrame}
          isScanning={isScanning}
          isCameraActive={isCameraActive}
          onToggleCamera={() => setIsCameraActive(!isCameraActive)}
          onSearchQuery={(q) => handleSendMessage(q)}
          recentSources={recentSources}
          lastAnswer={lastAnswer}
          isQueryLoading={isProcessing}
          onVoiceTest={handleVoiceTest}
          telemetry={telemetry}
        />
      </main>

      {/* Bottom Audio-to-Audio Assistant Bar */}
      <VoiceAssistantBar
        onSendMessage={(text) => handleSendMessage(text)}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
        voiceLanguage={voiceLanguage}
        onToggleLanguage={() =>
          setVoiceLanguage((prev) => (prev === "hi" ? "en" : "hi"))
        }
        isHandsFreeActive={isHandsFreeActive}
        onToggleHandsFree={() => setIsHandsFreeActive((prev) => !prev)}
        interimTranscript={interimTranscript}
        isMicrophoneActive={isMicrophoneActive}
        lastAnswer={lastAnswer}
        lastUserQuery={lastUserQuery}
      />

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={userApiKey}
        onKeySaved={(key) => {
          setUserApiKey(key);
          setHasApiKey(Boolean(key));
        }}
      />
    </div>
  );
}
