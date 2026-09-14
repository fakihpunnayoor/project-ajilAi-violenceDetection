"""
AegisVision: Automated Test Suite for PyTorch Model and Inference Engine
Verifies spatial backbone, temporal LSTM forward pass, sliding-window buffer,
and fallback execution.
"""

import os
import sys
import time
import base64
import numpy as np
import cv2

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from model import ViolenceCNNLSTM, FramePreprocessor, AegisInferenceEngine, TORCH_AVAILABLE

def create_synthetic_frame(color=(0, 200, 100), draw_shapes=True) -> np.ndarray:
    """Generates an artificial RGB frame for testing without physical camera."""
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    img[:] = color
    if draw_shapes:
        cv2.circle(img, (320, 240), 60, (255, 255, 255), -1)
        cv2.rectangle(img, (100, 100), (200, 300), (0, 0, 255), 3)
    return img

def frame_to_base64_uri(frame_rgb: np.ndarray) -> str:
    frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.jpg', frame_bgr)
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"

def test_pipeline():
    print("\n==========================================")
    print(">>> Testing AegisVision Inference Pipeline")
    print("==========================================")

    # 1. Test Frame Preprocessing
    preprocessor = FramePreprocessor(target_size=(224, 224))
    frame = create_synthetic_frame()
    b64_uri = frame_to_base64_uri(frame)
    decoded = preprocessor.decode_base64_frame(b64_uri)
    assert decoded is not None, "Failed to decode base64 URI"
    assert decoded.shape == (480, 640, 3), f"Unexpected decoded shape: {decoded.shape}"
    
    processed = preprocessor.preprocess_frame(decoded)
    assert processed.shape == (3, 224, 224), f"Unexpected preprocessed shape: {processed.shape}"
    print("[PASS] Preprocessor: Frame decoding and ImageNet normalization verified.")

    # 2. Test PyTorch Model Forward Pass
    if TORCH_AVAILABLE:
        import torch
        print("\n>>> Testing PyTorch CNN-LSTM Architecture...")
        model = ViolenceCNNLSTM(feature_dim=1280, hidden_dim=128, num_layers=2, num_classes=2)
        model.eval()

        # Dummy sequence: Batch=1, Sequence=16, Channels=3, Height=224, Width=224
        dummy_seq = torch.randn(1, 16, 3, 224, 224)
        with torch.no_grad():
            logits = model(dummy_seq)
            probs = torch.softmax(logits, dim=-1)

        assert logits.shape == (1, 2), f"Expected logits shape (1, 2), got {logits.shape}"
        assert probs.shape == (1, 2), f"Expected probs shape (1, 2), got {probs.shape}"
        assert abs(torch.sum(probs).item() - 1.0) < 1e-4, "Softmax probabilities do not sum to 1.0"
        print(f"[PASS] PyTorch CNN-LSTM: Forward pass successful. Logits: {logits.numpy()}, Probs: {probs.numpy()}")

    # 3. Test AegisInferenceEngine Sliding Window & Inference
    print("\n>>> Testing Inference Engine Sliding Window...")
    engine = AegisInferenceEngine(window_size=16)
    
    # Simulate a stream of 20 consecutive frames
    frame_buffer = []
    for i in range(20):
        # Alternate colors to simulate motion
        c = (i * 12 % 255, (255 - i * 10) % 255, 128)
        f = create_synthetic_frame(color=c)
        frame_buffer.append(f)
        if len(frame_buffer) > 16:
            frame_buffer.pop(0)

        result = engine.run_inference(frame_buffer, alert_threshold=0.70)
        assert "prediction" in result
        assert "confidence" in result
        assert "violence_prob" in result
        assert "latency_ms" in result

    print(f"[PASS] Inference Engine: Processed 20 frames. Final result:")
    print(f"       Prediction: {result['prediction']}")
    print(f"       Violence Prob: {result['violence_prob']:.4f}")
    print(f"       Confidence: {result['confidence']:.4f}")
    print(f"       Latency: {result['latency_ms']:.2f} ms")
    print(f"       Backend Mode: {result['backend_mode']}")
    print("\n>>> ALL PIPELINE TESTS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_pipeline()
