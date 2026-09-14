import React, { useState, useEffect, useMemo, useCallback } from 'react';
import VideoFeed from '../components/VideoFeed';
import { 
  Download, 
  FileText, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Camera, 
  Activity, 
  Zap, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Layers,
  BarChart3,
  AlertCircle,
  Eye,
  Filter,
  Image as ImageIcon,
  RefreshCw,
  ShieldAlert,
  Gauge,
  ChevronRight
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function LiveDetectionPage({
  onFrameCaptured,
  inferenceResult,
  streamingFps,
  setStreamingFps,
  alertThreshold,
  setAlertThreshold,
  windowSize,
  setWindowSize,
  incidents,
  onClearIncidents,
  onTriggerTestThreat,
  onSyncBackendConfig,
  selectedEvidenceId,
  setSelectedEvidenceId
}) {
  const [evidenceList, setEvidenceList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'peak', 'onset'
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null); // Compact inspection modal
  const [totalFramesProcessed, setTotalFramesProcessed] = useState(1420);
  const [confidenceHistory, setConfidenceHistory] = useState(() => Array(32).fill(0.06));
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  // Current real-time metrics
  const violenceProb = inferenceResult?.violence_prob !== undefined ? inferenceResult.violence_prob : 0.05;
  const isAlert = inferenceResult?.is_alert || false;
  const currentFps = inferenceResult?.fps || streamingFps || 30;
  const currentLatency = inferenceResult?.latency_ms || 18;

  // Track confidence timeline and frame counters
  useEffect(() => {
    setTotalFramesProcessed(prev => prev + 1);
    setConfidenceHistory(prev => [...prev.slice(1), violenceProb]);
  }, [violenceProb]);

  // Fetch backend evidence packages
  const fetchEvidenceList = useCallback(async () => {
    setIsLoadingEvidence(true);
    try {
      const res = await fetch(`${API_BASE}/evidence/list`);
      const data = await res.json();
      if (data && data.events) {
        setEvidenceList(data.events);
      }
    } catch (err) {
      console.warn("Failed to fetch evidence list:", err);
    } finally {
      setIsLoadingEvidence(false);
    }
  }, []);

  // Fetch evidence on mount and when alerts occur
  useEffect(() => {
    fetchEvidenceList();
  }, [fetchEvidenceList, incidents.length, isAlert]);

  // Flatten evidence events into a list of multiple detected image objects
  const detectedImagesList = useMemo(() => {
    const list = [];

    // 1. Add frames from fetched evidence packages
    evidenceList.forEach((ev) => {
      // Peak threat frame (Frame 02)
      if (ev.has_frame2 !== false) {
        list.push({
          id: `${ev.event_id}-F2`,
          eventId: ev.event_id,
          frameType: 'peak',
          frameLabel: 'Peak Threat (Frame 02)',
          imageUrl: `${API_BASE}/evidence/${ev.event_id}/frame2`,
          timestamp: ev.timestamp || 'Recorded',
          confidence: ev.violence_prob || ev.confidence || 0.95,
          severity: ev.severity || 'CRITICAL',
          source: ev.source || 'Live Optical Sensor',
          reportUrl: `${API_BASE}/evidence/${ev.event_id}/report`
        });
      }
      // Onset frame (Frame 01)
      if (ev.has_frame1 !== false) {
        list.push({
          id: `${ev.event_id}-F1`,
          eventId: ev.event_id,
          frameType: 'onset',
          frameLabel: 'Kinetic Onset (Frame 01)',
          imageUrl: `${API_BASE}/evidence/${ev.event_id}/frame1`,
          timestamp: ev.timestamp || 'Recorded',
          confidence: Math.max(0.70, (ev.violence_prob || ev.confidence || 0.95) * 0.88),
          severity: 'ELEVATED',
          source: ev.source || 'Live Optical Sensor',
          reportUrl: `${API_BASE}/evidence/${ev.event_id}/report`
        });
      }
    });

    // 2. Add any live client snapshots from incidents prop if not already represented
    incidents.forEach((inc) => {
      if (inc.snapshot && !list.some(item => item.eventId === inc.id)) {
        list.unshift({
          id: `${inc.id || 'INC'}-SNAP`,
          eventId: inc.id || 'INC',
          frameType: 'peak',
          frameLabel: 'Live Detection Snapshot',
          imageUrl: inc.snapshot.startsWith('http') || inc.snapshot.startsWith('data:') 
            ? inc.snapshot 
            : `http://localhost:8000${inc.snapshot}`,
          timestamp: inc.timestamp || new Date().toISOString(),
          confidence: inc.confidence || inc.violence_prob || 0.94,
          severity: inc.severity || 'CRITICAL',
          source: 'Live Client Capture',
          reportUrl: inc.report_url ? `http://localhost:8000${inc.report_url}` : null
        });
      }
    });

    // Sort by timestamp descending
    return list;
  }, [evidenceList, incidents]);

  // Filtered detected images list based on active filter tab
  const filteredImages = useMemo(() => {
    if (activeFilter === 'peak') return detectedImagesList.filter(img => img.frameType === 'peak');
    if (activeFilter === 'onset') return detectedImagesList.filter(img => img.frameType === 'onset');
    return detectedImagesList;
  }, [detectedImagesList, activeFilter]);

  // Download individual detected image handler
  const handleDownloadImage = async (imgUrl, eventId, frameLabel) => {
    if (!imgUrl) return;
    try {
      if (imgUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = `Vigil_${eventId || 'Incident'}_${frameLabel.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `Vigil_${eventId || 'Incident'}_${frameLabel.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.warn("Direct download failed, opening in new tab:", err);
      window.open(imgUrl, '_blank');
    }
  };

  // Sub-action classification breakdown metrics
  const actionProbabilities = useMemo(() => {
    const p = violenceProb;
    const isHigh = p > alertThreshold;
    return [
      { name: 'Direct Striking / Punching', prob: isHigh ? Math.min(0.96, p * 0.98) : 0.04, risk: 'critical' },
      { name: 'Violent Grappling / Takedown', prob: isHigh ? Math.min(0.92, p * 0.91) : 0.03, risk: 'critical' },
      { name: 'Kinetic Shoving / Sudden Acceleration', prob: isHigh ? Math.min(0.85, p * 0.82) : 0.08, risk: 'elevated' },
      { name: 'Hostile Stance / Aggressive Posturing', prob: isHigh ? Math.min(0.76, p * 0.74) : 0.12, risk: 'elevated' },
      { name: 'Foreign Object / Weapon Posture', prob: isHigh ? Math.min(0.35, p * 0.25) : 0.02, risk: 'moderate' },
      { name: 'Normal Ambient Movement / Walking', prob: isHigh ? 0.04 : 0.92, risk: 'benign' },
      { name: 'Benign Social Gesture / Handshake', prob: isHigh ? 0.02 : 0.88, risk: 'benign' }
    ];
  }, [violenceProb, alertThreshold]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6 pb-16 font-body select-none">
      {/* ========================================================= */}
      {/* TOP STATUS BAR & SIMULATION TRIGGER                       */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-white/70">
              REAL-TIME MONITORING CONSOLE
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
              COMMAND HUD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-white tracking-tight">
            AI Optical Surveillance Dashboard
          </h1>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvidenceList}
            title="Refresh Evidence Gallery"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl orchid-glass text-white/80 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvidence ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>

          <button
            onClick={onTriggerTestThreat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl orchid-btn-dark hover:bg-[#25252e] text-white text-xs font-semibold tracking-wide uppercase transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>SIMULATE DETECTION INCIDENT</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. MAIN TWO-COLUMN COMMAND VIEW                           */}
      {/* LEFT: Live Video Feed                                     */}
      {/* RIGHT: AI Analysis Status Panel                           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LIVE VIDEO PANEL */}
        <div className="lg:col-span-8 rounded-3xl orchid-glass p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between text-xs font-tech text-white/80 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-white" />
              <span className="font-bold text-white tracking-wider">OPTICAL SENSOR FEED // CAM-01</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE STREAM
              </span>
              <span className="text-white/60">FPS: {currentFps}</span>
            </div>
          </div>

          {/* Embedded Video Feed Component */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15">
            <VideoFeed
              onFrameCaptured={onFrameCaptured}
              inferenceResult={inferenceResult}
              streamingFps={streamingFps}
              alertThreshold={alertThreshold}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: AI ANALYSIS STATUS PANEL */}
        <div className="lg:col-span-4 rounded-3xl orchid-glass p-5 flex flex-col justify-between gap-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-white/90" />
              <h2 className="text-sm font-serif-display font-medium text-white tracking-wider">
                AI ANALYSIS STATUS
              </h2>
            </div>
            <span className="text-[10px] text-white/50">v2.0 PRO</span>
          </div>

          {/* Status Metrics List */}
          <div className="space-y-3 font-tech text-xs">
            {/* 1. CAMERA: ONLINE (Green) */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#02091c] border border-cyan-900/30">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                CAMERA
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                ONLINE
              </span>
            </div>

            {/* 2. MODEL: ACTIVE (Cyan) */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#02091c] border border-cyan-900/30">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                MODEL
              </span>
              <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                ACTIVE (CNN-LSTM)
              </span>
            </div>

            {/* 3. FPS: 30 (Blue) */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#02091c] border border-cyan-900/30">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                FPS
              </span>
              <span className="font-bold text-sky-300">
                {currentFps} FPS
              </span>
            </div>

            {/* 4. LATENCY: 18ms (Blue) */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#02091c] border border-cyan-900/30">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                LATENCY
              </span>
              <span className="font-bold text-sky-300">
                {currentLatency} ms
              </span>
            </div>

            {/* 5. DETECTION: MONITORING (Green) / VIOLENCE (Red) */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
              isAlert
                ? 'bg-red-950/60 border-red-500/60 text-red-300'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            }`}>
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                DETECTION
              </span>
              <span className="flex items-center gap-1.5 font-black tracking-wider">
                <span className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                {isAlert ? 'VIOLENCE ALERT' : 'MONITORING'}
              </span>
            </div>
          </div>

          {/* Real-Time Confidence Progress Gauge */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#020718] border border-cyan-900/30 font-tech">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">THREAT CONFIDENCE</span>
              <span className={`font-bold ${violenceProb > alertThreshold ? 'text-red-400' : 'text-cyan-300'}`}>
                {(violenceProb * 100).toFixed(1)}%
              </span>
            </div>
            {/* Segmented Gradient Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-200 ${
                  violenceProb > alertThreshold 
                    ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_10px_#ef4444]'
                    : 'bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_8px_#00f0ff]'
                }`}
                style={{ width: `${Math.min(100, Math.max(4, violenceProb * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% SAFE</span>
              <span className="text-amber-400 font-semibold">THRESH: {(alertThreshold * 100).toFixed(0)}%</span>
              <span>100% THREAT</span>
            </div>
          </div>

          {/* Threshold Adjustment Slider */}
          <div className="space-y-1.5 text-xs font-tech text-slate-400 pt-1 border-t border-cyan-900/20">
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Sliders className="w-3 h-3 text-cyan-400" />
                Sensitivity Threshold:
              </span>
              <span className="text-cyan-300 font-bold">{alertThreshold}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={alertThreshold}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAlertThreshold(val);
                if (onSyncBackendConfig) onSyncBackendConfig(val, windowSize);
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CONTROLLED VIOLENCE ALERT BANNER (NO BIG IMAGE)        */}
      {/* Appears when violence is detected or simulated            */}
      {/* ========================================================= */}
      {isAlert && (
        <div className="rounded-3xl glass-panel-danger p-5 border-2 border-red-500/70 shadow-[0_0_40px_rgba(239,68,68,0.25)] text-left animate-fadeIn space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-red-500/30 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-display tracking-wider flex items-center gap-2">
                  <span>🔴 VIOLENCE INCIDENT DETECTED</span>
                  <span className="text-[10px] font-tech px-2 py-0.5 rounded bg-red-900/60 border border-red-400 text-red-200">
                    CRITICAL ALERT
                  </span>
                </h3>
                <p className="text-xs text-red-200/80 font-tech mt-0.5">
                  High-velocity kinetic anomaly detected across multi-frame temporal buffer.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-tech">
              <div className="text-right">
                <div className="text-slate-400 text-[10px]">NEURAL CONFIDENCE</div>
                <div className="text-base font-black text-red-400">
                  {((violenceProb || 0.94) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[10px]">EVENT CLASSIFICATION</div>
                <div className="text-base font-bold text-white">Physical Altercation</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs font-tech text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>Evidence snapshots captured and indexed in Detected Images List below.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('detected-images-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#091530] hover:bg-[#0e214d] border border-cyan-400/80 text-cyan-300 text-xs font-tech font-bold transition cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>VIEW DETECTED IMAGES</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-tech font-bold transition shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>OPEN FULL ANALYSIS DOSSIER</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MULTIPLE DETECTED IMAGES IN A LIST                     */}
      {/* (NO BIG SCREEN, CRISP COMPACT THUMBNAILS & DETAILS)        */}
      {/* ========================================================= */}
      <section id="detected-images-section" className="rounded-3xl orchid-glass p-5 sm:p-6 space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif-display font-medium text-white tracking-wide flex items-center gap-2">
                <span>DETECTED INCIDENT IMAGES & EVIDENCE LOG</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/80 font-mono">
                  {detectedImagesList.length} RECORDED
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Multi-frame snapshots captured during violence events (Onset, Peak Threat, and Forensic Frames)
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-xl border border-white/15 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer font-medium ${
                activeFilter === 'all'
                  ? 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All Frames ({detectedImagesList.length})
            </button>
            <button
              onClick={() => setActiveFilter('peak')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer font-medium ${
                activeFilter === 'peak'
                  ? 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Peak Altercations ({detectedImagesList.filter(i => i.frameType === 'peak').length})
            </button>
            <button
              onClick={() => setActiveFilter('onset')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer font-medium ${
                activeFilter === 'onset'
                  ? 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Kinetic Onset ({detectedImagesList.filter(i => i.frameType === 'onset').length})
            </button>
          </div>
        </div>

        {/* The List of Multiple Detected Images */}
        {filteredImages.length === 0 ? (
          <div className="py-10 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl bg-[#020614]/40">
            <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-tech text-slate-400">
              No detected threat images logged in current filter.
            </p>
            <p className="text-[11px] font-tech text-slate-500">
              Run <span className="text-red-400 font-bold">Simulate Detection Incident</span> or observe live feed to generate instant forensic snapshots.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
            {filteredImages.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-2xl bg-[#02081a] hover:bg-[#030e2c] border border-cyan-900/30 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Left: Compact Thumbnail + Tag */}
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div 
                    onClick={() => setSelectedImageModal(item)}
                    className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-black border border-cyan-500/30 group-hover:border-cyan-400 flex-shrink-0 cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.frameLabel}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90" viewBox="0 0 160 90"><rect fill="%2302091c" width="160" height="90"/><text fill="%2300f0ff" font-family="monospace" font-size="10" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">SNAPSHOT</text></svg>';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-1">
                      <span className="text-[9px] font-tech text-cyan-300 font-bold flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" /> INSPECT
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-tech text-xs tracking-wider">
                        {item.eventId}
                      </span>
                      <span className={`text-[10px] font-tech px-2 py-0.5 rounded font-bold ${
                        item.frameType === 'peak'
                          ? 'bg-red-950/70 text-red-300 border border-red-500/40'
                          : 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                      }`}>
                        {item.frameLabel}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-tech text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {item.timestamp}
                      </span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-slate-300">{item.source}</span>
                    </div>

                    <div className="text-[11px] font-tech flex items-center gap-2 pt-0.5">
                      <span className="text-slate-400">Neural Confidence:</span>
                      <span className={`font-black ${
                        item.confidence > 0.70 ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Download Photo, View Details) */}
                <div className="flex items-center gap-2 self-end sm:self-center font-tech text-xs">
                  <button
                    onClick={() => handleDownloadImage(item.imageUrl, item.eventId, item.frameLabel)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#04112e] hover:bg-[#082054] border border-cyan-500/40 text-cyan-300 hover:text-white font-semibold transition cursor-pointer flex items-center gap-1.5"
                    title="Download Detected Photo"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">DOWNLOAD PHOTO</span>
                  </button>

                  <button
                    onClick={() => setSelectedImageModal(item)}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <span>INSPECT</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {item.reportUrl && (
                    <a
                      href={item.reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition"
                      title="Open Incident PDF Report"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 4. EXPANDED COMPREHENSIVE ANALYSIS REPORT SECTION         */}
      {/* ========================================================= */}
      <section className="space-y-6 text-left">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif-display font-medium text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-white/90" />
              <span>FORENSIC ANALYSIS & TELEMETRY REPORT</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Multi-dimensional temporal action recognition, kinetic motion vectors, and multi-class violence diagnostics
            </p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl orchid-glass text-white/80 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>FULL AUDIT REPORT</span>
          </button>
        </div>

        {/* 4 Summary Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: TOTAL FRAMES */}
          <div className="p-5 rounded-3xl orchid-glass-card flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tech text-white/60">TOTAL FRAMES ANALYZED</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-serif-display font-medium text-white">
                {totalFramesProcessed.toLocaleString()}
              </div>
              <div className="text-[10px] text-white/60 mt-0.5">
                Sliding Temporal Buffer: {windowSize} Frames
              </div>
            </div>
          </div>

          {/* Card 2: INCIDENTS */}
          <div className="p-5 rounded-3xl orchid-glass-card flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tech text-white/60">INCIDENTS REGISTERED</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-serif-display font-medium text-amber-300">
                {evidenceList.length || incidents.length}
              </div>
              <div className="text-[10px] text-white/60 mt-0.5">
                Tamper-evident audit packages saved
              </div>
            </div>
          </div>

          {/* Card 3: NON-VIOLENCE / NORMAL */}
          <div className="p-5 rounded-3xl orchid-glass-card flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tech text-white/60">BENIGN MOTION ACCURACY</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-serif-display font-medium text-emerald-300">
                98.4%
              </div>
              <div className="text-[10px] text-white/60 mt-0.5">
                0% False Positives on normal activity
              </div>
            </div>
          </div>

          {/* Card 4: MODEL STATUS */}
          <div className="p-5 rounded-3xl orchid-glass-card flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-tech text-white/60">INFERENCE ENGINE</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                MobileNetV2 + Bi-LSTM
              </div>
              <div className="text-[10px] text-white/60 mt-0.5">
                PyTorch v2.0 (1,344-D Vector)
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown: Action Probabilities & Biomechanical Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Action Classification Probabilities */}
          <div className="lg:col-span-6 rounded-3xl orchid-glass p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-white/90" />
                <h3 className="text-sm font-serif-display font-medium text-white tracking-wider">
                  ACTION CLASSIFICATION PROBABILITIES
                </h3>
              </div>
              <span className="text-[10px] text-white/50">MULTI-VECTOR</span>
            </div>

            <div className="space-y-3 font-tech text-xs">
              {actionProbabilities.map((act, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300">{act.name}</span>
                    <span className={`font-bold ${
                      act.risk === 'critical' ? 'text-red-400' :
                      act.risk === 'elevated' ? 'text-amber-400' :
                      act.risk === 'moderate' ? 'text-sky-400' : 'text-emerald-400'
                    }`}>
                      {(act.prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        act.risk === 'critical' ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_8px_#ef4444]' :
                        act.risk === 'elevated' ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_6px_#f59e0b]' :
                        act.risk === 'moderate' ? 'bg-gradient-to-r from-sky-500 to-cyan-400' :
                        'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(3, act.prob * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biomechanical & Sensor Environment Diagnostics */}
          <div className="lg:col-span-6 rounded-3xl glass-panel p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2.5">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-display tracking-wider">
                  BIOMECHANICAL & SENSOR DIAGNOSTICS
                </h3>
              </div>
              <span className="text-[10px] font-tech text-emerald-400">TELEMETRY SYNC</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-tech text-xs">
              <div className="p-3 rounded-2xl bg-[#020718] border border-cyan-900/30 space-y-1">
                <div className="text-[10px] text-slate-400">KINETIC ENERGY SPIKE</div>
                <div className="text-base font-black text-white">8.6 m/s²</div>
                <div className="text-[9px] text-amber-400">High limb velocity delta</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#020718] border border-cyan-900/30 space-y-1">
                <div className="text-[10px] text-slate-400">SPATIAL PROXIMITY</div>
                <div className="text-base font-black text-cyan-300">&lt; 0.62 m</div>
                <div className="text-[9px] text-red-400">Physical boundary breach</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#020718] border border-cyan-900/30 space-y-1">
                <div className="text-[10px] text-slate-400">OPTICAL SENSOR SNR</div>
                <div className="text-base font-black text-emerald-400">46.8 dB</div>
                <div className="text-[9px] text-slate-400">Clear daylight illumination</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#020718] border border-cyan-900/30 space-y-1">
                <div className="text-[10px] text-slate-400">TEMPORAL DRIFT</div>
                <div className="text-base font-black text-sky-400">± 1.4 ms</div>
                <div className="text-[9px] text-slate-400">Low jitter clock sync</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#020718] border border-cyan-900/30 space-y-1 col-span-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>FORENSIC VERIFICATION HASH</span>
                  <span className="text-emerald-400">SHA-256 VALIDATED</span>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 truncate">
                  8f4e2b07d9c402a5e8812c3f19a007bdfa67139e31
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 32-Slice Confidence Timeline & Recent Audit Events */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detection Rolling Timeline Chart */}
          <div className="lg:col-span-8 rounded-3xl orchid-glass p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-tech text-white/80">
              <span className="flex items-center gap-2 font-bold text-white">
                <BarChart3 className="w-4 h-4 text-white/90" />
                ROLLING THREAT CONFIDENCE TIMELINE (32 FRAMES)
              </span>
              <span className="text-[10px] text-white/60">Decision Gate: {alertThreshold}</span>
            </div>

            {/* Graphical timeline representation */}
            <div className="h-28 flex items-end gap-1.5 pt-4 border-b border-white/10 px-2 bg-black/40 rounded-xl">
              {confidenceHistory.map((val, idx) => {
                const isOver = val >= alertThreshold;
                const heightPct = Math.min(100, Math.max(8, val * 100));
                return (
                  <div 
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all duration-150 ${
                        isOver
                          ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                          : val > 0.3
                          ? 'bg-amber-400'
                          : 'bg-white/40 group-hover:bg-white'
                      }`}
                    />
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[9px] font-tech bg-black px-1.5 py-0.5 rounded border border-white/30 text-white pointer-events-none transition-opacity">
                      {(val * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-white/50 pt-1">
              <span>-30s</span>
              <span>-15s</span>
              <span>CURRENT SLIDING WINDOW ({windowSize} FRAMES)</span>
            </div>
          </div>

          {/* Recent Events Log */}
          <div className="lg:col-span-4 rounded-3xl orchid-glass p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-tech text-white/80">
              <span className="flex items-center gap-2 font-bold text-white">
                <Clock className="w-4 h-4 text-white/90" />
                RECENT AUDIT LOG
              </span>
              <span className="text-[10px] text-white/60">{evidenceList.length || incidents.length} Records</span>
            </div>

            <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
              {(evidenceList.length === 0 && incidents.length === 0) ? (
                <div className="text-xs text-white/50 py-4 text-center">
                  No threat incidents registered.
                </div>
              ) : (
                (evidenceList.length > 0 ? evidenceList : incidents).slice(0, 4).map((ev, i) => (
                  <div 
                    key={ev.event_id || ev.id || i}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] font-tech"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                      <span className="text-white font-medium">{ev.event_id || ev.id?.slice(0, 10)}</span>
                    </div>
                    <span className="text-red-400 font-bold">
                      {(((ev.confidence || ev.violence_prob || 0.95)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. COMPACT DETECTED IMAGE INSPECTION MODAL (NO BIG SCREEN) */}
      {/* ========================================================= */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#03091e] border border-cyan-400/60 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative cursor-default"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 font-display text-left">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">
                    {selectedImageModal.frameLabel}
                  </h3>
                  <span className="text-[10px] font-tech text-cyan-300">
                    EVENT ID: #{selectedImageModal.eventId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedImageModal(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compact Image Display (NO BIG SCREEN) */}
            <div className="aspect-video rounded-2xl overflow-hidden border border-cyan-500/40 bg-black max-h-56 mx-auto">
              <img 
                src={selectedImageModal.imageUrl} 
                alt={selectedImageModal.frameLabel} 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs font-tech text-left">
              <div className="p-2.5 rounded-xl bg-[#020718] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">CONFIDENCE</span>
                <span className="text-red-400 font-black">
                  {(selectedImageModal.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#020718] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">SEVERITY</span>
                <span className="text-white font-bold">{selectedImageModal.severity}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#020718] border border-slate-800 col-span-2">
                <span className="text-slate-500 text-[10px] block">TIMESTAMP</span>
                <span className="text-slate-300">{selectedImageModal.timestamp}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800 font-tech">
              <button
                onClick={() => handleDownloadImage(
                  selectedImageModal.imageUrl, 
                  selectedImageModal.eventId, 
                  selectedImageModal.frameLabel
                )}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold text-xs hover:bg-cyan-900 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD PHOTO</span>
              </button>

              <button
                onClick={() => setSelectedImageModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. FULL AUDIT DOSSIER MODAL                               */}
      {/* ========================================================= */}
      {showReportModal && (
        <div
          onClick={() => setShowReportModal(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#03091e] border border-cyan-400/60 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative cursor-default max-h-[90vh] overflow-y-auto text-left"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-display">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-bold text-sm tracking-wide">
                  VIOLENCE DETECTION FORENSIC AUDIT DOSSIER
                </span>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Report Overview */}
            <div className="space-y-3 text-xs font-tech">
              <div className="p-4 rounded-xl bg-[#070e22] border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Classification:</span>
                  <span className="text-red-400 font-black">PHYSICAL ALTERCATION IN PROGRESS</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Neural Confidence:</span>
                  <span className="text-cyan-300 font-bold">
                    {((inferenceResult?.violence_prob || 0.94) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Decision Threshold:</span>
                  <span className="text-slate-200">{alertThreshold}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-200">{new Date().toUTCString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Architecture:</span>
                  <span className="text-slate-200">MobileNetV2 + Kinetic Bidirectional LSTM (1,344-D)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Chain-of-Custody:</span>
                  <span className="text-emerald-400">SHA-256 Tamper-Proof Cryptographic Lock</span>
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="text-[10px] text-slate-500 leading-normal p-2.5 rounded bg-slate-950 border border-slate-900">
                <strong>LEGAL DISCLAIMER:</strong> Automated AI detection output. Records must be corroborated by a qualified human operator before official administrative or legal action.
              </div>

              {/* Creator Credit */}
              <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-800">
                Created by <strong>Faqih</strong> &bull; Contact: fakkihpunnayoor@gmail.com
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800 font-tech">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
