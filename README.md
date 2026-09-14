# AegisVision: Real-Time Violence Detection System

A high-performance, enterprise-grade spatial-temporal action recognition and threat detection platform. **AegisVision** combines a tactical React surveillance dashboard with a low-latency Python FastAPI backend running a PyTorch CNN-LSTM temporal pipeline over bi-directional WebSockets.

---

## Key Features

- **Spatial-Temporal Deep Learning Architecture (`ViolenceCNNLSTM`)**:
  - Spatial Backbone: `MobileNetV2` extracting 1280-dimensional feature representations per frame.
  - Sequence Modeler: 2-layer temporal LSTM modeling dynamic motion transitions across a sliding window buffer ($N=16$ frames).
  - Classification Head: Multi-layer Perceptron yielding binary probabilities (`Violence` vs `Non-Violence`).
  - Graceful Fallback Heuristic Engine: Instant out-of-the-box local execution if pre-trained `.pth` weights are not mounted.
- **Bi-Directional Low-Latency WebSockets (`/ws/stream`)**:
  - Streams frames sampled via HTML5 Canvas (10-30 FPS) with round-trip latency tracking (sub-40ms server processing).
  - Thread-safe sliding window buffers per connected client session.
- **Tactical Security Operations Center (SOC) Dashboard**:
  - Cyberpunk-themed surveillance HUD with target brackets, scanlines, and real-time alert pulses.
  - Multi-source inputs: Live Webcam, Simulated CCTV Feeds (Normal Public Plaza vs. Active Brawl), and Video File Upload.
  - Rolling 60-point SVG temporal violence probability chart.
  - Real-time sensitivity threshold slider (40% to 95%) and buffer size controls (8, 16, 24, 32 frames).
- **Zero-Asset Web Audio API Synthesizer**:
  - High-priority tactical sirens and warning blips synthesized in pure JavaScript code.
- **Incident Evidence Vault**:
  - Automatically captures high-confidence threat snapshots to an incident log with timestamps, peak confidence, and downloadable JSON reports.
- **Bonus Standalone 2D Arcade Game**:
  - Self-contained Phaser 3 + Tailwind CSS platformer in `standalone-game/index.html`.

---

## Directory Structure

```
ai/
├── backend/
│   ├── main.py              # FastAPI server, WebSocket handler, and REST endpoints
│   ├── model.py             # ViolenceCNNLSTM PyTorch model, sliding buffer, inference engine
│   ├── start_backend.py     # Backend startup script (port 8000)
│   ├── test_pipeline.py     # Unit test for PyTorch model forward pass & sliding window
│   ├── test_ws_server.py    # Integration test for REST & WebSocket streaming
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── audio/           # Web Audio API tactical sound synthesizer
│   │   ├── components/      # Tactical HUD, VideoFeed, ThreatAnalytics, ControlsPanel, IncidentVault
│   │   ├── App.jsx          # Root application with WebSocket state manager
│   │   ├── index.css        # Tailwind CSS v4 & cyber-surveillance styling
│   │   └── main.jsx         # React entrypoint
│   └── public/
│       └── standalone-game/ # Bonus 2D arcade platformer game
├── standalone-game/
│   └── index.html           # Standalone Phaser 3 + Tailwind CSS game
├── run_all.bat              # One-click Windows launcher
└── README.md                # Project documentation
```

---

## Quickstart Guide

### 1. Backend Setup & Startup
```bash
# Ensure Python packages are installed
python -m pip install -r backend/requirements.txt

# Run automated tests
python backend/test_pipeline.py
python backend/test_ws_server.py

# Launch FastAPI backend
python backend/start_backend.py
```
Backend will be available at:
- **REST Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **WebSocket Endpoint**: `ws://localhost:8000/ws/stream`

### 2. Frontend Setup & Startup
```bash
cd frontend
npm install
npm run dev
```
Dashboard will open at: [http://localhost:5173](http://localhost:5173)

### 3. Or Launch Both Simultaneously
Double-click `run_all.bat` on Windows.

---

## API & WebSocket Specification

### WebSocket: `/ws/stream`
- **Client Frame Payload**:
  ```json
  {
    "frame": "data:image/jpeg;base64,...",
    "timestamp": 1726270000.0,
    "threshold": 0.70
  }
  ```
- **Server Telemetry Response**:
  ```json
  {
    "prediction": "Violence",
    "confidence": 0.942,
    "violence_prob": 0.942,
    "is_alert": true,
    "fps": 24.5,
    "latency_ms": 38.2,
    "server_proc_ms": 12.4,
    "backend_mode": "pytorch_cnnlstm_active",
    "buffer_len": 16,
    "motion_energy": 0.812,
    "defense_status": "CRITICAL",
    "total_incidents": 3
  }
  ```

### REST Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root info & service metadata |
| `GET` | `/api/health` | Hardware telemetry (CPU/GPU), active clients, model status |
| `GET` | `/api/incidents` | List captured violent incidents with snapshot thumbnails |
| `POST` | `/api/incidents/clear` | Clear incident evidence vault |
| `POST` | `/api/config` | Update alert sensitivity thresholds & sliding window size |
| `POST` | `/api/test-alert` | Simulate a threat incident to verify sirens & evidence logging |

---

## Bonus: 2D Phaser 3 Arcade Game
Open `standalone-game/index.html` directly in any web browser or click the **"LAUNCH 2D ARCADE GAME"** button on the dashboard.
- **Controls**: `A` / `D` or Arrow Keys to run, `Space` / `W` to jump.
- **Features**: Variable jump height, double jump, wall slide / jump, procedural retro sound effects via Web Audio API, dynamic parallax backgrounds.
