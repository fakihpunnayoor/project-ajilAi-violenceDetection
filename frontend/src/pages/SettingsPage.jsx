import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Bell, 
  Trash2, 
  User, 
  Mail, 
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  ShieldAlert
} from 'lucide-react';
import audioSynthesizer from '../audio/AudioSynthesizer';

const API_BASE = 'http://localhost:8000/api';

export default function SettingsPage({
  alertThreshold,
  setAlertThreshold,
  windowSize,
  setWindowSize,
  streamingFps,
  setStreamingFps,
  isMuted,
  setIsMuted,
  onSyncBackendConfig,
  onClearIncidents,
  onTriggerTestThreat,
  backendMode
}) {
  const [saveStatus, setSaveStatus] = useState(null);

  const handleThresholdChange = (val) => {
    setAlertThreshold(val);
    if (onSyncBackendConfig) onSyncBackendConfig({ alert_threshold: val });
    showSavedBanner();
  };

  const handleWindowSizeChange = (val) => {
    setWindowSize(val);
    if (onSyncBackendConfig) onSyncBackendConfig({ window_size: val });
    showSavedBanner();
  };

  const showSavedBanner = () => {
    setSaveStatus('Parameters synced with neural inference engine');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const toggleAudio = () => {
    const next = audioSynthesizer.toggleMute();
    setIsMuted(next);
  };

  const playTestAudio = () => {
    audioSynthesizer.startAlarm();
    setTimeout(() => audioSynthesizer.stopAlarm(), 1500);
  };

  return (
    <div className="w-full space-y-8 pb-16 max-w-4xl mx-auto px-4">
      {/* Top Header in Orchid Style */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl text-white font-serif-display font-medium tracking-tight">
              System <span className="italic font-normal">Settings</span> & Telemetry
            </h1>
            <span className="text-[10px] tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15 uppercase font-mono">
              CONFIG
            </span>
          </div>
          <p className="text-sm text-white/70 mt-1.5 font-sans">
            Fine-tune spatial-temporal detection sensitivity, hardware buffer sizes, and acoustic alerting.
          </p>
        </div>

        {saveStatus && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Detection & Inference Tuning */}
      <div className="orchid-glass-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5 text-white font-serif-display text-lg border-b border-white/10 pb-3">
          <Sliders className="w-4 h-4 text-white/80" />
          <span>Detection Sensitivity & Temporal Hysteresis</span>
        </div>

        {/* Threshold Slider */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-white font-sans text-sm">Alert Trigger Threshold</div>
              <div className="text-xs text-white/60 font-sans mt-0.5">
                Minimum classification confidence required to trigger audible alarms and evidence harvesting.
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-white bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
                {Math.round(alertThreshold * 100)}%
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0.40"
            max="0.95"
            step="0.05"
            value={alertThreshold}
            onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-white/50 font-sans">
            <span>Aggressive (40%)</span>
            <span className="text-white font-medium">Recommended Standard (70%)</span>
            <span>Conservative (95%)</span>
          </div>
        </div>

        {/* Sliding Buffer Size */}
        <div className="space-y-3 pt-5 border-t border-white/10 font-mono text-xs">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-white font-sans text-sm">Sliding Window Temporal Buffer</div>
              <div className="text-xs text-white/60 font-sans mt-0.5">
                Number of continuous frames maintained in ring memory for recurrent LSTM sequence recognition.
              </div>
            </div>
            <span className="text-sm font-bold text-white bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
              {windowSize} FRAMES
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[8, 16, 24, 32].map((size) => (
              <button
                key={size}
                onClick={() => handleWindowSizeChange(size)}
                className={`py-2.5 px-3 rounded-full border text-center font-medium transition cursor-pointer text-xs ${
                  windowSize === size
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-white/5 border-white/10 text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {size} Frames
              </button>
            ))}
          </div>
        </div>

        {/* Client Streaming FPS Throttle */}
        <div className="space-y-3 pt-5 border-t border-white/10 font-mono text-xs">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-white font-sans text-sm">Webcam Capture Frame Rate</div>
              <div className="text-xs text-white/60 font-sans mt-0.5">
                Canvas sampling rate streamed via WebSocket to the FastAPI inference engine.
              </div>
            </div>
            <span className="text-sm font-bold text-white bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
              {streamingFps} FPS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[10, 15, 20, 30].map((fps) => (
              <button
                key={fps}
                onClick={() => setStreamingFps(fps)}
                className={`py-2.5 px-3 rounded-full border text-center font-medium transition cursor-pointer text-xs ${
                  streamingFps === fps
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-white/5 border-white/10 text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {fps} FPS
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Siren & Audio Alarms */}
      <div className="orchid-glass-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5 text-white font-serif-display text-lg border-b border-white/10 pb-3">
          <Bell className="w-4 h-4 text-white/80" />
          <span>Tactical Audio Siren & Notifications</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-white text-sm font-sans">Synthesized Emergency Siren</div>
            <div className="text-xs text-white/60 font-sans mt-0.5">
              Uses Web Audio API oscillators to generate real-time audible warnings when violence is flagged.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono font-medium transition cursor-pointer ${
                isMuted
                  ? 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'AUDIO MUTED' : 'ALARM ACTIVE'}</span>
            </button>

            <button
              onClick={playTestAudio}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-mono font-medium transition cursor-pointer"
            >
              TEST SOUND
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone & Clear Actions */}
      <div className="orchid-glass-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-white font-serif-display text-lg border-b border-white/10 pb-3">
          <Trash2 className="w-4 h-4 text-rose-300" />
          <span>Audit Log Management</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-white text-sm font-sans">Purge Active Incident History</div>
            <div className="text-xs text-white/60 font-sans mt-0.5">
              Resets all logged incident records and restores defense matrix status to NORMAL.
            </div>
          </div>

          <button
            onClick={onClearIncidents}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 text-xs font-mono font-medium transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR ALL INCIDENTS</span>
          </button>
        </div>
      </div>

      {/* Creator Attribution & Platform Ownership */}
      <div className="orchid-glass-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-white font-serif-display text-lg border-b border-white/10 pb-3">
          <User className="w-4 h-4 text-white/80" />
          <span>Creator Attribution & System Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-sm">
          <div className="space-y-1">
            <div className="text-[10px] text-white/50 uppercase font-mono tracking-wider">Principal Architect & Engineer</div>
            <div className="text-lg font-serif-display font-semibold text-white">Faqih</div>
            <div className="text-xs text-white/70 flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-white/60" />
              <a href="mailto:fakkihpunnayoor@gmail.com" className="hover:underline hover:text-white">
                fakkihpunnayoor@gmail.com
              </a>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-white/50 uppercase font-mono tracking-wider">Platform Version</div>
            <div className="text-base font-serif-display font-medium text-white">Vigil.ai Defense Intelligence Matrix v2.0</div>
            <div className="text-xs text-white/60 font-mono">
              MobileNetV2 (1280) + Motion (64) + Temporal LSTM (128) + WebSocket
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 leading-relaxed font-sans">
          <strong className="text-white/80 font-medium">DISCLAIMER:</strong> Vigil.ai is an artificial intelligence decision-support tool engineered to assist human operators and reduce threat-response latency. Output classifications should be corroborated by authorized security personnel.
        </div>
      </div>
    </div>
  );
}
