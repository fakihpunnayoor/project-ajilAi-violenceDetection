import React, { useState, useEffect, useRef, useCallback } from 'react';
import CustomCursor from './components/CustomCursor';
import CinematicBackground from './components/CinematicBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import IntroPage from './pages/IntroPage';
import HomePage from './pages/HomePage';
import LiveDetectionPage from './pages/LiveDetectionPage';
import CapabilitiesPage from './pages/CapabilitiesPage';
import ArchitecturePage from './pages/ArchitecturePage';
import OpenWorldGamePage from './pages/OpenWorldGamePage';
import VideoUploadPage from './pages/VideoUploadPage';
import EvidencePage from './pages/EvidencePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import audioSynthesizer from './audio/AudioSynthesizer';

const BACKEND_WS_URL = 'ws://localhost:8000/ws/stream';
const BACKEND_API_URL = 'http://localhost:8000/api';

export default function App() {
  // Navigation State: Initial view is 'intro'
  const [activeTab, setActiveTab] = useState('intro');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);

  // Connection & Telemetry State
  const [isConnected, setIsConnected] = useState(false);
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const [backendMode, setBackendMode] = useState('Initializing...');
  const [defenseStatus, setDefenseStatus] = useState('NORMAL');

  // Controls & Configuration State
  const [alertThreshold, setAlertThreshold] = useState(0.70);
  const [windowSize, setWindowSize] = useState(16);
  const [streamingFps, setStreamingFps] = useState(20);
  const [isMuted, setIsMuted] = useState(false);

  // Real-time Inference Results
  const [inferenceResult, setInferenceResult] = useState(null);
  const [history, setHistory] = useState(() => Array(40).fill(0.05));
  const [incidents, setIncidents] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);

  // WebSocket reference
  const wsRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  // Fetch initial incidents & health from backend
  const fetchBackendData = useCallback(async () => {
    try {
      const [healthRes, incRes, benchRes] = await Promise.all([
        fetch(`${BACKEND_API_URL}/health`).then(r => r.json()).catch(() => null),
        fetch(`${BACKEND_API_URL}/incidents?limit=50`).then(r => r.json()).catch(() => null),
        fetch(`${BACKEND_API_URL}/model-benchmark`).then(r => r.json()).catch(() => null)
      ]);

      if (healthRes) {
        setBackendMode(healthRes.backend_mode || 'Running');
        if (healthRes.defense_status) setDefenseStatus(healthRes.defense_status);
        if (healthRes.config?.alert_threshold) setAlertThreshold(healthRes.config.alert_threshold);
      }
      if (incRes?.incidents) {
        setIncidents(incRes.incidents);
      }
      if (benchRes && benchRes.accuracy_pct) {
        setModelMetrics(benchRes);
      }
    } catch (e) {
      console.warn("Backend REST fetch failed:", e);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  // WebSocket Connection Manager with Auto-Reconnect
  useEffect(() => {
    let reconnectTimeout = null;
    let ws = null;

    const connectWS = () => {
      try {
        ws = new WebSocket(BACKEND_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log("[Vigil.ai] WebSocket Connected to", BACKEND_WS_URL);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setInferenceResult(data);

            if (data.fps !== undefined) setFps(data.fps);
            if (data.latency_ms !== undefined) setLatency(data.latency_ms);
            if (data.backend_mode) setBackendMode(data.backend_mode);
            if (data.defense_status) setDefenseStatus(data.defense_status);

            const prob = data.violence_prob ?? 0.05;
            setHistory(prev => [...prev.slice(1), prob]);

            if (data.latest_evidence_id) {
              setSelectedEvidenceId(data.latest_evidence_id);
            }

            // Audio alarm trigger
            if (data.is_alert) {
              audioSynthesizer.startAlarm();
              if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
              alertTimeoutRef.current = setTimeout(() => {
                audioSynthesizer.stopAlarm();
              }, 3000);
            }

            if (data.total_incidents !== undefined && data.is_alert) {
              fetchBackendData();
            }
          } catch (err) {
            console.error("Error parsing WS message:", err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.warn("[Vigil.ai] WS Disconnected, retrying in 2.5s...");
          reconnectTimeout = setTimeout(connectWS, 2500);
        };

        ws.onerror = (err) => {
          console.warn("[Vigil.ai] WS Error:", err);
          ws.close();
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWS, 2500);
      }
    };

    connectWS();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
      audioSynthesizer.stopAlarm();
    };
  }, [fetchBackendData]);

  // Send captured canvas frames via WebSocket
  const handleFrameCaptured = useCallback((frameBase64Uri) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        frame: frameBase64Uri,
        timestamp: Date.now() / 1000.0,
        threshold: alertThreshold
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  }, [alertThreshold]);

  // Sync backend config updates
  const handleSyncBackendConfig = async (partialConfig) => {
    try {
      await fetch(`${BACKEND_API_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialConfig)
      });
    } catch (e) {
      console.warn("Failed to sync config:", e);
    }
  };

  // Trigger test threat simulation
  const handleTriggerTestThreat = async () => {
    try {
      audioSynthesizer.startAlarm();
      setTimeout(() => audioSynthesizer.stopAlarm(), 3000);
      setDefenseStatus('CRITICAL');

      const res = await fetch(`${BACKEND_API_URL}/test-alert`, { method: 'POST' });
      const data = await res.json();
      if (data.incident?.id) {
        setSelectedEvidenceId(data.incident.id);
      }
      await fetchBackendData();
    } catch (e) {
      console.warn("Failed to trigger test alert:", e);
    }
  };

  // Clear incident logs
  const handleClearIncidents = async () => {
    try {
      await fetch(`${BACKEND_API_URL}/incidents/clear`, { method: 'POST' });
      setIncidents([]);
      setDefenseStatus('NORMAL');
    } catch (e) {
      console.warn("Failed to clear incidents:", e);
    }
  };

  // Determine whether to show Navbar and Footer
  const isIntro = activeTab === 'intro';
  const isGame = activeTab === 'game';

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-400 selection:text-slate-950">
      {/* 1. Custom Electric-Blue Cursor with Smooth Lerp */}
      <CustomCursor />

      {/* 2. Full-Page Cinematic Background with Seamless Image-to-Black Blend */}
      <CinematicBackground />

      {/* 3. Minimal Cinematic Navbar (hidden on full-screen Intro) */}
      {!isIntro && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isConnected={isConnected}
          defenseStatus={defenseStatus}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          onTriggerTestThreat={handleTriggerTestThreat}
        />
      )}

      {/* 4. Main Page View Container */}
      <main className={`flex-1 w-full mx-auto relative z-10 flex flex-col ${
        isIntro || isGame ? 'p-0 h-screen overflow-hidden' : 'max-w-7xl p-4 md:p-6'
      }`}>
        {/* Intro Page (Full-screen viewport) */}
        {activeTab === 'intro' && (
          <IntroPage
            onEnter={() => setActiveTab('home')}
            onLaunchGame={() => setActiveTab('game')}
          />
        )}

        {/* Home Page (Compact single viewport) */}
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onTriggerTestThreat={handleTriggerTestThreat}
          />
        )}

        {/* Main Detection Page (Camera & strictly minimal output) */}
        {activeTab === 'live' && (
          <LiveDetectionPage
            onFrameCaptured={handleFrameCaptured}
            inferenceResult={inferenceResult}
            streamingFps={streamingFps}
            setStreamingFps={setStreamingFps}
            alertThreshold={alertThreshold}
            setAlertThreshold={setAlertThreshold}
            windowSize={windowSize}
            setWindowSize={setWindowSize}
            incidents={incidents}
            onClearIncidents={handleClearIncidents}
            onTriggerTestThreat={handleTriggerTestThreat}
            onSyncBackendConfig={handleSyncBackendConfig}
            selectedEvidenceId={selectedEvidenceId}
            setSelectedEvidenceId={setSelectedEvidenceId}
          />
        )}

        {/* Platform Capabilities (Shown ONLY when clicked) */}
        {activeTab === 'capabilities' && (
          <CapabilitiesPage
            onLaunchDetection={() => setActiveTab('live')}
            onLaunchGame={() => setActiveTab('game')}
          />
        )}

        {/* Architecture (Shown ONLY when clicked) */}
        {activeTab === 'architecture' && (
          <ArchitecturePage
            onLaunchDetection={() => setActiveTab('live')}
            onLaunchGame={() => setActiveTab('game')}
          />
        )}

        {/* 3D Open World City Game */}
        {activeTab === 'game' && (
          <OpenWorldGamePage
            onBackToWebsite={() => setActiveTab('home')}
          />
        )}

        {/* Video Upload & Temporal Analysis */}
        {activeTab === 'upload' && (
          <VideoUploadPage
            setActiveTab={setActiveTab}
            setSelectedEvidenceId={setSelectedEvidenceId}
          />
        )}

        {/* Evidence Vault */}
        {activeTab === 'evidence' && (
          <EvidencePage
            selectedEvidenceId={selectedEvidenceId}
            setSelectedEvidenceId={setSelectedEvidenceId}
            onTriggerTestThreat={handleTriggerTestThreat}
          />
        )}

        {/* History Audit Logs */}
        {activeTab === 'history' && (
          <HistoryPage
            setActiveTab={setActiveTab}
            setSelectedEvidenceId={setSelectedEvidenceId}
          />
        )}

        {/* Settings Page */}
        {activeTab === 'settings' && (
          <SettingsPage
            alertThreshold={alertThreshold}
            setAlertThreshold={setAlertThreshold}
            windowSize={windowSize}
            setWindowSize={setWindowSize}
            streamingFps={streamingFps}
            setStreamingFps={setStreamingFps}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onSyncBackendConfig={handleSyncBackendConfig}
            onClearIncidents={handleClearIncidents}
            onTriggerTestThreat={handleTriggerTestThreat}
            backendMode={backendMode}
          />
        )}
      </main>

      {/* 5. Minimal Dark Cinematic Footer (hidden on full-screen Intro & Game) */}
      {!isIntro && !isGame && (
        <Footer
          isConnected={isConnected}
          fps={fps}
          latency={latency}
        />
      )}
    </div>
  );
}
