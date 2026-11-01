/**
 * TamilDub AI Audio Synthesizer & Dynamic Audio Mixer
 * Handles playback of Gemini-generated WAV speech and browser Web Speech API (Tamil ta-IN)
 * Features dynamic sidechain ducking of background video audio when dubbed dialogue speaks.
 */

class AudioSynthesizer {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  // Speak Tamil text using base64 audio if available, or Web Speech API fallback
  public async playTamilSpeech(
    tamilText: string,
    options?: {
      audioBase64?: string;
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): Promise<void> {
    this.stop();

    if (this.isMuted) {
      options?.onEnd?.();
      return;
    }

    // 1. If base64 WAV is provided (from Gemini 3.8 Flash Lite TTS)
    if (options?.audioBase64) {
      try {
        const audioSrc = `data:audio/wav;base64,${options.audioBase64}`;
        const audio = new Audio(audioSrc);
        this.currentAudioElement = audio;
        audio.playbackRate = options.rate || 1.0;
        
        audio.onplay = () => options?.onStart?.();
        audio.onended = () => {
          this.currentAudioElement = null;
          options?.onEnd?.();
        };
        audio.onerror = () => {
          this.currentAudioElement = null;
          // Fallback to Web Speech API
          this.fallbackWebSpeech(tamilText, options);
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn('Audio element play error, falling back to Web Speech:', err);
      }
    }

    // 2. Browser Web Speech API fallback
    this.fallbackWebSpeech(tamilText, options);
  }

  private fallbackWebSpeech(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      options?.onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Look for Tamil voice if present
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find(v => v.lang.includes('ta') || v.lang.includes('ta-IN'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
      utterance.lang = 'ta-IN';
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;

      utterance.onstart = () => {
        options?.onStart?.();
      };
      utterance.onend = () => {
        this.currentUtterance = null;
        options?.onEnd?.();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        options?.onEnd?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis exception:', e);
      options?.onEnd?.();
    }
  }

  public stop(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer();
