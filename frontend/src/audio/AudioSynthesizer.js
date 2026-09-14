/**
 * Web Audio API Synthesizer for AegisVision
 * Pure code synthesis of tactical alarms, warning pings, and incident alerts.
 * Zero external audio files or network dependencies.
 */
class TacticalAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.sirenOsc1 = null;
    this.sirenOsc2 = null;
    this.sirenGain = null;
    this.sirenInterval = null;
    this.isSirenActive = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAlarm();
    }
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopAlarm();
    }
  }

  /**
   * High-tech short tactical beep for HUD actions or elevated threat
   */
  playWarningBlip() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Audio warning blip failed:", e);
    }
  }

  /**
   * High-priority recurring emergency alarm siren when violence is detected
   */
  startAlarm() {
    if (this.isMuted || this.isSirenActive) return;
    this.init();
    this.isSirenActive = true;

    try {
      const playTone = () => {
        if (!this.isSirenActive || this.isMuted) return;
        const now = this.ctx.currentTime;
        
        // Dual-tone frequency sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.linearRampToValueAtTime(1250, now + 0.22);
        osc.frequency.linearRampToValueAtTime(850, now + 0.44);

        // Gentle bandpass filter to sound like an authentic high-grade defense klaxon
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1050;
        filter.Q.value = 3.0;

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      };

      playTone();
      this.sirenInterval = setInterval(playTone, 500);
    } catch (e) {
      console.warn("Audio alarm failed:", e);
    }
  }

  /**
   * Stop the active siren
   */
  stopAlarm() {
    this.isSirenActive = false;
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
  }

  /**
   * Snapshot camera shutter sound
   */
  playShutter() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * Positive reward chime for score, report, and achievements
   */
  playChime(freq = 587.33) {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  /**
   * Vehicle engine acceleration pitch sound
   */
  playEngineRev() {
    if (this.isMuted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.25);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

export const audioSynthesizer = new TacticalAudioSynthesizer();
export default audioSynthesizer;

