import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Gamepad2, 
  Layers, 
  Shield, 
  Activity, 
  Cpu, 
  Zap,
  ArrowRight,
  Radio,
  Clock
} from 'lucide-react';

const INK = '#ffffff';

const avatars = [
  'linear-gradient(135deg, #f0abfc, #a855f7)',
  'linear-gradient(135deg, #fdba74, #ea580c)',
  'linear-gradient(135deg, #93c5fd, #2563eb)',
];

const steps = [
  { 
    n: '01', 
    label: 'Connect Feed', 
    icon: <path d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /> 
  },
  { 
    n: '02', 
    label: 'Spatial CNN', 
    icon: <><rect x="3" y="4" width="14" height="10" rx="2" /><path d="M7 20h6M10 14v6" /></> 
  },
  { 
    n: '03', 
    label: 'Temporal LSTM', 
    icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> 
  },
  { 
    n: '04', 
    label: 'Instant Alert', 
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> 
  },
];

export default function HomePage({ setActiveTab }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reticlePos, setReticlePos] = useState({ x: 0, y: 0 });
  const monitorRef = useRef(null);

  // Gentle 3D perspective mouse tracking on surveillance card
  const handleMouseMove = (e) => {
    if (!monitorRef.current) return;
    const rect = monitorRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({ x: -y * 8, y: x * 8 });
    setReticlePos({ x: x * 25, y: y * 25 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setReticlePos({ x: 0, y: 0 });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-12 space-y-16 select-none font-body text-left">
      {/* ========================================================= */}
      {/* 1. HERO SECTION (ORCHID AESTHETIC REIMAGINED FOR VIGIL)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-2">
        {/* LEFT COLUMN: ANCHORED HERO CONTENT */}
        <div className="lg:col-span-7 space-y-6 max-w-xl">
          {/* Avatar Cluster Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5"
          >
            <div className="flex p-[3px] bg-white/15 rounded-full backdrop-blur-md">
              {avatars.map((bg, i) => (
                <span 
                  key={i} 
                  style={{ background: bg }}
                  className={`w-[22px] h-[22px] rounded-full border-2 border-black/60 ${i > 0 ? '-ml-2' : ''}`}
                />
              ))}
            </div>
            <span className="text-[13px] text-white/90 font-medium tracking-normal drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
              +10,000 security cameras already monitored with “Vigil.ai”
            </span>
          </motion.div>

          {/* Large Serif Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.85, delay: 0.22, ease: 'easeOut' }}
            className="font-serif-display font-medium text-white tracking-tight leading-[1.04]"
            style={{ 
              fontSize: 'clamp(2.5rem, 5.2vw, 4.4rem)',
              textShadow: '0 2px 30px rgba(0,0,0,0.5)'
            }}
          >
            Detect <em className="italic font-normal font-serif-display">Real-Time Threats</em><br />
            The Simple Way
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 18 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="text-[13.5px] leading-relaxed text-white/75 font-normal max-w-md drop-shadow-[0_1px_14px_rgba(0,0,0,0.5)]"
          >
            Beautifully intelligent computer vision and temporal deep learning. Your surveillance network is just four steps away from protecting itself.
          </motion.p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {/* Primary Dark Button with Embedded Icon Tile */}
            <motion.button
              onClick={() => setActiveTab('live')}
              initial={{ opacity: 0, y: 18 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.54, ease: 'easeOut' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 p-[7px_22px_7px_7px] rounded-[14px] orchid-btn-dark cursor-pointer group"
            >
              <span className="w-[34px] h-[34px] rounded-[10px] bg-white/15 flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              </span>
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white">
                Start Live Detection
              </span>
            </motion.button>

            {/* Secondary Frosted Glass Button */}
            <motion.button
              onClick={() => setActiveTab('game')}
              initial={{ opacity: 0, y: 18 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.58, ease: 'easeOut' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-[14px] orchid-glass hover:bg-white/15 text-white text-[11px] font-semibold tracking-[0.08em] uppercase transition cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-white/80" />
              <span>Explore Open World</span>
            </motion.button>
          </div>

          {/* Creator Attribution */}
          <div className="flex items-center gap-2 text-xs text-white/50 pt-1">
            <span>Created by <strong className="text-white font-semibold">Faqih</strong></span>
            <span>&bull;</span>
            <a href="mailto:fakkihpunnayoor@gmail.com" className="text-white/70 hover:text-white transition">
              fakkihpunnayoor@gmail.com
            </a>
          </div>

          {/* Four-Step Workflow Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
            className="flex flex-wrap sm:flex-nowrap gap-3 pt-6"
          >
            {steps.map((step) => (
              <div key={step.n} className="w-[84px] flex-shrink-0">
                <div className="h-[74px] rounded-[12px] orchid-step-card p-3 flex flex-col justify-between">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {step.icon}
                  </svg>
                  <span className="text-[10.5px] font-semibold text-white truncate">
                    {step.label}
                  </span>
                </div>
                <div className="mt-2 text-left">
                  <span className="text-[10.5px] font-semibold text-white/70">
                    {step.n}
                  </span>
                  <div className="mt-1 w-[19px] h-[2px] rounded-full bg-white/40" />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT COLUMN: FLOATING FROSTED GLASS SURVEILLANCE PREVIEW */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <motion.div
            ref={monitorRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.12s ease-out'
            }}
            className="relative w-full aspect-video rounded-3xl orchid-glass p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden cursor-crosshair group"
          >
            {/* Top Bar with Live Telemetry */}
            <div className="flex items-center justify-between text-[11px] text-white/90 border-b border-white/10 pb-2.5 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-white tracking-wide">OPTICAL SENSOR // CAM-08</span>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] text-white/60">
                <span>[DEMO] 30 FPS</span>
                <span>&bull;</span>
                <span>18ms</span>
              </div>
            </div>

            {/* Central Animated Reticle */}
            <div className="relative w-full flex-1 flex items-center justify-center my-2 overflow-hidden">
              {/* Pedestrian Box Safe */}
              <div className="absolute left-4 bottom-3 w-24 h-28 rounded-xl border border-white/30 bg-white/5 p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[8px] text-white/80 font-bold">
                  <span>SUB-01</span>
                  <span className="text-emerald-400">SAFE</span>
                </div>
                <div className="text-[7px] text-white/50">WALK: 99.2%</div>
              </div>

              {/* Dynamic Mouse Crosshair */}
              <div
                style={{
                  transform: `translate3d(${reticlePos.x}px, ${reticlePos.y}px, 0)`,
                  transition: 'transform 0.08s ease-out'
                }}
                className="relative w-36 h-28 rounded-2xl border border-white/80 bg-white/10 backdrop-blur-md p-2 flex flex-col justify-between shadow-[0_0_30px_rgba(255,255,255,0.2)] z-10"
              >
                <div className="flex justify-between items-start text-[8px] font-semibold text-white">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    TARGET ACQUIRED
                  </span>
                  <span className="px-1 py-0.5 rounded bg-white/20 text-[7px]">
                    SCANNING
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full border border-white/40 border-t-white flex items-center justify-center animate-spin">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                <div className="flex justify-between items-end text-[8px] text-white/70">
                  <span>VECTOR 1,344-D</span>
                  <span className="text-white font-bold">TEMPORAL BUFFER</span>
                </div>
              </div>

              {/* Pedestrian Box Idle */}
              <div className="absolute right-4 top-3 w-20 h-24 rounded-xl border border-white/25 bg-white/5 p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[8px] text-white/70 font-bold">
                  <span>SUB-02</span>
                  <span>IDLE</span>
                </div>
                <div className="text-[7px] text-white/40">BENIGN: 98.7%</div>
              </div>
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="flex items-center justify-between text-[9px] text-white/70 pt-2 border-t border-white/10 z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>[DEMO] SYSTEM ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span>AI ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>CNN-LSTM</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THREE ELEGANT FROSTED GLASS FEATURE CARDS              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Card 1: REAL-TIME DETECTION */}
        <div className="p-6 rounded-3xl orchid-glass-card hover:bg-white/[0.08] transition-all duration-300 flex flex-col justify-between gap-5 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 font-medium">
                30 FPS STREAM
              </span>
            </div>
            <h3 className="text-lg font-serif-display font-medium text-white tracking-wide">
              Real-Time Optical Detection
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-normal">
              Ultra-low latency sliding-window temporal inference analyzing continuous video frames for instantaneous violence recognition.
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span>Sliding Buffer</span>
            <span className="text-white font-medium">16 Frames Window</span>
          </div>
        </div>

        {/* Card 2: INTELLIGENT VIDEO ANALYSIS */}
        <div className="p-6 rounded-3xl orchid-glass-card hover:bg-white/[0.08] transition-all duration-300 flex flex-col justify-between gap-5 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 font-medium">
                DUAL FUSION
              </span>
            </div>
            <h3 className="text-lg font-serif-display font-medium text-white tracking-wide">
              Intelligent Video Analysis
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-normal">
              Dual-stream spatial-kinetic fusion combining deep MobileNetV2 representations with frame difference motion vectors to eliminate false alarms.
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span>Spatial + Kinetic</span>
            <span className="text-white font-medium">1,344-D Vector</span>
          </div>
        </div>

        {/* Card 3: FORENSIC VAULT & REPORTING */}
        <div className="p-6 rounded-3xl orchid-glass-card hover:bg-white/[0.08] transition-all duration-300 flex flex-col justify-between gap-5 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 font-medium">
                FORENSIC VAULT
              </span>
            </div>
            <h3 className="text-lg font-serif-display font-medium text-white tracking-wide">
              AI-Powered Forensic Dossiers
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-normal">
              Automated evidence extraction pinpointing onset and peak threat frames, 4.5-second replay clips, and tamper-evident PDF documentation.
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span>Evidence Suite</span>
            <span className="text-white font-medium">PDF &amp; Replay Gen</span>
          </div>
        </div>
      </div>
    </div>
  );
}
