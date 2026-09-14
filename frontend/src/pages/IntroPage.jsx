import React, { useState, useRef, useEffect } from 'react';
import { Shield, Eye, Gamepad2, ArrowRight, Mail, Sparkles, Radio } from 'lucide-react';

export default function IntroPage({ onEnter, onLaunchGame }) {
  // Mouse tracking state for 3D tilt & magnetic hover
  const [logoTilt, setLogoTilt] = useState({ x: 0, y: 0 });
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [btnRadial, setBtnRadial] = useState({ x: 50, y: 50 });
  const logoRef = useRef(null);
  const btnRef = useRef(null);

  // Holographic 3D Security Target Tracking Mouse
  const [reticlePos, setReticlePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized position (-1 to 1) from viewport center
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setReticlePos({ x: nx * 18, y: ny * 18 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Magnetic hover for Logo
  const handleLogoMouseMove = (e) => {
    if (!logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setLogoTilt({ x: -y * 12, y: x * 12 });
  };

  const handleLogoMouseLeave = () => {
    setLogoTilt({ x: 0, y: 0 });
  };

  // Magnetic hover & Radial glow for ENTER button
  const handleBtnMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 14;
    const normY = (y / rect.height - 0.5) * 14;
    setBtnOffset({ x: normX, y: normY });
    setBtnRadial({ x: Math.round((x / rect.width) * 100), y: Math.round((y / rect.height) * 100) });
  };

  const handleBtnMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-6 sm:p-10 select-none z-10">
      {/* Top Bar: Minimal Status & Creator Badge */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono tracking-widest text-cyan-300 font-bold uppercase">
            DEFENSE INTELLIGENCE PLATFORM
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Created by <strong className="text-cyan-300">Faqih</strong>
        </div>
      </div>

      {/* Center Cinematic Hero Content (Centered, No Vertical Scroll) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto px-4 my-auto relative">
        {/* Interactive 3D Holographic Security Scanner Object */}
        <div
          style={{
            transform: `translate3d(${reticlePos.x}px, ${reticlePos.y}px, 0)`,
            transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
          className="relative mb-6 will-change-transform"
        >
          {/* Circular Holographic Reticle */}
          <div className="relative w-28 h-28 rounded-full border border-cyan-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.15)] bg-gradient-to-b from-cyan-950/30 to-black/60 backdrop-blur-sm">
            {/* Spinning radar arc */}
            <div className="absolute inset-1 rounded-full border-t border-cyan-400/80 radar-sweep" />
            <div className="absolute inset-4 rounded-full border border-dashed border-cyan-500/30" />
            
            {/* Center Shield Core */}
            <div
              ref={logoRef}
              onMouseMove={handleLogoMouseMove}
              onMouseLeave={handleLogoMouseLeave}
              style={{
                transform: `perspective(600px) rotateX(${logoTilt.x}deg) rotateY(${logoTilt.y}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="relative w-14 h-14 rounded-2xl bg-[#030a1c] border border-cyan-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <Shield className="w-7 h-7 text-[#00f0ff] filter drop-shadow-[0_0_8px_#00f0ff]" />
            </div>
          </div>
        </div>

        {/* Company Title */}
        <div
          ref={logoRef}
          onMouseMove={handleLogoMouseMove}
          onMouseLeave={handleLogoMouseLeave}
          style={{
            transform: `perspective(800px) rotateX(${logoTilt.x * 0.5}deg) rotateY(${logoTilt.y * 0.5}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
          className="cursor-default will-change-transform"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium font-serif-display tracking-tight text-white flex items-center justify-center gap-1">
            Vigil<span className="font-sans font-normal text-white/80">.ai</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mt-3">
          <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white/80 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            AI-POWERED VIOLENCE DETECTION
          </span>
        </div>

        {/* Main Tagline */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif-display font-medium text-white tracking-wide mt-6 leading-tight">
          See <em className="italic font-normal">The Threat</em> &bull; Stop The Violence
        </h2>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto mt-4 leading-relaxed font-normal">
          “Advanced computer vision and intelligent video analysis for a safer tomorrow.”
        </p>

        {/* Main Interactive CTA Button with Orchid dark rounded styling */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            ref={btnRef}
            onClick={onEnter}
            onMouseMove={handleBtnMouseMove}
            onMouseLeave={handleBtnMouseLeave}
            style={{
              transform: `perspective(600px) translate3d(${btnOffset.x}px, ${btnOffset.y}px, 0)`,
              transition: 'transform 0.12s ease-out'
            }}
            className="group relative p-[8px_26px_8px_8px] rounded-[16px] orchid-btn-dark hover:bg-[#25252e] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-[0_10px_35px_rgba(0,0,0,0.6)] cursor-pointer flex items-center gap-3 overflow-hidden"
          >
            <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
            </span>
            <span className="text-white flex items-center gap-2">
              ENTER VIGIL.AI
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Quick Access Round Game Button Below CTA */}
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>Or explore 3D simulation:</span>
            <button
              onClick={onLaunchGame}
              title="Launch 3D Open World City Game"
              className="w-9 h-9 rounded-full orchid-glass hover:bg-white/20 text-white flex items-center justify-center transition-all shadow-md hover:scale-110 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-white/80 font-medium cursor-pointer hover:underline" onClick={onLaunchGame}>
              Play Open World Game
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Creator Text */}
      <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-cyan-900/20 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span>Vigil.ai &copy; 2026 &bull; All Rights Reserved</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Mail className="w-3.5 h-3.5 text-cyan-400" />
          <span>For get into touch with email:</span>
          <a
            href="mailto:fakkihpunnayoor@gmail.com"
            className="text-cyan-300 font-bold hover:underline transition"
          >
            fakkihpunnayoor@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
