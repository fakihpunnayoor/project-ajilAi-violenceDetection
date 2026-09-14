"""
AegisVision: Deep Learning Model Training Pipeline
Trains the ViolenceCNNLSTM temporal action recognition model on multi-dataset spatial features.
Uses sequence augmentations, AdamW optimizer, Cosine Annealing, and early stopping.
Saves production weights to backend/weights/violence_cnnlstm.pth.
"""

import os
import sys
import json
import logging
import time
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

sys.path.insert(0, os.path.dirname(__file__))
from model import ViolenceCNNLSTM

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("AegisVision.Train")

CACHE_DIR = os.path.join(os.path.dirname(__file__), "data", "cached_features")
WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")
os.makedirs(WEIGHTS_DIR, exist_ok=True)


class CachedSequenceDataset(Dataset):
    def __init__(self, X_path: str, y_path: str, augment: bool = False):
        self.X = np.load(X_path)  # Shape: (N, 16, 1280)
        self.y = np.load(y_path)  # Shape: (N,)
        self.augment = augment

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        feat = self.X[idx].copy()
        label = self.y[idx]

        if self.augment:
            # 1. Feature jitter / Gaussian noise injection
            if np.random.rand() < 0.5:
                noise = np.random.normal(0, 0.02, feat.shape).astype(np.float32)
                feat = feat + noise

            # 2. Temporal speed perturbation / random frame dropout
            if np.random.rand() < 0.3:
                mask = np.random.binomial(1, 0.9, size=(feat.shape[0], 1)).astype(np.float32)
                feat = feat * mask

        return torch.from_numpy(feat).float(), torch.tensor(label, dtype=torch.long)


def train_model(epochs: int = 25, batch_size: int = 32, lr: float = 1e-3):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device for training: {device}")

    # Check cached features
    train_x_path = os.path.join(CACHE_DIR, "train_X.npy")
    train_y_path = os.path.join(CACHE_DIR, "train_y.npy")
    val_x_path = os.path.join(CACHE_DIR, "val_X.npy")
    val_y_path = os.path.join(CACHE_DIR, "val_y.npy")

    if not os.path.exists(train_x_path):
        from dataset_manager import build_and_cache_multi_dataset
        logger.info("Cached features not found. Building multi-dataset corpus...")
        build_and_cache_multi_dataset(num_samples=1000)

    train_dataset = CachedSequenceDataset(train_x_path, train_y_path, augment=True)
    val_dataset = CachedSequenceDataset(val_x_path, val_y_path, augment=False)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    feature_dim = train_dataset.X.shape[-1]
    logger.info(f"Loaded dataset with feature dimension: {feature_dim}")

    # Initialize model
    model = ViolenceCNNLSTM(feature_dim=feature_dim, hidden_dim=128, num_layers=2, num_classes=2).to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)

    best_val_loss = float("inf")
    best_val_acc = 0.0
    best_weights_path = os.path.join(WEIGHTS_DIR, "violence_cnnlstm.pth")

    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

    logger.info(f"Starting training run: {epochs} epochs, {len(train_dataset)} train samples, {len(val_dataset)} val samples...")

    start_train_time = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for feats, labels in train_loader:
            feats = feats.to(device)    # (B, 16, 1280)
            labels = labels.to(device)  # (B,)

            optimizer.zero_grad()
            
            # Forward pass directly into sequence modeler & classifier
            lstm_out, _ = model.lstm(feats)
            logits = model.classifier(lstm_out[:, -1, :])

            loss = criterion(logits, labels)
            loss.backward()

            # Gradient clipping to prevent exploding gradients in LSTM
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            running_loss += loss.item() * feats.size(0)
            preds = torch.argmax(logits, dim=1)
            correct_train += (preds == labels).sum().item()
            total_train += labels.size(0)

        scheduler.step()

        epoch_train_loss = running_loss / total_train
        epoch_train_acc = (correct_train / total_train) * 100.0

        # Validation phase
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for feats, labels in val_loader:
                feats = feats.to(device)
                labels = labels.to(device)

                lstm_out, _ = model.lstm(feats)
                logits = model.classifier(lstm_out[:, -1, :])

                loss = criterion(logits, labels)
                val_loss += loss.item() * feats.size(0)
                preds = torch.argmax(logits, dim=1)
                correct_val += (preds == labels).sum().item()
                total_val += labels.size(0)

        epoch_val_loss = val_loss / total_val
        epoch_val_acc = (correct_val / total_val) * 100.0

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 2))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 2))

        logger.info(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.1f}% | "
            f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.1f}%"
        )

        # Save best model checkpoint
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            best_val_acc = epoch_val_acc
            torch.save(model.state_dict(), best_weights_path)
            logger.info(f"  >>> Checkpoint saved! Best Val Acc: {best_val_acc:.1f}% (Val Loss: {best_val_loss:.4f})")

    total_time = time.time() - start_train_time
    logger.info(f"Training completed in {total_time:.2f}s! Best Validation Accuracy: {best_val_acc:.2f}%")

    with open(os.path.join(WEIGHTS_DIR, "training_history.json"), "w") as f:
        json.dump(history, f, indent=2)

    return best_weights_path, best_val_acc


if __name__ == "__main__":
    train_model(epochs=20, batch_size=32, lr=1e-3)
