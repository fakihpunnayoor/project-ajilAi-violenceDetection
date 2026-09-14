import React from 'react';
import { Mail } from 'lucide-react';

export default function Footer({ isConnected, fps, latency }) {
  return (
    <footer className="w-full bg-black/70 backdrop-blur-xl border-t border-white/10 py-5 px-6 text-xs text-white/70 select-none z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Creator Attribution */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-serif-display font-medium text-sm tracking-wide">
              Vigil.ai
            </span>
            <span className="text-white/40 text-[11px] font-sans">
              &bull; Created by <strong className="text-white/90 font-medium">Faqih</strong>
            </span>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex items-center gap-2 text-[11px] text-white/60 font-sans">
          <Mail className="w-3.5 h-3.5 text-white/70" />
          <span>Contact:</span>
          <a
            href="mailto:fakkihpunnayoor@gmail.com"
            className="text-white/90 font-medium hover:underline hover:text-white"
          >
            fakkihpunnayoor@gmail.com
          </a>
        </div>

        {/* Telemetry Status */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-white/50">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}</span>
          </div>
          <span>&bull;</span>
          <span>LATENCY: {latency || 18}ms</span>
          <span>&bull;</span>
          <span>PyTorch CNN-LSTM v2.0</span>
        </div>
      </div>
    </footer>
  );
}

