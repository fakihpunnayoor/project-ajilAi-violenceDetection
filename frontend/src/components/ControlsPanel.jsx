import React from 'react';
import { Sliders, Layers, Zap, Trash2, Bell, AlertTriangle } from 'lucide-react';

export default function ControlsPanel({
  alertThreshold,
  setAlertThreshold,
  windowSize,
  setWindowSize,
  streamingFps,
  setStreamingFps,
  onClearIncidents,
  onTriggerTestThreat,
  onSyncBackendConfig
}) {
  const handleThresholdChange = (e) => {
    const val = parseFloat(e.target.value);
    setAlertThreshold(val);
    onSyncBackendConfig({ alert_threshold: val });
  };

  const handleWindowChange = (size) => {
    setWindowSize(size);
    onSyncBackendConfig({ window_size: size });
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl font-mono text-xs">
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
          <Sliders className="w-4 h-4" />
        </div>
        <span className="font-bold text-slate-200 tracking-wider">
          TACTICAL CONTROL MATRIX
        </span>
      </div>

      {/* Sensitivity Threshold Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ALERT SENSITIVITY THRESHOLD
          </span>
          <span className="text-cyan-300 font-bold text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {(alertThreshold * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0.40"
          max="0.95"
          step="0.05"
          value={alertThreshold}
          onChange={handleThresholdChange}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>HIGH SENSITIVITY (40%)</span>
          <span>STANDARD (70%)</span>
          <span>STRICT (95%)</span>
        </div>
      </div>

      {/* Sliding Window Size Selector */}
      <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            TEMPORAL WINDOW BUFFER
          </span>
          <span className="text-slate-300">{windowSize} Frames</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[8, 16, 24, 32].map((sz) => (
            <button
              key={sz}
              onClick={() => handleWindowChange(sz)}
              className={`py-1.5 rounded-lg border transition text-center font-bold ${
                windowSize === sz
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Target FPS Rate Limiter */}
      <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-slate-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            TARGET SAMPLING RATE
          </span>
          <span className="text-slate-300">{streamingFps} FPS</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[10, 15, 20, 30].map((fps) => (
            <button
              key={fps}
              onClick={() => setStreamingFps(fps)}
              className={`py-1.5 rounded-lg border transition text-center font-bold ${
                streamingFps === fps
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {fps}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onTriggerTestThreat}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold transition shadow-sm"
        >
          <Bell className="w-3.5 h-3.5 text-red-400" />
          TEST THREAT
        </button>

        <button
          onClick={onClearIncidents}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          CLEAR LOGS
        </button>
      </div>
    </div>
  );
}
