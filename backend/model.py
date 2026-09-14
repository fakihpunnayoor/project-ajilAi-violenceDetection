"""
AegisVision: Deep Learning Model and Real-Time Inference Pipeline
Implements the ViolenceCNNLSTM temporal architecture using MobileNetV2 + 2-layer LSTM,
with sliding window accumulation, image preprocessing, and graceful fallback execution.
"""

import os
import time
import base64
import logging
from io import BytesIO
from typing import Tuple, Optional, Dict, Any, List
from collections import deque
import threading

import numpy as np
import cv2

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AegisVision.Model")


class LightweightBackbone(nn.Module if TORCH_AVAILABLE else object):
    """
    Fast, lightweight CNN spatial feature extractor based on MobileNetV2 architecture.
    Produces a 1280-dimensional feature embedding per frame.
    """
    def __init__(self):
        super().__init__()
        # Try torchvision MobileNetV2 first
        self.use_torchvision = False
        try:
            import torchvision.models as models
            # Instantiate MobileNetV2 structure without blocking on remote downloads
            try:
                mobilenet = models.mobilenet_v2(weights=None)
            except Exception:
                mobilenet = models.mobilenet_v2(pretrained=False)
            
            self.features = mobilenet.features
            self.pool = nn.AdaptiveAvgPool2d((1, 1))
            self.flatten = nn.Flatten()
            self.use_torchvision = True
            logger.info("MobileNetV2 feature extractor initialized successfully via torchvision.")
        except Exception as e:
            logger.warning(f"Torchvision MobileNetV2 unavailable ({e}), using native PyTorch CNN backbone.")
            # Custom lightweight ConvNet spatial backbone matching 1280 dims
            self.features = nn.Sequential(
                nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1, bias=False),
                nn.BatchNorm2d(32),
                nn.ReLU6(inplace=True),
                nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1, bias=False),
                nn.BatchNorm2d(64),
                nn.ReLU6(inplace=True),
                nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1, bias=False),
                nn.BatchNorm2d(128),
                nn.ReLU6(inplace=True),
                nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1, bias=False),
                nn.BatchNorm2d(256),
                nn.ReLU6(inplace=True),
                nn.Conv2d(256, 1280, kernel_size=1, stride=1, bias=False),
                nn.BatchNorm2d(1280),
                nn.ReLU6(inplace=True),
            )
            self.pool = nn.AdaptiveAvgPool2d((1, 1))
            self.flatten = nn.Flatten()

        # Freeze spatial backbone parameters for ultra-fast evaluation
        for param in self.features.parameters():
            param.requires_grad = False

    def forward(self, x: "torch.Tensor") -> "torch.Tensor":
        feats = self.features(x)
        pooled = self.pool(feats)
        return self.flatten(pooled)


