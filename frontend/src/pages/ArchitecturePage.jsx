import React from 'react';
import { 
  Video, 
  Sliders, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  ArrowDown, 
  ArrowRight,
  Layers,
  Database
} from 'lucide-react';

export default function ArchitecturePage({ onLaunchDetection, onLaunchGame }) {
  const architectureFlow = [
    {
      id: "01",
      step: "VIDEO INPUT",
      role: "Data Flow Ingestion",
      colorType: "cyan",
      borderColor: "border-cyan-500/40 hover:border-cyan-400",
      glowColor: "shadow-[0_0_20px_rgba(0,240,255,0.15)]",
      badgeColor: "bg-cyan-950/80 text-cyan-300 border-cyan-500/50",
      iconColor: "text-[#00f0ff]",
      icon: Video,
      tensor: "Stream: 20-30 FPS // RTSP, WebRTC, Canvas",
      description: "Asynchronous frame capture buffering raw surveillance feeds into a low-latency sliding window queue."
    },
    {
      id: "02",
      step: "PREPROCESSING",
      role: "Spatial Normalization",
      colorType: "blue",
      borderColor: "border-sky-500/40 hover:border-sky-400",
      glowColor: "shadow-[0_0_20px_rgba(14,165,233,0.15)]",
      badgeColor: "bg-sky-950/80 text-sky-300 border-sky-500/50",
      iconColor: "text-sky-400",
      icon: Sliders,
      tensor: "Tensor: 16 Frames × 224×224×3 RGB",
      description: "Frame resizing, ImageNet standard normalization, and optical frame-differencing matrix extraction."
    },
    {
      id: "03",
      step: "CNN FEATURE EXTRACTION",
      role: "Deep Visual Embeddings",
      colorType: "purple",
      borderColor: "border-purple-500/40 hover:border-purple-400",
      glowColor: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
      badgeColor: "bg-purple-950/80 text-purple-300 border-purple-500/50",
      iconColor: "text-purple-400",
      icon: Cpu,
      tensor: "Spatial Backbone: MobileNetV2 (1,280-D)",
      description: "Frozen/fine-tuned inverted residual blocks extract rich spatial feature representations for each individual frame."
    },
    {
      id: "04",
      step: "LSTM TEMPORAL ANALYSIS",
      role: "Recurrent Kinetic Memory",
      colorType: "purple",
      borderColor: "border-purple-500/40 hover:border-purple-400",
      glowColor: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
      badgeColor: "bg-purple-950/80 text-purple-300 border-purple-500/50",
      iconColor: "text-purple-400",
      icon: Activity,
      tensor: "Recurrent State: 128 Hidden Units (1,344-D Fused)",
      description: "Two-layer kinetic LSTM network with dropout tracks rapid limb accelerations and physical confrontations across the temporal sequence."
    },
    {
      id: "05",
      step: "VIOLENCE CLASSIFICATION",
      role: "Action Likelihood Scoring",
      colorType: "red",
      borderColor: "border-red-500/40 hover:border-red-400",
      glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
      badgeColor: "bg-red-950/80 text-red-300 border-red-500/50",
      iconColor: "text-red-400",
      icon: AlertTriangle,
      tensor: "Dense FC + Sigmoid: [0.00 – 1.00]",
      description: "Dense classification head projecting recurrent hidden states to continuous threat probabilities with dual-threshold hysteresis."
    },
    {
      id: "06",
      step: "DETECTION RESULT",
      role: "State Discrimination",
      colorType: "green",
      borderColor: "border-emerald-500/40 hover:border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
      iconColor: "text-emerald-400",
      icon: ShieldCheck,
      tensor: "Binary Verdict: SAFE (0) or VIOLENCE (1)",
      description: "Real-time decision trigger executing WebSocket client broadcasts, audible alert tones, and visual dashboard overlays."
    },
    {
      id: "07",
      step: "REPORT",
      role: "Forensic Evidence Packaging",
      colorType: "green",
      borderColor: "border-emerald-500/40 hover:border-emerald-400",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
      iconColor: "text-emerald-400",
      icon: FileText,
      tensor: "Evidence Vault: PDF + Frame 01 + Frame 02 + MP4",
      description: "Automated tamper-evident audit archiving with certified timestamps, confidence metrics, and downloadable forensics."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-6 px-4 font-body select-none">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-white/70 font-medium">
          NEURAL PIPELINE FLOW
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-display font-medium text-white tracking-tight">
          System Architecture
        </h1>
        <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
          End-to-end spatial-temporal action recognition engine combining MobileNetV2 spatial representations with recurrent kinetic memory.
        </p>
      </div>

      {/* ========================================================= */}
      {/* ANIMATED VERTICAL ARCHITECTURE PIPELINE FLOW              */}
      {/* Flow: VIDEO INPUT -> PREPROCESSING -> CNN -> LSTM ->      */}
      {/*       VIOLENCE CLASSIFICATION -> RESULT -> REPORT         */}
      {/* ========================================================= */}
      <div className="space-y-4">
        {architectureFlow.map((node, idx) => {
          const Icon = node.icon;
          const isLast = idx === architectureFlow.length - 1;

          return (
            <React.Fragment key={node.id}>
              {/* Architecture Node Card */}
              <div
                className="p-5 sm:p-6 rounded-3xl orchid-glass hover:bg-white/[0.09] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left group shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Icon Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-inner shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-serif-display font-medium text-white tracking-wide">
                        {node.step}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/80">
                        {node.role}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 max-w-xl leading-relaxed font-normal">
                      {node.description}
                    </p>
                  </div>
                </div>

                {/* Tensor Specification Pill */}
                <div className="sm:text-right shrink-0">
                  <div className="text-[9px] text-white/50 uppercase tracking-wider">
                    SPECIFICATION
                  </div>
                  <div className="text-xs font-mono font-medium text-white/90 mt-0.5">
                    {node.tensor}
                  </div>
                </div>
              </div>

              {/* Animated Data Flow Connector Line */}
              {!isLast && (
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400/60 to-sky-500/60 relative overflow-hidden">
                    {/* Pulsing data packet light moving down */}
                    <div className="w-full h-3 bg-white rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#020614] border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                    <ArrowDown className="w-3 h-3 animate-bounce" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Model Benchmark Verification Spec Card */}
      <div className="p-6 rounded-3xl glass-panel-blue grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="space-y-1">
          <div className="text-[10px] font-tech text-slate-400 uppercase tracking-widest">Backbone Weights</div>
          <div className="text-lg font-black text-white font-display">violence_cnnlstm.pth</div>
          <div className="text-[11px] font-tech text-cyan-300">PyTorch CNN-LSTM v2.0</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-tech text-slate-400 uppercase tracking-widest">Validation Accuracy</div>
          <div className="text-lg font-black text-emerald-400 font-display">98.5% Balanced</div>
          <div className="text-[11px] font-tech text-slate-400">0% FP on Hard-Negatives</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-tech text-slate-400 uppercase tracking-widest">Execution Latency</div>
          <div className="text-lg font-black text-sky-400 font-display">~18 ms / Frame</div>
          <div className="text-[11px] font-tech text-slate-400">Real-time sliding buffer</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={onLaunchDetection}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl orchid-btn-dark hover:bg-[#25252e] text-white font-medium text-xs tracking-wider transition-all shadow-[0_10px_25px_rgba(0,0,0,0.4)] cursor-pointer hover:scale-105 uppercase"
        >
          <span>Launch Detection Console</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onLaunchGame}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl orchid-glass hover:bg-white/15 text-white font-medium text-xs tracking-wider transition-all cursor-pointer hover:scale-105 uppercase"
        >
          <span>Open World 3D Game</span>
        </button>
      </div>
    </div>
  );
}
