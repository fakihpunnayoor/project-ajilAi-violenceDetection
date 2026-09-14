import React, { useEffect, useRef } from 'react';
import cinematicBg from '../assets/cinematic_bg.jpg';

export default function CinematicBackground() {
  const bgImgRef = useRef(null);
  const targetOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Very gentle parallax calculation
      const xPct = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to +1
      const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
      targetOffset.current = { x: xPct * 8, y: yPct * 8 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const lerpLoop = () => {
      currentOffset.current.x += (targetOffset.current.x - currentOffset.current.x) * 0.04;
      currentOffset.current.y += (targetOffset.current.y - currentOffset.current.y) * 0.04;

      if (bgImgRef.current) {
        bgImgRef.current.style.transform = `scale(1.05) translate3d(${-currentOffset.current.x}px, ${-currentOffset.current.y}px, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(lerpLoop);
    };

    animFrameRef.current = requestAnimationFrame(lerpLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="cinematic-bg-layer">
      {/* 1. Underlying Pure Black Foundation */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* 2. Dark Atmospheric Background Video */}
      <video
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 filter contrast-115 brightness-80"
      />

      {/* 3. Orchid Overlays — horizontal & vertical dark gradients */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.15) 100%)' }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.55) 100%)' }}
      />
      <div 
        className="absolute top-[-10%] left-[5%] w-[700px] height-[700px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(14,116,144,0.08) 0%, transparent 65%)' }}
      />

      {/* 7. Subtle Animated Scanning Laser Beam */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-sm scanning-beam pointer-events-none" />

      {/* 8. Floating Micro-Particle Stardust Dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-1 h-1 rounded-full bg-cyan-400/50 particle-float-1 shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 rounded-full bg-sky-400/40 particle-float-2 shadow-[0_0_10px_#38bdf8]" />
        <div className="absolute top-3/4 left-1/3 w-1 h-1 rounded-full bg-indigo-400/40 particle-float-3 shadow-[0_0_6px_#818cf8]" />
        <div className="absolute top-1/5 right-1/4 w-1.5 h-1.5 rounded-full bg-cyan-300/40 particle-float-1 shadow-[0_0_8px_#00f0ff]" />
      </div>
    </div>
  );
}
