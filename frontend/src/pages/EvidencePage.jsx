import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  FileText, 
  Download, 
  Eye, 
  Film, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Maximize2, 
  X, 
  FolderArchive,
  RefreshCw,
  User,
  Mail,
  ExternalLink
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function EvidencePage({ selectedEvidenceId, setSelectedEvidenceId, onTriggerTestThreat }) {
  const [evidenceList, setEvidenceList] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalImage, setActiveModalImage] = useState(null);

  const fetchEvidence = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/evidence/list`).then(r => r.json());
      const events = res.events || [];
      setEvidenceList(events);

      if (events.length > 0) {
        if (selectedEvidenceId) {
          const matched = events.find(e => e.event_id === selectedEvidenceId);
          setCurrentEvent(matched || events[0]);
        } else {
          setCurrentEvent(events[0]);
          if (setSelectedEvidenceId) setSelectedEvidenceId(events[0].event_id);
        }
      } else {
        setCurrentEvent(null);
      }
    } catch (e) {
      console.warn("Error fetching evidence list:", e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEvidenceId, setSelectedEvidenceId]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleSelectEvent = (eventId) => {
    if (setSelectedEvidenceId) setSelectedEvidenceId(eventId);
    const found = evidenceList.find(e => e.event_id === eventId);
    if (found) setCurrentEvent(found);
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Header & Event Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-mono tracking-tight">
              FORENSIC EVIDENCE VAULT
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              CERTIFIED ARTIFACTS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Examine high-resolution Frame 01 (Onset), Frame 02 (Peak), 4.5s MP4 clips, and download official PDF reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {evidenceList.length > 0 && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">Select Event:</span>
              <select
                value={currentEvent?.event_id || ''}
                onChange={(e) => handleSelectEvent(e.target.value)}
                className="bg-[#0b101c] border border-cyan-500/40 text-cyan-300 rounded-lg px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-400"
              >
                {evidenceList.map((ev) => (
                  <option key={ev.event_id} value={ev.event_id}>
                    {ev.event_id} &bull; {(ev.violence_prob * 100).toFixed(1)}% &bull; {ev.timestamp?.slice(5, 16) || 'Recent'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={fetchEvidence}
            title="Refresh Evidence"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* When no evidence exists yet */}
      {!isLoading && !currentEvent && (
        <div className="rounded-3xl bg-[#090d18] border border-cyan-500/30 p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            <FolderArchive className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-mono">No Forensic Evidence Logged Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evidence packages are generated automatically when violence is detected in Live Stream or via Video Upload. You can also trigger an immediate simulation test.
          </p>
          <button
            onClick={async () => {
              if (onTriggerTestThreat) {
                await onTriggerTestThreat();
                await fetchEvidence();
              }
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-bold transition shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
          >
            TRIGGER SIMULATION & GENERATE EVIDENCE
          </button>
        </div>
      )}

      {/* Main Evidence Viewer Display */}
      {currentEvent && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Event Metadata Card */}
          <div className="rounded-2xl bg-[#0c111e] border border-cyan-500/30 p-5 font-mono text-xs flex flex-wrap items-center justify-between gap-4 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-white">{currentEvent.event_id}</span>
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                    {currentEvent.severity || 'CRITICAL'}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] flex items-center gap-3 mt-0.5">
                  <span>Source: {currentEvent.source || 'Optical Stream'}</span>
                  <span>&bull;</span>
                  <span>Timestamp: {currentEvent.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right pr-2">
                <div className="text-[10px] text-slate-400">CERTAINTY RATING</div>
                <div className="text-lg font-black text-red-400">
                  {((currentEvent.confidence || currentEvent.violence_prob || 0.95) * 100).toFixed(1)}%
                </div>
              </div>

              {/* 1-Click Complete ZIP Download */}
              <a
                href={`${API_BASE}/evidence/${currentEvent.event_id}/zip`}
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-black transition shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD ENTIRE BUNDLE (.ZIP)
              </a>
            </div>
          </div>

          {/* Dual Evidence Frames Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Evidence Frame 01 (Initial Kinetic Onset) */}
            <div className="rounded-3xl bg-[#090d18] border border-cyan-500/30 p-5 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>EVIDENCE FRAME 01 &bull; KINETIC ONSET</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  ONSET TRIGGER
                </span>
              </div>

              {/* Image Viewport */}
              <div className="relative w-full aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden group">
                <img
                  src={`${API_BASE}/evidence/${currentEvent.event_id}/frame1`}
                  alt="Evidence Frame 01 - Kinetic Onset"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center font-mono text-xs text-slate-500">Frame 01 image not found</div>';
                  }}
                />

                {/* Hover overlay button to zoom */}
                <button
                  onClick={() => setActiveModalImage(`${API_BASE}/evidence/${currentEvent.event_id}/frame1`)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-mono text-xs gap-2 cursor-pointer backdrop-blur-[2px]"
                >
                  <Maximize2 className="w-4 h-4 text-cyan-300" />
                  <span>Click to Expand</span>
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Captured at the immediate divergence point where kinetic velocity and bodily agitation breached normal motion baselines.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500">FORMAT: PNG 24-BIT</span>
                  <a
                    href={`${API_BASE}/evidence/${currentEvent.event_id}/frame1`}
                    download={`VIGIL_${currentEvent.event_id}_Frame01_Onset.png`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    DOWNLOAD FRAME 01
                  </a>
                </div>
              </div>
            </div>

            {/* Evidence Frame 02 (Peak Altercation Moment) */}
            <div className="rounded-3xl bg-[#090d18] border border-red-500/30 p-5 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-red-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>EVIDENCE FRAME 02 &bull; PEAK ALTERCATION</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300">
                  APEX THREAT
                </span>
              </div>

              {/* Image Viewport */}
              <div className="relative w-full aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden group">
                <img
                  src={`${API_BASE}/evidence/${currentEvent.event_id}/frame2`}
                  alt="Evidence Frame 02 - Peak Threat"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center font-mono text-xs text-slate-500">Frame 02 image not found</div>';
                  }}
                />

                {/* Hover overlay button to zoom */}
                <button
                  onClick={() => setActiveModalImage(`${API_BASE}/evidence/${currentEvent.event_id}/frame2`)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-mono text-xs gap-2 cursor-pointer backdrop-blur-[2px]"
                >
                  <Maximize2 className="w-4 h-4 text-red-300" />
                  <span>Click to Expand</span>
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Captured at the apex moment of physical contact or sustained kinetic altercation with highest neural classification confidence.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500">FORMAT: PNG 24-BIT</span>
                  <a
                    href={`${API_BASE}/evidence/${currentEvent.event_id}/frame2`}
                    download={`VIGIL_${currentEvent.event_id}_Frame02_Peak.png`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    DOWNLOAD FRAME 02
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: 4-5s Video Player & PDF Report Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 4.5s Event Video Player (7 Cols) */}
            <div className="md:col-span-7 rounded-3xl bg-[#090d18] border border-indigo-500/30 p-5 space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <Film className="w-4 h-4 text-indigo-400" />
                  <span>4.5-SECOND EVENT VIDEO REPLAY</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                  H.264 / MP4 &bull; 20 FPS
                </span>
              </div>

              <div className="relative w-full aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
                <video
                  controls
                  loop
                  autoPlay
                  muted
                  playsInline
                  src={`${API_BASE}/evidence/${currentEvent.event_id}/clip`}
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-mono text-xs">
                <p className="text-slate-400 text-[11px]">
                  Continuous temporal window extracted across the critical threat interval.
                </p>

                <a
                  href={`${API_BASE}/evidence/${currentEvent.event_id}/clip`}
                  download={`VIGIL_${currentEvent.event_id}_EventClip.mp4`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 font-bold transition"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  DOWNLOAD MP4 CLIP
                </a>
              </div>
            </div>

            {/* Certified PDF Report Card (5 Cols) */}
            <div className="md:col-span-5 rounded-3xl bg-[#090d18] border border-amber-500/30 p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs mb-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>PRINTABLE PDF DETECTION REPORT</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
                    REPORTLAB
                  </span>
                </div>

                <div className="rounded-xl bg-[#0e1424] border border-slate-800 p-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                    <span>DOCUMENT:</span>
                    <span className="text-white font-bold">VIGIL_Detection_Report.pdf</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>AUTHOR:</span>
                    <span className="text-cyan-300">Faqih</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>CONTACT:</span>
                    <span className="text-slate-300">fakkihpunnayoor@gmail.com</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>AUTHENTICATION:</span>
                    <span className="text-emerald-400">Cryptographic Hash Logged</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>INCLUDES:</span>
                    <span className="text-slate-200">Frame 01, Frame 02, Legal Notice</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <a
                  href={`${API_BASE}/evidence/${currentEvent.event_id}/report`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 font-mono text-xs font-bold transition shadow"
                >
                  <ExternalLink className="w-4 h-4" />
                  VIEW / PRINT PDF REPORT
                </a>

                <a
                  href={`${API_BASE}/evidence/${currentEvent.event_id}/report`}
                  download={`VIGIL_${currentEvent.event_id}_Report.pdf`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs font-bold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  DOWNLOAD PDF FILE
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Modal */}
      {activeModalImage && (
        <div 
          onClick={() => setActiveModalImage(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-4xl w-full bg-[#080b14] border border-cyan-500/40 rounded-3xl p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
              <span className="text-white font-bold">HIGH-RESOLUTION EVIDENCE VIEWER</span>
              <button 
                onClick={() => setActiveModalImage(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <img src={activeModalImage} alt="Expanded Evidence" className="w-full h-full object-contain" />
            </div>
            <div className="mt-3 flex justify-between items-center font-mono text-xs text-slate-400">
              <span>PROJECT VIGIL &bull; Created by Faqih (fakkihpunnayoor@gmail.com)</span>
              <a
                href={activeModalImage}
                download
                className="flex items-center gap-1 text-cyan-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download Full Resolution
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
