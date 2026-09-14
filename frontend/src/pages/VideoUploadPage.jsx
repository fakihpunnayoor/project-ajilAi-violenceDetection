import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Film, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  FileText, 
  Clock, 
  Activity, 
  ArrowRight, 
  RefreshCw,
  Eye,
  Sliders
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function VideoUploadPage({ setActiveTab, setSelectedEvidenceId }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [threshold, setThreshold] = useState(0.70);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    // Staged progress indicators for visual responsiveness
    setProgressStage('Uploading and reading video file...');
    const t1 = setTimeout(() => setProgressStage('Extracting temporal frames via OpenCV...'), 1200);
    const t2 = setTimeout(() => setProgressStage('Running MobileNetV2 + Kinetic LSTM sliding window...'), 2600);
    const t3 = setTimeout(() => setProgressStage('Extracting Frame 01 & 02, generating 4.5s clip and PDF report...'), 4200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch(`${API_BASE}/analyze-video?threshold=${threshold}`, {
        method: 'POST',
        body: formData
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: 'Analysis failed' }));
        throw new Error(err.detail || 'Failed to process video');
      }

      const data = await resp.json();
      setAnalysisResult(data);
      if (setSelectedEvidenceId && data.event_id) {
        setSelectedEvidenceId(data.event_id);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred while analyzing video.');
    } finally {
      setIsAnalyzing(false);
      setProgressStage('');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 font-body select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-left">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-white tracking-tight">
              AI Video Upload & Forensic Analysis
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
              BATCH MODE
            </span>
          </div>
          <p className="text-xs text-white/60 mt-1 font-normal">
            Feed pre-recorded surveillance footage into VIGIL's CNN-LSTM pipeline for automated evidence synthesis.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-white/60 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-white/80" />
            Decision Threshold:
          </span>
          <span className="text-white font-bold orchid-glass px-2.5 py-1 rounded-xl">
            {Math.round(threshold * 100)}%
          </span>
          <input
            type="range"
            min="0.30"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-24 accent-white cursor-pointer"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* CENTERPIECE: MODERN AI VIDEO UPLOAD INTERFACE             */}
      {/* ========================================================= */}
      <div className="max-w-2xl mx-auto">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-3xl border-2 border-dashed p-10 text-center transition-all flex flex-col items-center justify-center min-h-[300px] orchid-glass ${
            dragActive
              ? 'border-white bg-white/15 shadow-[0_0_35px_rgba(255,255,255,0.2)]'
              : file
              ? 'border-white/40 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.1)]'
              : 'border-white/20 hover:border-white/40 bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/avi,video/quicktime,video/webm,video/x-matroska"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(255,255,255,0.15)]">
            {file ? (
              <Film className="w-10 h-10 text-white" />
            ) : (
              <Upload className="w-10 h-10 text-white animate-bounce" />
            )}
          </div>

          <div className="space-y-3 max-w-md">
            <h3 className="text-xl font-serif-display font-medium text-white tracking-wide">
              Upload Video
            </h3>
            <p className="text-xs text-white/70">
              Drag &amp; Drop your surveillance video here, or browse files
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 rounded-xl orchid-btn-dark hover:bg-[#282832] text-white font-medium text-xs tracking-wider transition hover:scale-105 cursor-pointer uppercase"
              >
                Browse File
              </button>
            </div>

            <div className="text-[11px] font-tech text-slate-500 pt-2">
              MP4 / AVI / MOV / WEBM
            </div>

            {file && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#02091c] border border-cyan-500/30 text-xs font-tech text-cyan-300 flex items-center justify-between">
                <span className="truncate max-w-[280px] font-bold text-white">{file.name}</span>
                <span className="text-slate-400 text-[10px]">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Start Analysis Button */}
        {file && !isAnalyzing && !analysisResult && (
          <div className="pt-4 text-center">
            <button
              onClick={handleAnalyze}
              className="px-8 py-3.5 rounded-2xl orchid-btn-dark hover:bg-[#282832] text-white font-medium text-xs tracking-wider transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-105 cursor-pointer uppercase"
            >
              Run Temporal Action Recognition
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* PROGRESSION PIPELINE: CYAN -> BLUE -> PURPLE -> GREEN     */}
      {/* VIDEO READY -> PROCESSING -> ANALYZING -> COMPLETED        */}
      {/* ========================================================= */}
      {(file || isAnalyzing || analysisResult) && (
        <div className="max-w-3xl mx-auto p-5 rounded-2xl orchid-glass text-left space-y-4">
          <div className="flex items-center justify-between text-xs font-tech border-b border-white/10 pb-2">
            <span className="text-white/80 font-bold">PIPELINE EXECUTION STATE</span>
            <span className="text-white/60 text-[10px]">{progressStage || 'Active'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tech text-xs">
            {/* Step 1: VIDEO READY (Cyan) */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
              file
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                : 'bg-[#020718] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">STAGE 01</span>
                <span className={`w-2 h-2 rounded-full ${file ? 'bg-cyan-400 shadow-[0_0_6px_#00f0ff]' : 'bg-slate-700'}`} />
              </div>
              <div className="font-bold">VIDEO READY</div>
            </div>

            {/* Step 2: PROCESSING (Blue) */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
              isAnalyzing || analysisResult
                ? 'bg-sky-950/40 border-sky-500/50 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
                : 'bg-[#020718] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">STAGE 02</span>
                <span className={`w-2 h-2 rounded-full ${isAnalyzing || analysisResult ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' : 'bg-slate-700'}`} />
              </div>
              <div className="font-bold">PROCESSING</div>
            </div>

            {/* Step 3: ANALYZING (Purple) */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
              isAnalyzing || analysisResult
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                : 'bg-[#020718] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">STAGE 03</span>
                <span className={`w-2 h-2 rounded-full ${isAnalyzing || analysisResult ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]' : 'bg-slate-700'}`} />
              </div>
              <div className="font-bold">ANALYZING</div>
            </div>

            {/* Step 4: COMPLETED (Green) */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
              analysisResult
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-[#020718] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">STAGE 04</span>
                <span className={`w-2 h-2 rounded-full ${analysisResult ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-700'}`} />
              </div>
              <div className="font-bold">COMPLETED</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-300 font-tech text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <strong className="block text-red-200">Analysis Error:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="max-w-3xl mx-auto rounded-3xl glass-panel p-6 md:p-8 space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.7)] animate-fadeIn text-left">
          {/* Top Status Alert Banner: Controlled Red if violence detected, else Green */}
          <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 font-tech ${
            analysisResult.has_violence
              ? 'glass-panel-danger border-2 border-red-500/70 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
              : 'glass-panel-success border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {analysisResult.has_violence ? (
                <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-300" />
                </div>
              )}
              <div>
                <div className="text-base font-black tracking-wide font-display text-white">
                  {analysisResult.has_violence ? '🔴 VIOLENT PHYSICAL INCIDENT DETECTED' : 'NORMAL ACTIVITY // NO VIOLENCE DETECTED'}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Event: <span className="font-bold text-white">{analysisResult.event_id}</span> &bull; File: {analysisResult.filename}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400">PEAK CONFIDENCE</div>
              <div className={`text-xl font-black ${analysisResult.has_violence ? 'text-red-400' : 'text-emerald-400'}`}>
                {(analysisResult.max_violence_prob * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Metric Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tech text-xs">
            <div className="bg-[#02091c] p-3.5 rounded-xl border border-cyan-900/30">
              <span className="text-[10px] text-slate-400 uppercase">Duration</span>
              <div className="text-base font-black text-white">{analysisResult.duration_sec}s</div>
              <span className="text-[9px] text-slate-500">{analysisResult.total_frames} frames</span>
            </div>
            <div className="bg-[#02091c] p-3.5 rounded-xl border border-cyan-900/30">
              <span className="text-[10px] text-slate-400 uppercase">Peak Altercation</span>
              <div className="text-base font-black text-cyan-300">{analysisResult.peak_timestamp_sec}s mark</div>
              <span className="text-[9px] text-slate-500">Onset ~{Math.max(0, analysisResult.peak_timestamp_sec - 1.5).toFixed(1)}s</span>
            </div>
            <div className="bg-[#02091c] p-3.5 rounded-xl border border-cyan-900/30">
              <span className="text-[10px] text-slate-400 uppercase">Average Threat</span>
              <div className="text-base font-black text-sky-300">{(analysisResult.avg_violence_prob * 100).toFixed(1)}%</div>
              <span className="text-[9px] text-slate-500">Sliding average</span>
            </div>
            <div className="bg-[#02091c] p-3.5 rounded-xl border border-cyan-900/30">
              <span className="text-[10px] text-slate-400 uppercase">Decision Status</span>
              <div className={`text-base font-black ${analysisResult.has_violence ? 'text-red-400' : 'text-emerald-400'}`}>
                {analysisResult.has_violence ? 'INCIDENT LOGGED' : 'CLEARED / SAFE'}
              </div>
              <span className="text-[9px] text-slate-500">Threshold: {Math.round(threshold * 100)}%</span>
            </div>
          </div>

          {/* Action Row: Exact 3 Requested Actions */}
          <div className="pt-4 border-t border-cyan-900/30 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-tech text-slate-400">
              Generated forensic audit package: PDF ReportLab, Frame 01, Frame 02.
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Button 1: VIEW REPORT */}
              <button
                onClick={() => {
                  if (setSelectedEvidenceId) setSelectedEvidenceId(analysisResult.event_id);
                  setActiveTab('evidence');
                }}
                className="px-4 py-2.5 rounded-xl orchid-glass hover:bg-white/15 text-white font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-white/80" />
                <span>VIEW REPORT</span>
              </button>

              {/* Button 2: DOWNLOAD REPORT */}
              <a
                href={`${API_BASE}/evidence/${analysisResult.event_id}/report`}
                target="_blank"
                rel="noreferrer"
                download={`Vigil_Report_${analysisResult.event_id}.pdf`}
                className="px-4 py-2.5 rounded-xl orchid-btn-dark hover:bg-[#282832] text-white font-medium transition flex items-center gap-1.5 cursor-pointer shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
              >
                <Download className="w-4 h-4 text-white" />
                <span>DOWNLOAD REPORT</span>
              </a>

              {/* Button 3: VIEW SAMPLE FRAMES */}
              <a
                href={`${API_BASE}/evidence/${analysisResult.event_id}/frame2`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl orchid-glass hover:bg-white/15 text-white/90 font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-white/80" />
                <span>VIEW SAMPLE FRAMES</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
