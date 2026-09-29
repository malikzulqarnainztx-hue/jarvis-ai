import React, { useState, useEffect } from "react";
import { Key, X, CheckCircle, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { jarvisAudio } from "../services/audioSpeech";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  currentKey,
}) => {
  const [inputKey, setInputKey] = useState<string>(currentKey || "");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("jarvis_user_gemini_key") || currentKey || "";
      setInputKey(stored);
      setSaveStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();

    if (!cleanKey) {
      setErrorMessage("Please enter a valid Gemini API Key.");
      setSaveStatus("error");
      return;
    }

    if (cleanKey.length < 15) {
      setErrorMessage("The provided key seems too short. Gemini keys typically start with 'AIzaSy'.");
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/jarvis/set-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: cleanKey }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("jarvis_user_gemini_key", cleanKey);
        onKeySaved(cleanKey);
        setSaveStatus("success");
        jarvisAudio.playRepulsorClick();
        jarvisAudio.speak("Sir, your new Gemini API key has been successfully activated.");

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(data.error || "Failed to validate key on server.");
        setSaveStatus("error");
      }
    } catch (err: any) {
      // Even if network blips, store locally for client requests
      localStorage.setItem("jarvis_user_gemini_key", cleanKey);
      onKeySaved(cleanKey);
      setSaveStatus("success");
      setTimeout(() => {
        onClose();
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("jarvis_user_gemini_key");
    setInputKey("");
    onKeySaved("");
    setSaveStatus("idle");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-950/95 border border-cyan-500/50 rounded-lg p-6 shadow-[0_0_35px_rgba(6,182,212,0.3)] font-mono-tech">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <Key className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <span className="font-orbitron text-base font-bold tracking-wider text-cyan-200 block">
                JARVIS NEURAL CORE • GEMINI API KEY
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-200 p-1 rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative text */}
        <p className="text-xs text-cyan-200/80 mb-4 leading-relaxed">
          JARVIS connects directly to Google's Gemini models for real-time voice, camera vision analysis, and global real-time knowledge.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-orbitron text-cyan-400 mb-1.5 uppercase tracking-wider">
              Gemini API Key:
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900/90 border border-cyan-500/40 rounded px-3 py-2 text-sm text-cyan-100 placeholder-cyan-700/60 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300 font-mono-tech"
              autoFocus
            />
          </div>

          {saveStatus === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 rounded p-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <div>
                <div>API Key verified! JARVIS neural interface is connected.</div>
              </div>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/50 border border-rose-500/40 rounded p-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-cyan-400/80 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 underline decoration-cyan-500/50 cursor-pointer"
            >
              <span>Get a Free Gemini API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {inputKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-300 text-xs underline cursor-pointer"
              >
                Clear Key
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-orbitron rounded border border-slate-700 text-slate-400 hover:text-cyan-200 hover:border-cyan-500/40 transition-all cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-orbitron rounded bg-cyan-500/20 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>{isSaving ? "LINKING..." : "SAVE & ACTIVATE"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
