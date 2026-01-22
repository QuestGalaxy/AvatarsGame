
import * as THREE from 'three';

class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private currentAtmosphere: string = '';

  private init() {
    if (this.context) return;
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master Gain for overall volume
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.35;

      // Low Pass Filter to make SFX sound "warm"
      this.filter = this.context.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 1200; 
      this.filter.Q.value = 1;

      this.masterGain.connect(this.filter);
      this.filter.connect(this.context.destination);

    } catch (e) {
      console.warn("AudioContext initialization failed", e);
    }
  }

  public unlock() {
    this.init();
    if (this.context?.state === 'suspended') {
      this.context.resume();
    }
  }

  public haptic(pattern: number | number[] = 10) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  private createVoice(freq: number, type: OscillatorType = 'triangle', startTime: number) {
    if (!this.context || !this.masterGain) return null;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    return { osc, gain };
  }

  public setAmbient(atmosphere: 'day' | 'sunset' | 'night' | 'select') {
    // Ambient music logic removed as per user request.
    this.currentAtmosphere = atmosphere;
  }

  playSwitch() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const sound = this.createVoice(440, 'sine', now);
    if (!sound) return;
    sound.osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    sound.gain.gain.setValueAtTime(0.05, now);
    sound.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    sound.osc.start(now);
    sound.osc.stop(now + 0.1);
    this.haptic(5);
  }

  playConfirm() {
    if (!this.context) return;
    const now = this.context.currentTime;
    // Arpeggio SFX
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      const sound = this.createVoice(f, 'sine', now + i * 0.06);
      if (!sound) return;
      sound.gain.gain.setValueAtTime(0.1, now + i * 0.06);
      sound.gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
      sound.osc.start(now + i * 0.06);
      sound.osc.stop(now + i * 0.06 + 0.4);
    });
    this.haptic([10, 20]);
  }

  playMove() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const sound = this.createVoice(180, 'sine', now);
    if (!sound) return;
    sound.osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
    sound.gain.gain.setValueAtTime(0.2, now);
    sound.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    sound.osc.start(now);
    sound.osc.stop(now + 0.15);
    this.haptic(5);
  }

  playSpirit() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const freqs = [880, 1320, 1760];
    freqs.forEach((f, i) => {
      const sound = this.createVoice(f, 'sine', now + i * 0.05);
      if (!sound) return;
      sound.gain.gain.setValueAtTime(0.15, now + i * 0.05);
      sound.gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.5);
      sound.osc.start(now + i * 0.05);
      sound.osc.stop(now + i * 0.05 + 0.5);
    });
    this.haptic([10, 40, 10]);
  }

  playWin() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const chord = [261.63, 329.63, 392.00, 523.25];
    chord.forEach((f, i) => {
      const voice = this.createVoice(f, 'sine', now + i * 0.1);
      if (!voice) return;
      voice.gain.gain.setValueAtTime(0, now + i * 0.1);
      voice.gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.2);
      voice.gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1.5);
      voice.osc.start(now + i * 0.1);
      voice.osc.stop(now + i * 0.1 + 1.5);
    });
    this.haptic([50, 100, 200]);
  }

  playLose() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const voice = this.createVoice(80, 'sine', now);
    if (!voice) return;
    voice.osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
    voice.gain.gain.setValueAtTime(0.4, now);
    voice.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    voice.osc.start(now);
    voice.osc.stop(now + 0.6);
    this.haptic(300);
  }
}

export const audio = new AudioManager();
