/**
 * JARVIS Audio & Speech Synthesis Engine
 * Features:
 * - Web Audio API futuristic sound effects (Boot, Repulsor, Target Lock, Scanning)
 * - Male Hindi / Hinglish Speech Synthesis with resonant JARVIS Butler tone
 * - Speech-to-Text Recognition for hands-free audio-to-audio interaction
 */

class JarvisAudioEngine {
  private ctx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking = false;
  private recognition: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initVoices();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private initVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    this.voices = window.speechSynthesis.getVoices();

    // Find best Male Hindi voice or Indian English male voice, else general deep voice
    const hindiVoice = this.voices.find(
      (v) =>
        (v.lang.startsWith("hi") || v.lang.includes("hi-IN") || v.name.toLowerCase().includes("hindi")) &&
        (v.name.toLowerCase().includes("male") ||
          v.name.toLowerCase().includes("hemant") ||
          v.name.toLowerCase().includes("madhav") ||
          v.name.toLowerCase().includes("google") ||
          !v.name.toLowerCase().includes("female"))
    );

    const indianMaleVoice = this.voices.find(
      (v) =>
        (v.lang.includes("en-IN") || v.lang.includes("hi")) &&
        (v.name.toLowerCase().includes("male") ||
          v.name.toLowerCase().includes("ravi") ||
          v.name.toLowerCase().includes("prabhat"))
    );

    const defaultMaleVoice = this.voices.find(
      (v) =>
        v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("george") ||
        v.name.toLowerCase().includes("natural")
    );

    this.selectedVoice = hindiVoice || indianMaleVoice || defaultMaleVoice || this.voices[0] || null;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.selectedVoice = voice;
  }

  /**
   * Speak response using Male Hindi voice tone
   */
  public speak(
    text: string,
    options: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
      pitch?: number;
      rate?: number;
      lang?: string;
    } = {}
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      options.onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text of markdown artifacts for clean speech
    const cleanText = text
      .replace(/[*#`_~]/g, "")
      .replace(/https?:\/\/\S+/g, "link")
      .trim();

    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    const targetLang = options.lang || "en-US";
    const isHindi = targetLang.startsWith("hi");

    if (this.voices.length === 0 && "speechSynthesis" in window) {
      this.voices = window.speechSynthesis.getVoices();
    }

    let voiceToUse: SpeechSynthesisVoice | null = null;
    if (isHindi) {
      voiceToUse =
        this.voices.find(
          (v) =>
            (v.lang.startsWith("hi") || v.lang.includes("hi-IN") || v.name.toLowerCase().includes("hindi")) &&
            !v.name.toLowerCase().includes("female")
        ) ||
        this.voices.find(
          (v) => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi")
        ) ||
        null;
    } else {
      // English male / butler voice
      voiceToUse =
        this.voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.toLowerCase().includes("male") ||
              v.name.toLowerCase().includes("uk english male") ||
              v.name.toLowerCase().includes("daniel") ||
              v.name.toLowerCase().includes("george") ||
              v.name.toLowerCase().includes("david") ||
              v.name.toLowerCase().includes("arthur") ||
              v.name.toLowerCase().includes("natural"))
        ) ||
        this.voices.find((v) => v.lang.startsWith("en") && !v.name.toLowerCase().includes("female")) ||
        this.voices.find((v) => v.lang.startsWith("en")) ||
        null;
    }

    if (voiceToUse) {
      utterance.voice = voiceToUse;
      utterance.lang = voiceToUse.lang;
    } else {
      utterance.lang = isHindi ? "hi-IN" : "en-US";
    }

    // JARVIS signature voice: deep, resonant, measured pace
    utterance.pitch = options.pitch ?? 0.88; // Deep male pitch
    utterance.rate = options.rate ?? 0.95; // Calm articulate pace
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      console.warn("Speech synthesis error or cancelled:", e);
      options.onError?.(e);
      options.onEnd?.();
    };

    // Play subtle high-tech wake chime right before speaking
    this.playHologramChime();

    // Small delay for chime
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 120);
  }

  public stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  // Futuristic Sound Effects using Web Audio API

  /**
   * Hologram / Voice activation chime
   */
  public playHologramChime() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Dual tone cyber chord
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1040, now);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Repulsor / Hand Grab click sound
   */
  public playRepulsorClick() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  /**
   * Optical Scanner Shutter sound
   */
  public playScannerBeep() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1600, now + 0.06);
      osc.frequency.setValueAtTime(2200, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  /**
   * Initialize speech recognition
   */
  public createSpeechRecognizer(
    lang: "hi-IN" | "en-IN" | "en-US" = "hi-IN",
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: any) => void
  ) {
    if (typeof window === "undefined") return null;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      return null;
    }

    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final.trim()) {
        onResult(final.trim(), true);
      } else if (interim.trim()) {
        onResult(interim.trim(), false);
      }
    };

    rec.onerror = (event: any) => {
      onError(event.error);
    };

    return rec;
  }
}

