import React from 'react';
import { 
  Eye, 
  Cpu, 
  AlertTriangle, 
  Zap, 
  Layers, 
  ShieldCheck, 
  Gamepad2, 
  Activity, 
  ArrowRight 
} from 'lucide-react';

export default function CapabilitiesPage({ onLaunchDetection, onLaunchGame }) {
  const capabilities = [
    {
      category: "Computer Vision",
      accent: "cyan",
      cardClass: "glass-panel-cyan",
      icon: Eye,
      iconColor: "text-[#00f0ff]",
      title: "Deep Spatial Representation",
      description: "MobileNetV2 neural backbone generating high-dimensional (1,280-D) spatial embeddings per frame to detect human posture, gestures, and close physical proximity."
    },
    {
      category: "Temporal Analysis",
      accent: "purple",
      cardClass: "glass-panel-purple",
      icon: Cpu,
      iconColor: "text-purple-400",
      title: "Recurrent Kinetic Memory",
      description: "Bi-directional temporal LSTM with sequence dropout modeling frame-to-frame velocity transitions over sliding windows to recognize sudden aggressive spikes."
    },
    {
      category: "Violence Detection",
      accent: "red",
      cardClass: "glass-panel-danger",
      icon: AlertTriangle,
      iconColor: "text-red-400",
      title: "Zero False-Positive Engine",
      description: "Trained and validated on multi-dataset benchmarks (RLVS, Hockey, Real Life Violence) with hard-negative filtering against running, dancing, and high-fives."
    },
    {
      category: "Real-Time Processing",
      accent: "blue",
      cardClass: "glass-panel-blue",
      icon: Zap,
      iconColor: "text-sky-400",
      title: "Sub-20ms Pipeline",
      description: "Asynchronous WebSocket frame ingestion delivering 30 FPS inference throughput and instant threat alerts with 18ms sliding-window buffer latency."
    },
    {
      category: "Video Intelligence",
      accent: "cyan",
      cardClass: "glass-panel-cyan",
      icon: Layers,
      iconColor: "text-cyan-300",
      title: "Spatial-Kinetic Dual Fusion",
      description: "Harmonizes visual image features with 64-D frame difference motion vectors to accurately delineate genuine physical aggression from environmental motion."
    },
    {
      category: "AI Reporting",
      accent: "green",
      cardClass: "glass-panel-success",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      title: "Automated Evidence Vault",
      description: "Generates forensic evidence packages capturing onset Frame 01, peak altercation Frame 02, 4.5s incident replay clips, and certified PDF reports."
    },
    {
      category: "Open World Simulation",
      accent: "purple",
      cardClass: "glass-panel-purple",
      icon: Gamepad2,
      iconColor: "text-purple-400",
      title: "3D Security Testing Grid",
      description: "Interactive Three.js open-world city simulation for autonomous surveillance agents, driveable vehicles, civilian NPCs, and realistic incident response scenarios."
    },
    {
      category: "Interactive Monitoring",
      accent: "amber",
      cardClass: "glass-panel-warning",
      icon: Activity,
      iconColor: "text-amber-400",
      title: "Command Telemetry HUD",
      description: "Live camera sensor controls, sensitivity threshold adjusters, confidence timeline sparklines, and real-time security incident simulation triggers."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-6 px-4 font-body select-none">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-white/70 font-medium">
          ENTERPRISE COMPUTER VISION SUITE
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-display font-medium text-white tracking-tight">
          Platform Capabilities
        </h1>
        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          Modular, high-throughput action recognition technologies engineered for zero false-alarm tolerances across critical security infrastructure.
        </p>
      </div>

      {/* 8-Card Semantic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-3xl orchid-glass-card hover:bg-white/[0.08] hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between gap-3 text-left group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
                    {cap.category}
                  </span>
                </div>

                <h3 className="text-base font-serif-display font-medium text-white tracking-wide">
                  {cap.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  {cap.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
                <span>MODULE {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                <span className="text-emerald-400 font-semibold">OPERATIONAL</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
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
          <span>Open World 3D Simulation</span>
        </button>
      </div>
    </div>
  );
}
