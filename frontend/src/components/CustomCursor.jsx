import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const spotlightRef = useRef(null);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse positions and smoothed lerp state
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const animFrameId = useRef(null);

  useEffect(() => {
    // Check if device supports fine pointer (mouse, not touch)
    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      setIsFinePointer(false);
      return;
    }

    setIsFinePointer(true);
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${e.clientX}px`;
        spotlightRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    // Smooth Lerp loop for the outer cursor ring
    const renderLoop = () => {
      const lerpFactor = 0.18;
      ring.current.x += (mouse.current.x - ring.current.x) * lerpFactor;
      ring.current.y += (mouse.current.y - ring.current.y) * lerpFactor;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <>
      {/* Soft blue spotlight following the cursor */}
      <div ref={spotlightRef} className="mouse-spotlight" />

      {/* Small Glowing Electric Blue Cursor Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <div className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff,0_0_20px_#0ea5e9]" />
      </div>

      {/* Larger Circular Cursor Ring with smooth easing */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <div
          className={`rounded-full border border-cyan-400/60 transition-all duration-150 flex items-center justify-center ${
            isHovered
              ? 'w-11 h-11 bg-cyan-500/15 border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-110'
              : 'w-8 h-8 bg-cyan-950/20 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
          }`}
        >
          {/* Subtle scanning crosshairs */}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
        </div>
      </div>
    </>
  );
}
