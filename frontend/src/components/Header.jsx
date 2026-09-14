import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Cpu, Volume2, VolumeX, Bell, Radio } from 'lucide-react';
import audioSynthesizer from '../audio/AudioSynthesizer';

export default function Header({
  isConnected,
  fps,
  latency,
  backendMode,
  defenseStatus,
  isMuted,
  setIsMuted,
  modelMetrics,
  onTriggerTestThreat
}) {
  const toggleAudio = () => {
    const nextMuted = audioSynthesizer.toggleMute();
    setIsMuted(nextMuted);
  };

  const getStatusBadge = () => {
    switch (defenseStatus) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500 text-red-400 font-mono text-xs font-black tracking-wider animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            CRITICAL THREAT
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500 text-amber-400 font-mono text-xs font-bold tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            ELEVATED RISK
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 font-mono text-xs font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            DEFENSE: NORMAL
          </span>
        );
    }
  };

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur border-b border-cyan-900/40 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Platform Name */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/20 to-transparent" />
            <Radio className="w-5 h-5 text-cyan-400" />
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-white font-mono flex items-center gap-1.5">
                AEGIS<span className="text-cyan-400">VISION</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                PROD v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-mono">
              Temporal Action-Recognition CNN-LSTM Platform
            </p>
          </div>
        </div>

        {/* Status Indicators & Live Telemetry */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Defense Status Level */}
          {getStatusBadge()}

          {/* WebSocket Connection State */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-red-500'}`} />
            <span className="text-slate-300">
              WS: {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          {/* FPS Gauge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{fps} FPS</span>
          </div>

          {/* Latency Gauge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span>{latency} ms</span>
          </div>

          {/* Model Mode */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[140px]" title={backendMode}>
              {backendMode === 'pytorch_pretrained_cnnlstm' ? 'PyTorch Trained' :
               backendMode === 'pytorch_cnnlstm_active' ? 'PyTorch Active' : 'Fallback Engine'}
            </span>
          </div>

          {/* Model Accuracy Benchmark Badge */}
          {modelMetrics?.accuracy_pct && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-[11px] font-mono text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]" title={`F1-Score: ${modelMetrics.f1_score} | Evaluated across 5 datasets`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold">ACC: {modelMetrics.accuracy_pct}%</span>
            </div>
          )}

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg border transition ${
              isMuted
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            }`}
            title={isMuted ? 'Unmute Tactical Siren' : 'Mute Tactical Siren'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Test Threat Siren & Alert Trigger */}
          <button
            onClick={onTriggerTestThreat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/60 text-red-300 font-mono text-xs font-bold transition shadow-sm active:scale-95"
            title="Simulate violent incident to verify alert sirens and incident evidence vault"
          >
            <Bell className="w-3.5 h-3.5 text-red-400" />
            <span>SIMULATE THREAT</span>
          </button>
        </div>
      </div>
    </header>
  );
}
