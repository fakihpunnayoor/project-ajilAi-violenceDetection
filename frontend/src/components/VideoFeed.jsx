import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Video, AlertTriangle, Play, Square, Upload, RefreshCw, Eye, Sparkles } from 'lucide-react';
import audioSynthesizer from '../audio/AudioSynthesizer';

export default function VideoFeed({
  onFrameCaptured,
  inferenceResult,
  streamingFps = 20,
  alertThreshold = 0.70
}) {
  const [sourceType, setSourceType] = useState('webcam'); // 'webcam', 'sim_calm', 'sim_violence', 'video_upload'
  const [isStreaming, setIsStreaming] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const simCanvasRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Simulation state variables
  const simState = useRef({
    tick: 0,
    particles: Array.from({ length: 14 }, (_, i) => ({
      x: 100 + Math.random() * 440,
      y: 100 + Math.random() * 280,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      radius: 12 + Math.random() * 8,
      color: `hsl(${180 + Math.random() * 60}, 80%, 60%)`
    }))
  });

  // Start webcam
  const startWebcam = useCallback(async () => {
    setCameraError(null);
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (err) {
      console.warn("Webcam access failed:", err);
      setCameraError(err.message || "Camera permission denied or camera not available.");
      setIsCameraReady(false);
      // Automatically switch to simulated feed so user gets immediate visual feedback
      setSourceType('sim_calm');
    }
  }, []);

  // Stop webcam stream
  const stopWebcam = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  // Effect for source type changes
  useEffect(() => {
    if (sourceType === 'webcam') {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [sourceType, startWebcam, stopWebcam]);

  // Simulated Animation Loop for CCTV Scenarios
  useEffect(() => {
    let active = true;
    const renderSim = () => {
      if (!active) return;
      const cvs = simCanvasRef.current;
      if (cvs) {
        const ctx = cvs.getContext('2d');
        const w = cvs.width;
        const h = cvs.height;
        const state = simState.current;
        state.tick++;

        // Clear with CCTV surveillance backdrop
        ctx.fillStyle = '#060b14';
        ctx.fillRect(0, 0, w, h);

        // Draw tactical background grid lines
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        if (sourceType === 'sim_calm') {
          // CALM SCENARIO: Smooth slow walking entities
          state.particles.forEach((p, idx) => {
            p.x += p.vx * 0.8;
            p.y += p.vy * 0.8;
            if (p.x < 30 || p.x > w - 30) p.vx *= -1;
            if (p.y < 30 || p.y > h - 30) p.vy *= -1;

            ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
            ctx.fill();

            // Bounding box
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
            ctx.strokeRect(p.x - 16, p.y - 16, 32, 32);
          });

          // Text watermark
          ctx.fillStyle = '#10b981';
          ctx.font = '12px monospace';
          ctx.fillText(`CAM-01 [ZONE-A PUBLIC SQUARE] // STATUS: NOMINAL // ACTORS: ${state.particles.length}`, 20, 30);

        } else if (sourceType === 'sim_violence') {
          // VIOLENT SCENARIO: High-velocity erratic chaotic motion, rapid impact flares
          state.particles.forEach((p, idx) => {
            // Erratic high acceleration
            p.vx += (Math.random() - 0.5) * 8;
            p.vy += (Math.random() - 0.5) * 8;
            p.vx = Math.max(-28, Math.min(28, p.vx));
            p.vy = Math.max(-28, Math.min(28, p.vy));
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 40 || p.x > w - 40) p.vx *= -1.2;
            if (p.y < 40 || p.y > h - 40) p.vy *= -1.2;

            // Flashy threat colors
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 18 + Math.sin(state.tick * 0.5) * 6, 0, Math.PI * 2);
            ctx.fill();

            // Threat target brackets
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(p.x - 22, p.y - 22, 44, 44);

            // Connect nearby clashing actors with impact lines
            state.particles.slice(idx + 1).forEach(other => {
              const dx = p.x - other.x;
              const dy = p.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 110) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
              }
            });
          });

          // Violent alert watermark
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 13px monospace';
          ctx.fillText(`CAM-04 [SUBWAY PERIMETER] // WARNING: HIGH KINETIC DISTURBANCE`, 20, 30);
        }

        // Live timestamp HUD on canvas
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText(new Date().toISOString(), 20, h - 20);
      }
      animFrameRef.current = requestAnimationFrame(renderSim);
    };

    if (sourceType === 'sim_calm' || sourceType === 'sim_violence') {
      renderSim();
    }

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [sourceType]);

  // Frame Capture & WebSocket Emission Interval
  useEffect(() => {
    if (!isStreaming) {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      return;
    }

    const intervalMs = Math.round(1000 / streamingFps);

    const captureAndEmit = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      let sourceElement = null;

      if (sourceType === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        sourceElement = videoRef.current;
      } else if ((sourceType === 'sim_calm' || sourceType === 'sim_violence') && simCanvasRef.current) {
        sourceElement = simCanvasRef.current;
      } else if (sourceType === 'video_upload' && videoRef.current && videoRef.current.readyState >= 2) {
        sourceElement = videoRef.current;
      }

      if (sourceElement) {
        // Draw to capture canvas (scaled to 480x360 for high-speed transmission)
        ctx.drawImage(sourceElement, 0, 0, canvas.width, canvas.height);
        // Encode to JPEG data URI with quality 0.72
        const frameDataUri = canvas.toDataURL('image/jpeg', 0.72);
        onFrameCaptured(frameDataUri);
      }
    };

    streamIntervalRef.current = setInterval(captureAndEmit, intervalMs);

    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isStreaming, streamingFps, sourceType, onFrameCaptured]);

  // Video File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.loop = true;
      videoRef.current.play();
      setSourceType('video_upload');
    }
  };

  const isAlert = inferenceResult?.is_alert;
  const violenceProb = inferenceResult?.violence_prob || 0.0;
  const confidence = inferenceResult?.confidence || 0.0;
  const prediction = inferenceResult?.prediction || 'Analyzing...';

  return (
    <div className="flex flex-col gap-3 w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Feed Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Video className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">
            PRIMARY SENSOR FEED
          </span>
        </div>

        {/* Source Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setSourceType('webcam')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
              sourceType === 'webcam'
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            WEBCAM
          </button>

          <button
            onClick={() => setSourceType('sim_calm')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
              sourceType === 'sim_calm'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            CCTV: NORMAL
          </button>

          <button
            onClick={() => setSourceType('sim_violence')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
              sourceType === 'sim_violence'
                ? 'bg-red-950 border-red-500 text-red-300 font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            CCTV: THREAT
          </button>

          {/* File Upload Button */}
          <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD VIDEO</span>
            <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Stream Pause / Play */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`p-1.5 rounded-lg border transition ${
              isStreaming
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
            }`}
            title={isStreaming ? 'Pause Stream Processing' : 'Resume Stream Processing'}
          >
            {isStreaming ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Display Area */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group">
        {/* Hidden Frame Capture Canvas */}
        <canvas ref={canvasRef} width={480} height={360} className="hidden" />

        {/* Real Webcam or Uploaded Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain ${
            sourceType === 'webcam' || sourceType === 'video_upload' ? 'block' : 'hidden'
          }`}
        />

        {/* Simulated CCTV Canvas */}
        <canvas
          ref={simCanvasRef}
          width={640}
          height={480}
          className={`w-full h-full object-contain ${
            sourceType === 'sim_calm' || sourceType === 'sim_violence' ? 'block' : 'hidden'
          }`}
        />

        {/* Scanlines / CRT Tactical Overlay */}
        <div className="scanline-overlay absolute inset-0 pointer-events-none" />

        {/* Tactical HUD Corner Reticles */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none opacity-80" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none opacity-80" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none opacity-80" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none opacity-80" />

        {/* Radar Crosshair Center Target (Subtle) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-16 h-16 rounded-full border border-cyan-400 border-dashed" />
          <div className="w-32 h-32 rounded-full border border-cyan-400/50" />
        </div>

        {/* Critical Alert Emergency Overlay Frame */}
        {isAlert && (
          <div className="absolute inset-0 border-4 border-red-600 animate-pulse pointer-events-none bg-red-900/10 flex flex-col justify-between p-4 shadow-[inset_0_0_40px_rgba(239,68,68,0.5)]">
            <div className="flex justify-between items-start">
              <div className="bg-red-600 text-white font-mono text-xs font-black px-3 py-1 rounded shadow-lg flex items-center gap-1.5 animate-bounce">
                <AlertTriangle className="w-4 h-4" />
                CRITICAL VIOLENCE DETECTED
              </div>
              <div className="bg-red-950/90 border border-red-500 text-red-300 font-mono text-xs px-2.5 py-1 rounded">
                CONFIDENCE: {(confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center font-mono text-red-400 text-xs font-bold tracking-widest bg-red-950/80 py-1 rounded border border-red-500/40">
              TACTICAL THREAT PROTOCOL ENGAGED // RECORDING EVIDENCE
            </div>
          </div>
        )}

        {/* HUD Live Metadata Tag */}
        <div className="absolute bottom-3 left-4 pointer-events-none flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded font-mono text-xs font-bold flex items-center gap-1.5 backdrop-blur ${
            isAlert ? 'bg-red-900/80 text-red-200 border border-red-500' : 'bg-slate-900/80 text-cyan-300 border border-cyan-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-400 animate-ping' : 'bg-cyan-400'}`} />
            {prediction.toUpperCase()} [{(violenceProb * 100).toFixed(1)}%]
          </div>
        </div>

        {/* Camera Permission Warning Banner */}
        {cameraError && sourceType === 'webcam' && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
            <Camera className="w-12 h-12 text-amber-500 mb-3" />
            <h3 className="text-sm font-bold text-slate-200 font-mono">WEBCAM SENSOR UNAVAILABLE</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {cameraError}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSourceType('sim_calm')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs rounded-lg transition"
              >
                SWITCH TO SIMULATED CCTV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
