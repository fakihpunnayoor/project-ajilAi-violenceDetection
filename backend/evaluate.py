"""
AegisVision: Comprehensive Evaluation and Multi-Dataset Benchmarking Suite
Evaluates the trained ViolenceCNNLSTM model on held-out multi-dataset test sequences.
Computes Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and ROC-AUC.
Exports benchmark report to backend/weights/model_metrics.json.
"""

import os
import sys
import json
import time
import logging
import numpy as np
import torch
import torch.nn as nn

sys.path.insert(0, os.path.dirname(__file__))
from model import ViolenceCNNLSTM

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("AegisVision.Evaluate")

CACHE_DIR = os.path.join(os.path.dirname(__file__), "data", "cached_features")
WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")


def compute_roc_auc(y_true: np.ndarray, y_scores: np.ndarray) -> float:
    """Computes Area Under ROC curve via trapezoidal numerical integration."""
    desc_score_indices = np.argsort(y_scores, kind="mergesort")[::-1]
    y_true = y_true[desc_score_indices]
    y_scores = y_scores[desc_score_indices]

    distinct_value_indices = np.where(np.diff(y_scores))[0]
    threshold_idxs = np.r_[distinct_value_indices, y_true.size - 1]

    tps = np.cumsum(y_true)[threshold_idxs]
    fps = 1 + threshold_idxs - tps

    tps = np.r_[0, tps]
    fps = np.r_[0, fps]

    if fps[-1] <= 0 or tps[-1] <= 0:
        return 0.5

    fpr = fps / fps[-1]
    tpr = tps / tps[-1]

    # Trapezoid integration
    if hasattr(np, "trapezoid"):
        return float(np.trapezoid(tpr, fpr))
    return float(np.trapz(tpr, fpr))


def run_evaluation(weights_path: str = None):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    weights_path = weights_path or os.path.join(WEIGHTS_DIR, "violence_cnnlstm.pth")

    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Weights file not found at: {weights_path}. Train the model first.")

    test_x_path = os.path.join(CACHE_DIR, "test_X.npy")
    test_y_path = os.path.join(CACHE_DIR, "test_y.npy")

    if not os.path.exists(test_x_path):
        raise FileNotFoundError("Test data not found in cached_features. Build dataset first.")

    X_test = np.load(test_x_path)  # (N, 16, 1280)
    y_test = np.load(test_y_path)  # (N,)

    feature_dim = X_test.shape[-1]
    # Load model
    model = ViolenceCNNLSTM(feature_dim=feature_dim, hidden_dim=128, num_layers=2, num_classes=2).to(device)
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.eval()

    all_preds = []
    all_probs = []

    with torch.no_grad():
        for i in range(len(X_test)):
            feat_seq = torch.from_numpy(X_test[i:i+1]).float().to(device)  # (1, 16, 1280)
            lstm_out, _ = model.lstm(feat_seq)
            logits = model.classifier(lstm_out[:, -1, :])
            probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]
            
            all_probs.append(probs[1])  # Prob of violence
            all_preds.append(int(np.argmax(probs)))

    y_pred = np.array(all_preds)
    y_prob = np.array(all_probs)

    # Calculate Confusion Matrix
    TP = int(np.sum((y_test == 1) & (y_pred == 1)))
    FP = int(np.sum((y_test == 0) & (y_pred == 1)))
    TN = int(np.sum((y_test == 0) & (y_pred == 0)))
    FN = int(np.sum((y_test == 1) & (y_pred == 0)))

    total = len(y_test)
    accuracy = (TP + TN) / total * 100.0
    precision = (TP / (TP + FP) * 100.0) if (TP + FP) > 0 else 0.0
    recall = (TP / (TP + FN) * 100.0) if (TP + FN) > 0 else 0.0
    specificity = (TN / (TN + FP) * 100.0) if (TN + FP) > 0 else 0.0
    f1_score = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    roc_auc = compute_roc_auc(y_test, y_prob)

    metrics = {
        "status": "VALIDATED",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "model_architecture": "MobileNetV2 + 2-Layer Temporal LSTM + MLP",
        "num_test_samples": total,
        "accuracy_pct": round(accuracy, 2),
        "precision_pct": round(precision, 2),
        "recall_pct": round(recall, 2),
        "specificity_pct": round(specificity, 2),
        "f1_score": round(f1_score / 100.0, 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": {
            "true_positives": TP,
            "false_positives": FP,
            "true_negatives": TN,
            "false_negatives": FN
        },
        "datasets_evaluated": [
            "RWF-2000 Public Fight Benchmark",
            "Real-Life Violent Situations Benchmark",
            "Hockey Contact Altercations Benchmark",
            "CCTV Surveillance Night/Day Perspective",
            "Challenging Hard-Negative Actions"
        ]
    }

    metrics_path = os.path.join(WEIGHTS_DIR, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    logger.info("==================================================================")
    logger.info("   AEGISVISION MULTI-DATASET ACTION RECOGNITION BENCHMARK        ")
    logger.info("==================================================================")
    logger.info(f"   Accuracy:     {accuracy:.2f}%")
    logger.info(f"   Precision:    {precision:.2f}%")
    logger.info(f"   Recall:       {recall:.2f}%")
    logger.info(f"   F1-Score:     {metrics['f1_score']:.4f}")
    logger.info(f"   ROC-AUC:      {roc_auc:.4f}")
    logger.info(f"   Confusion:    TP={TP}, FP={FP}, TN={TN}, FN={FN}")
    logger.info(f"   Report:       {metrics_path}")
    logger.info("==================================================================")

    return metrics


if __name__ == "__main__":
    run_evaluation()
