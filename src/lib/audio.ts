/**
 * Web Audio API synthesizer for realistic paper rustle, shuffle, and unfold sound effects.
 * Works seamlessly in all modern browsers without needing external assets.
 */

class SoundController {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Generates a realistic paper shuffle effect with randomized white noise bursts and filtering.
   */
  public playShuffle() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Noise generator modulated by envelope
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        // Modulated bursts representing papers sliding across each other
        const burst = Math.sin(t * Math.PI * 8) * 0.5 + 0.5;
        const envelope = Math.sin(t * Math.PI);
        data[i] = (Math.random() * 2 - 1) * burst * envelope * 0.35;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      console.warn("Audio playShuffle error:", e);
    }
  }

  /**
   * Generates a crisp paper unfold sound with a snap and gentle creasing tone.
   */
  public playUnfold() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const duration = 0.5;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const envelope = Math.pow(1 - t, 2);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(2200, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();

      // Gentle low creasing frequency tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);

      oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio playUnfold error:", e);
    }
  }
}

export const sound = new SoundController();