export const jarvisAudio = new JarvisAudioEngine();

/**
 * Continuous Hands-Free Voice Listener
 * Autonomous Voice Experience: Always listening for user's voice without pressing mic button.
 * Automatically sends queries after silence pause and pauses while JARVIS speaks to avoid feedback.
 */
export interface ContinuousListenerCallbacks {
  onInterimText: (text: string) => void;
  onFinalCommand: (text: string) => void;
  onListeningStateChange: (isListening: boolean) => void;
  onError?: (err: string) => void;
}

export class JarvisContinuousListener {
  private recognition: any = null;
  private isEnabled: boolean = false;
  private isListening: boolean = false;
  private lang: string = "hi-IN";
  private silenceTimer: any = null;
  private currentTranscript: string = "";
  private callbacks: ContinuousListenerCallbacks | null = null;
  private restartTimeout: any = null;
  private isPaused: boolean = false;
  private lastSubmittedTime: number = 0;
  private lastSubmittedText: string = "";

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public isHandsFreeEnabled(): boolean {
    return this.isEnabled;
  }

  public start(callbacks: ContinuousListenerCallbacks, lang: string = "hi-IN") {
    this.callbacks = callbacks;
    this.lang = lang;
    this.isEnabled = true;
    this.isPaused = false;
    this.initAndStart();
  }

  public stop() {
    this.isEnabled = false;
    this.isPaused = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }
    this.isListening = false;
    this.callbacks = null;
  }

  public setLanguage(lang: string) {
    if (this.lang === lang) return;
    this.lang = lang;
    if (this.isEnabled && this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
  }

  public pause() {
    this.isPaused = true;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.currentTranscript = "";
    this.callbacks?.onInterimText("");
  }

  public resume() {
    this.isPaused = false;
    this.currentTranscript = "";
    if (this.isEnabled && !this.isListening) {
      this.initAndStart();
    }
  }

  private initAndStart() {
    if (!this.isSupported() || !this.isEnabled || this.isPaused) return;

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = this.lang;

    rec.onstart = () => {
      this.isListening = true;
      this.callbacks?.onListeningStateChange(true);
    };

    rec.onresult = (event: any) => {
      if (this.isPaused || jarvisAudio.isCurrentlySpeaking()) {
        return;
      }

      let interim = "";
      let finalStr = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          finalStr += transcriptPart;
        } else {
          interim += transcriptPart;
        }
      }

      const activeText = (finalStr || interim).trim();
      if (!activeText) return;

      this.currentTranscript = activeText;
      this.callbacks?.onInterimText(activeText);

      // Auto-trigger command after 1.35 seconds of silence
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      this.silenceTimer = setTimeout(() => {
        const textToSubmit = this.currentTranscript.trim();
        if (
          textToSubmit &&
          textToSubmit.length >= 3 &&
          !this.isPaused &&
          !jarvisAudio.isCurrentlySpeaking()
        ) {
          const now = Date.now();
          // Rate-limiting check: avoid spamming within 2.2s or sending identical noise repeatedly
          if (now - this.lastSubmittedTime < 2200) {
            return;
          }
          if (textToSubmit.toLowerCase() === this.lastSubmittedText.toLowerCase() && now - this.lastSubmittedTime < 5000) {
            return;
          }

          this.lastSubmittedTime = now;
          this.lastSubmittedText = textToSubmit;
          this.currentTranscript = "";
          this.callbacks?.onInterimText("");
          this.callbacks?.onFinalCommand(textToSubmit);
        }
      }, 1350);
    };

    rec.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      if (event.error === "not-allowed") {
        this.callbacks?.onError?.("Microphone permission denied. Please click to allow mic access.");
        this.isListening = false;
        this.callbacks?.onListeningStateChange(false);
      }
    };

    rec.onend = () => {
      this.isListening = false;
      this.callbacks?.onListeningStateChange(false);

      // Auto-restart seamless hands-free loop unless explicitly stopped
      if (this.isEnabled && !this.isPaused) {
        if (this.restartTimeout) clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => {
          if (this.isEnabled && !this.isPaused) {
            this.initAndStart();
          }
        }, 180);
      }
    };

    this.recognition = rec;
    try {
      rec.start();
    } catch (e) {
      this.isListening = false;
      this.callbacks?.onListeningStateChange(false);
    }
  }
}

export const continuousVoiceListener = new JarvisContinuousListener();
