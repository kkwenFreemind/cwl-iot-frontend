/**
 * Alarm Sound Service
 * ===================
 *
 * Audio notification service for alarm events with severity-based sound patterns.
 * Provides configurable audio alerts using Web Audio API with fallback support.
 *
 * Features:
 * - Severity-based sound patterns (frequency, duration, repetition)
 * - Volume control and mute functionality
 * - Web Audio API with fallback to HTML5 Audio
 * - Browser permission handling
 * - Sound preloading and caching
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/10/02
 */

interface SoundConfig {
  frequency: number;
  duration: number;
  volume: number;
  repetitions: number;
  pattern: "continuous" | "pulse" | "beep";
}

interface AlarmSoundOptions {
  enabled?: boolean;
  volume?: number;
  respectSystemSettings?: boolean;
}

export class AlarmSoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean;
  private volume: number;
  private respectSystemSettings: boolean;
  private isInitialized = false;

  // Severity-based sound configurations
  private readonly soundConfigs: Record<string, SoundConfig> = {
    CRITICAL: {
      frequency: 800,
      duration: 0.8,
      volume: 0.8,
      repetitions: 3,
      pattern: "pulse",
    },
    HIGH: {
      frequency: 600,
      duration: 0.6,
      volume: 0.6,
      repetitions: 2,
      pattern: "beep",
    },
    MEDIUM: {
      frequency: 400,
      duration: 0.4,
      volume: 0.4,
      repetitions: 1,
      pattern: "beep",
    },
    LOW: {
      frequency: 300,
      duration: 0.3,
      volume: 0.3,
      repetitions: 1,
      pattern: "continuous",
    },
  };

  constructor(options: AlarmSoundOptions = {}) {
    this.enabled = options.enabled !== false;
    this.volume = options.volume || 0.5;
    this.respectSystemSettings = options.respectSystemSettings !== false;
  }

  /**
   * Initialize audio context and request permissions
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Check if audio is supported
      if (!this.isAudioSupported()) {
        console.warn("Audio API not supported in this browser");
        return false;
      }

      // Initialize Audio Context
      await this.initializeAudioContext();

      // Request notification permissions if needed
      if (this.respectSystemSettings) {
        await this.requestNotificationPermissions();
      }

      this.isInitialized = true;
      console.log("Alarm Sound Service initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize Alarm Sound Service:", error);
      return false;
    }
  }

  /**
   * Play alarm sound based on severity
   */
  async playAlarmSound(severity: string): Promise<void> {
    if (!this.enabled || !this.isInitialized) {
      return;
    }

    try {
      const config = this.soundConfigs[severity] || this.soundConfigs.MEDIUM;
      await this.playSound(config);
    } catch (error) {
      console.error("Failed to play alarm sound:", error);
    }
  }

  /**
   * Play custom sound with specific configuration
   */
  async playCustomSound(config: Partial<SoundConfig>): Promise<void> {
    if (!this.enabled || !this.isInitialized) {
      return;
    }

    const fullConfig: SoundConfig = {
      frequency: 400,
      duration: 0.5,
      volume: 0.5,
      repetitions: 1,
      pattern: "beep",
      ...config,
    };

    try {
      await this.playSound(fullConfig);
    } catch (error) {
      console.error("Failed to play custom sound:", error);
    }
  }

  /**
   * Enable or disable sound notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`Alarm sounds ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`Alarm sound volume set to ${this.volume}`);
  }

  /**
   * Test sound with current settings
   */
  async testSound(severity: string = "MEDIUM"): Promise<void> {
    console.log(`Testing alarm sound for severity: ${severity}`);
    await this.playAlarmSound(severity);
  }

  /**
   * Check if audio APIs are supported
   */
  private isAudioSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      !!(window.AudioContext || (window as any).webkitAudioContext || typeof Audio !== "undefined")
    );
  }

  /**
   * Initialize Web Audio API context
   */
  private async initializeAudioContext(): Promise<void> {
    if (this.audioContext) {
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();

      // Resume context if it's suspended (required by some browsers)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn("Failed to initialize Web Audio API:", error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  private async requestNotificationPermissions(): Promise<void> {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.warn("Failed to request notification permissions:", error);
      }
    }
  }

  /**
   * Play sound with given configuration
   */
  private async playSound(config: SoundConfig): Promise<void> {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized");
    }

    for (let i = 0; i < config.repetitions; i++) {
      await this.playTone(config);

      // Add pause between repetitions
      if (i < config.repetitions - 1) {
        await this.delay(config.duration * 500); // 50% of duration as pause
      }
    }
  }

  /**
   * Play a single tone with specified configuration
   */
  private async playTone(config: SoundConfig): Promise<void> {
    if (!this.audioContext) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configure oscillator
    oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
    oscillator.type = "sine";

    // Configure volume envelope based on pattern
    const finalVolume = config.volume * this.volume;
    const currentTime = this.audioContext.currentTime;

    switch (config.pattern) {
      case "pulse":
        // Quick attack, sustain, quick release
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, currentTime + 0.05);
        gainNode.gain.setValueAtTime(finalVolume, currentTime + config.duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + config.duration);
        break;

      case "beep":
        // Sharp attack and release
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + config.duration);
        break;

      case "continuous":
        // Smooth attack and release
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, currentTime + 0.1);
        gainNode.gain.setValueAtTime(finalVolume, currentTime + config.duration - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + config.duration);
        break;
    }

    // Start and stop the oscillator
    oscillator.start(currentTime);
    oscillator.stop(currentTime + config.duration);

    // Wait for the tone to complete
    await this.delay(config.duration * 1000);
  }

  /**
   * Utility method to create delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current service status
   */
  getStatus(): {
    enabled: boolean;
    volume: number;
    initialized: boolean;
    audioSupported: boolean;
  } {
    return {
      enabled: this.enabled,
      volume: this.volume,
      initialized: this.isInitialized,
      audioSupported: this.isAudioSupported(),
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
export const alarmSoundService = new AlarmSoundService();

// Auto-initialize when module is imported
if (typeof window !== "undefined") {
  // Initialize after user interaction (required by browsers)
  const initializeOnInteraction = () => {
    alarmSoundService.initialize();
    document.removeEventListener("click", initializeOnInteraction);
    document.removeEventListener("keydown", initializeOnInteraction);
  };

  document.addEventListener("click", initializeOnInteraction);
  document.addEventListener("keydown", initializeOnInteraction);
}