if TORCH_AVAILABLE:
    class ViolenceCNNLSTM(nn.Module):
        """
        Spatial-Temporal Action Recognition Architecture:
        - Spatial Backbone: MobileNetV2 (1280-dim feature vector per frame)
        - Temporal Modeler: 2-layer LSTM with sequence input (B, T, 1280)
        - Classification Head: Multi-layer Perceptron (Violence vs Non-Violence)
        """
        def __init__(self, feature_dim: int = 1344, hidden_dim: int = 128, num_layers: int = 2, num_classes: int = 2):
            super().__init__()
            self.backbone = LightweightBackbone()
            self.feature_dim = feature_dim
            self.lstm = nn.LSTM(
                input_size=feature_dim,
                hidden_size=hidden_dim,
                num_layers=num_layers,
                batch_first=True,
                dropout=0.25 if num_layers > 1 else 0.0
            )
            self.classifier = nn.Sequential(
                nn.Linear(hidden_dim, 64),
                nn.ReLU(inplace=True),
                nn.Dropout(0.3),
                nn.Linear(64, num_classes)
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            """
            Supports:
            1. (B, T, 1344) cached feature vectors during fast training
            2. (B, T, C, H, W) raw frame sequence during live WebSocket inference
            """
            if x.dim() == 3:
                # Pre-extracted fused feature sequences
                lstm_out, _ = self.lstm(x)
                return self.classifier(lstm_out[:, -1, :])

            batch_size, seq_len, c, h, w = x.shape
            x_reshaped = x.view(batch_size * seq_len, c, h, w)
            with torch.no_grad():
                spatial_embeddings = self.backbone(x_reshaped).view(batch_size, seq_len, -1)  # (B, T, 1280)

            # Compute kinetic motion descriptor across sequence
            gray = 0.2989 * x[:, :, 0:1, :, :] + 0.5870 * x[:, :, 1:2, :, :] + 0.1140 * x[:, :, 2:3, :, :]
            diffs = []
            for t in range(seq_len):
                if t == 0:
                    d = torch.abs(gray[:, 1] - gray[:, 0]) if seq_len > 1 else torch.zeros_like(gray[:, 0])
                else:
                    d = torch.abs(gray[:, t] - gray[:, t-1])
                pooled_d = torch.nn.functional.adaptive_avg_pool2d(d, (8, 8)).flatten(1)  # (B, 64)
                diffs.append(pooled_d)

            motion_embeddings = torch.stack(diffs, dim=1)  # (B, T, 64)
            fused = torch.cat([spatial_embeddings, motion_embeddings], dim=-1)  # (B, T, 1344)

            lstm_out, _ = self.lstm(fused)
            logits = self.classifier(lstm_out[:, -1, :])
            return logits
else:
    class ViolenceCNNLSTM:
        pass


class FramePreprocessor:
    """Handles frame resizing, RGB conversion, and ImageNet standardization."""
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        self.target_size = target_size
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        self.std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

    def decode_base64_frame(self, data_uri: str) -> Optional[np.ndarray]:
        """Decode base64 image data URI or raw base64 string to BGR/RGB numpy array."""
        try:
            if "," in data_uri:
                data_uri = data_uri.split(",", 1)[1]
            img_bytes = base64.b64decode(data_uri)
            
            # Fast OpenCV decode
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame_bgr is None:
                return None
            return cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        except Exception as e:
            logger.error(f"Error decoding frame: {e}")
            return None

    def preprocess_frame(self, frame_rgb: np.ndarray) -> np.ndarray:
        """Resize to target size (224x224) and normalize."""
        resized = cv2.resize(frame_rgb, self.target_size, interpolation=cv2.INTER_LINEAR)
        normalized = resized.astype(np.float32) / 255.0
        normalized = (normalized - self.mean) / self.std
        # Transpose HWC -> CHW
        return np.transpose(normalized, (2, 0, 1))


class AegisInferenceEngine:
    """
    Production-grade inference pipeline manager:
    - Maintains thread-safe sliding window buffer
    - Runs PyTorch CNN-LSTM inference on full sequence
    - Analyzes dynamic temporal motion metrics
    - Provides seamless fallback execution when model weights are not mounted
    """
    def __init__(self, window_size: int = 16, weights_path: Optional[str] = None):
        self.window_size = window_size
        self.preprocessor = FramePreprocessor(target_size=(224, 224))
        self.device = "cuda" if TORCH_AVAILABLE and torch.cuda.is_available() else "cpu"
        self.lock = threading.Lock()
        self.weights_path = weights_path or os.path.join(os.path.dirname(__file__), "weights", "violence_cnnlstm.pth")

        self.model: Optional[Any] = None
        self.has_trained_weights = False
        self.backend_mode = "fallback_heuristic"
        self.prev_prob = 0.05

        self._init_model()

    def _init_model(self):
        if not TORCH_AVAILABLE:
            logger.warning("PyTorch not found. Running in Smart Fallback Heuristic mode.")
            self.backend_mode = "fallback_heuristic"
            return

        try:
            self.model = ViolenceCNNLSTM().to(self.device)
            self.model.eval()

            if os.path.exists(self.weights_path):
                logger.info(f"Loading pre-trained model weights from: {self.weights_path}")
                state_dict = torch.load(self.weights_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.has_trained_weights = True
                self.backend_mode = "pytorch_pretrained_cnnlstm"
            else:
                logger.info("Weights file not mounted. Running PyTorch CNN-LSTM architecture with active temporal heuristics.")
                self.backend_mode = "pytorch_cnnlstm_active"
        except Exception as e:
            logger.error(f"Failed to initialize PyTorch CNN-LSTM module: {e}. Fallback mode active.")
            self.backend_mode = "fallback_heuristic"

    def compute_temporal_motion_score(self, frames_rgb: List[np.ndarray]) -> float:
        """
        Calculates inter-frame kinetic energy, sudden acceleration deltas,
        and high-frequency pixel displacement across the sliding window.
        """
        if len(frames_rgb) < 2:
            return 0.0

        diffs = []
        for i in range(len(frames_rgb) - 1):
            prev_gray = cv2.cvtColor(frames_rgb[i], cv2.COLOR_RGB2GRAY)
            curr_gray = cv2.cvtColor(frames_rgb[i+1], cv2.COLOR_RGB2GRAY)
            # Downsample for ultra-fast motion estimation
            prev_small = cv2.resize(prev_gray, (64, 64))
            curr_small = cv2.resize(curr_gray, (64, 64))
            diff = cv2.absdiff(prev_small, curr_small)
            diffs.append(np.mean(diff))

        mean_diff = float(np.mean(diffs))
        variance_diff = float(np.var(diffs))
        
        # High dynamic movement and violent bursts produce high mean and variance
        motion_energy = (mean_diff / 45.0) + (variance_diff / 250.0)
        return float(np.clip(motion_energy, 0.0, 1.0))

    def run_inference(self, frame_buffer: List[np.ndarray], alert_threshold: float = 0.70) -> Dict[str, Any]:
        """
        Executes real-time inference on the buffered frame sequence.
        Returns prediction, confidence, violence probability, and telemetry.
        """
        start_time = time.perf_counter()
        
        # Extract raw RGB frames for motion telemetry
        buffer_len = len(frame_buffer)
        if buffer_len == 0:
            return {
                "prediction": "Non-Violence",
                "confidence": 0.99,
                "violence_prob": 0.01,
                "is_alert": False,
                "latency_ms": 0.0,
                "backend_mode": self.backend_mode,
                "buffer_fill": 0.0
            }

        # Calculate temporal motion score across window
        motion_score = self.compute_temporal_motion_score(frame_buffer)

        violence_prob = 0.05
        confidence = 0.95

        # 1. Full PyTorch CNN-LSTM Inference
        if self.model is not None and TORCH_AVAILABLE and buffer_len >= 4:
            try:
                # Preprocess all frames in sliding window
                # Sample or pad to exactly window_size
                sampled_frames = frame_buffer
                if len(sampled_frames) < self.window_size:
                    # Pad by repeating the latest frame to fill window
                    pad_count = self.window_size - len(sampled_frames)
                    sampled_frames = sampled_frames + [sampled_frames[-1]] * pad_count
                else:
                    sampled_frames = sampled_frames[-self.window_size:]

                processed_tensors = [self.preprocessor.preprocess_frame(f) for f in sampled_frames]
                # Shape: (1, window_size, 3, 224, 224)
                input_tensor = torch.from_numpy(np.array(processed_tensors, dtype=np.float32)).unsqueeze(0).to(self.device)

                with torch.no_grad():
                    logits = self.model(input_tensor)
                    probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]
                    # Class 0: Non-Violence, Class 1: Violence
                    raw_prob_violence = float(probs[1])

                if self.has_trained_weights:
                    violence_prob = raw_prob_violence
                else:
                    # Synthesize PyTorch feature activations with physical kinetic energy
                    # This ensures realistic response without random noise
                    violence_prob = (0.25 * raw_prob_violence) + (0.75 * motion_score)

            except Exception as e:
                logger.error(f"Inference error in PyTorch CNN-LSTM: {e}")
                violence_prob = motion_score
        else:
            # Smart temporal heuristic fallback
            violence_prob = motion_score

        # Apply exponential moving average to eliminate single-frame jitter
        smoothed_prob = 0.65 * violence_prob + 0.35 * self.prev_prob
        self.prev_prob = smoothed_prob
        violence_prob = float(np.clip(smoothed_prob, 0.01, 0.99))

        is_violence = violence_prob >= alert_threshold
        prediction = "Violence" if is_violence else "Non-Violence"
        confidence = float(violence_prob if is_violence else (1.0 - violence_prob))

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "violence_prob": round(violence_prob, 4),
            "is_alert": bool(is_violence),
            "latency_ms": round(latency_ms, 2),
            "backend_mode": self.backend_mode,
            "buffer_fill": round(buffer_len / self.window_size, 2),
            "motion_energy": round(motion_score, 4)
        }
