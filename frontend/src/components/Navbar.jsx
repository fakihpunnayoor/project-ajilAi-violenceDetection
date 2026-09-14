import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import audioSynthesizer from '../audio/AudioSynthesizer';

const INK = '#ffffff';

export default function Navbar({
  activeTab,
  setActiveTab,
  isConnected,
  defenseStatus,
  isMuted,
  setIsMuted
}) {
  const toggleAudio = () => {
    const nextMuted = audioSynthesizer.toggleMute();
    setIsMuted(nextMuted);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'live', label: 'Detection' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'upload', label: 'Upload Video' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-black/35 backdrop-blur-md border-b border-white/10 select-none"
    >
      {/* Logo */}
      <div 
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="28" height="28" rx="9" stroke={INK} strokeWidth="1.5" />
          <g fill="none" stroke={INK} strokeWidth="1.3">
            <ellipse cx="16" cy="11.2" rx="2.3" ry="3.3" />
            <ellipse cx="16" cy="20.8" rx="2.3" ry="3.3" />
            <ellipse cx="11.2" cy="16" rx="3.3" ry="2.3" />
            <ellipse cx="20.8" cy="16" rx="3.3" ry="2.3" />
          </g>
          <circle cx="16" cy="16" r="1.7" fill={INK} />
        </svg>
        <span className="text-xl font-semibold tracking-tight text-white font-serif-display">
          Vigil<span className="font-sans font-normal text-white/80">.ai</span>
        </span>
      </div>

      {/* Center Links with Dot Separators (Desktop) */}
      <nav className="hidden md:flex items-center gap-4.5 absolute left-1/2 -translate-x-1/2">
        {navItems.map((item, i) => {
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="flex items-center gap-4.5">
              {i > 0 && (
                <span className="w-1 h-1 rounded-full bg-white/40" />
              )}
              <button
                onClick={() => setActiveTab(item.id)}
                className={`relative text-sm tracking-wide transition-colors py-1 cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/75 hover:text-white font-medium'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span 
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-white rounded-full"
                  />
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-4 md:gap-5">
        {/* Language selector */}
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-white/80 tracking-wider">
          EN
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>

        {/* System Online Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold tracking-wider ${
          isConnected
            ? 'bg-white/10 border-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]'
            : 'bg-red-950/60 border-red-500/40 text-red-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-500'}`} />
          <span>{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* Mute Siren Button */}
        <button
          onClick={toggleAudio}
          title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Nav Row */}
      <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 flex items-center gap-2 overflow-x-auto px-4 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition ${
              activeTab === item.id
                ? 'bg-white/20 text-white font-semibold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </motion.header>
  );
}
