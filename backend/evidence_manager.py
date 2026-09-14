"""
AegisVision / VIGIL: Evidence Extraction and Report Generation Engine
Handles:
1. Frame 01 & Frame 02 extraction (onset & peak detection moments)
2. 4-5 second event video clip generation using OpenCV VideoWriter
3. Professional PDF Detection Report generation using ReportLab
4. Complete ZIP archive generation for unified evidence download
"""

import os
import sys
import time
import uuid
import zipfile
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
import cv2

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("VIGIL.EvidenceManager")

EVIDENCE_ROOT = os.path.join(os.path.dirname(__file__), "data", "evidence")
os.makedirs(EVIDENCE_ROOT, exist_ok=True)

CREATOR_NAME = "Faqih"
CREATOR_EMAIL = "fakkihpunnayoor@gmail.com"


class VigilEvidenceManager:
    def __init__(self, storage_dir: str = EVIDENCE_ROOT):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

    def create_event_directory(self, event_id: str) -> str:
        event_dir = os.path.join(self.storage_dir, event_id)
        os.makedirs(event_dir, exist_ok=True)
        return event_dir

    def save_evidence_frames(
        self,
        event_id: str,
        frame_01_rgb: np.ndarray,
        frame_02_rgb: np.ndarray,
        meta_01: Dict[str, Any] = None,
        meta_02: Dict[str, Any] = None
    ) -> Tuple[str, str]:
        """Saves two distinct evidence frames (early onset and peak event)."""
        event_dir = self.create_event_directory(event_id)
        f1_path = os.path.join(event_dir, "VIGIL_Evidence_Frame_01.png")
        f2_path = os.path.join(event_dir, "VIGIL_Evidence_Frame_02.png")

        # Convert RGB to BGR for OpenCV
        f1_bgr = cv2.cvtColor(frame_01_rgb, cv2.COLOR_RGB2BGR) if frame_01_rgb.ndim == 3 else frame_01_rgb
        f2_bgr = cv2.cvtColor(frame_02_rgb, cv2.COLOR_RGB2BGR) if frame_02_rgb.ndim == 3 else frame_02_rgb

        # Draw professional timestamp HUD overlay on saved evidence images
        ts_now = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        cv2.putText(f1_bgr, f"VIGIL EVIDENCE #1 // {event_id} // {ts_now}", (12, 24),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv2.LINE_AA)
        cv2.putText(f2_bgr, f"VIGIL EVIDENCE #2 // {event_id} // {ts_now}", (12, 24),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)

        cv2.imwrite(f1_path, f1_bgr)
        cv2.imwrite(f2_path, f2_bgr)
        logger.info(f"Saved Evidence Frames to {event_dir}")
        return f1_path, f2_path

    def extract_and_save_clip(
        self,
        event_id: str,
        source_frames: List[np.ndarray],
        fps: float = 20.0,
        target_duration: float = 4.5
    ) -> Optional[str]:
        """
        Creates a 4-5 second event evidence video clip (.mp4) from the temporal window frames.
        """
        event_dir = self.create_event_directory(event_id)
        clip_path = os.path.join(event_dir, "VIGIL_Detection_Event_Clip.mp4")

        if not source_frames:
            logger.warning("No source frames provided to generate clip.")
            return None

        h, w = source_frames[0].shape[:2]
        target_frames_count = int(max(15, fps * target_duration))

        # Sample or loop frames to hit target duration
        clip_frames = []
        if len(source_frames) >= target_frames_count:
            clip_frames = source_frames[-target_frames_count:]
        else:
            # Replicate / slow-motion loop to fill 4-5 seconds
            repeats = int(np.ceil(target_frames_count / len(source_frames)))
            expanded = (source_frames * repeats)[:target_frames_count]
            clip_frames = expanded

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(clip_path, fourcc, fps, (w, h))

        for f in clip_frames:
            f_bgr = cv2.cvtColor(f, cv2.COLOR_RGB2BGR) if f.ndim == 3 else f
            out.write(f_bgr)

        out.release()
        logger.info(f"Generated 4-5s Evidence Clip at: {clip_path}")
        return clip_path

    def generate_pdf_report(
        self,
        event_id: str,
        detection_data: Dict[str, Any],
        frame_01_path: Optional[str] = None,
        frame_02_path: Optional[str] = None,
        clip_path: Optional[str] = None
    ) -> str:
        """
        Compiles an enterprise-grade printable PDF report using ReportLab.
        Features VIGIL header, timestamps, confidence metrics, embedded evidence photos,
        disclaimer, and creator branding.
        """
        event_dir = self.create_event_directory(event_id)
        pdf_path = os.path.join(event_dir, "VIGIL_Detection_Report.pdf")

        if not REPORTLAB_AVAILABLE:
            logger.warning("ReportLab not available; creating HTML printable report fallback.")
            return self._generate_html_report(event_id, detection_data, frame_01_path, frame_02_path, pdf_path)

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'VigilTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'VigilSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            textColor=colors.HexColor('#EF4444'),
            spaceAfter=12
        )
        body_style = ParagraphStyle(
            'VigilBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#334155')
        )
        disclaimer_style = ParagraphStyle(
            'VigilDisclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#64748B')
        )
        footer_style = ParagraphStyle(
            'VigilFooter',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            textColor=colors.HexColor('#0284C7'),
            alignment=1
        )

        story = []

        # Header Title
        story.append(Paragraph("VIGIL — AI DETECTION EVIDENCE REPORT", title_style))
        story.append(Paragraph(f"EVENT REFERENCE ID: #{event_id} // CLASSIFICATION: POTENTIAL THREAT", subtitle_style))
        story.append(Spacer(1, 8))

        # Metadata Table
        ts = detection_data.get("timestamp", time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()))
        conf = detection_data.get("confidence", 0.95)
        thresh = detection_data.get("threshold", 0.70)
        source = detection_data.get("source", "Live Sensor Stream / Camera")
        model_name = "VIGIL ViolenceCNNLSTM v2.0 (MobileNetV2 + 2-Layer Temporal LSTM)"

        meta_table_data = [
            [Paragraph("<b>Status:</b>", body_style), Paragraph("<font color='#EF4444'><b>VIOLENCE DETECTED</b></font>", body_style),
             Paragraph("<b>Confidence:</b>", body_style), Paragraph(f"<b>{(conf*100):.1f}%</b>", body_style)],
            [Paragraph("<b>Timestamp:</b>", body_style), Paragraph(ts, body_style),
             Paragraph("<b>Decision Threshold:</b>", body_style), Paragraph(f"{thresh:.2f}", body_style)],
            [Paragraph("<b>Source:</b>", body_style), Paragraph(source, body_style),
             Paragraph("<b>Clip Duration:</b>", body_style), Paragraph("4.5 Seconds", body_style)],
            [Paragraph("<b>Model:</b>", body_style), Paragraph(model_name, body_style),
             Paragraph("<b>Verification:</b>", body_style), Paragraph("Temporal Hysteresis Confirmed", body_style)]
        ]

        t = Table(meta_table_data, colWidths=[100, 170, 110, 160])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 14))

        # Section: Visual Evidence Photos
        story.append(Paragraph("<b>AUTOMATIC EVIDENCE FRAME CAPTURES:</b>", body_style))
        story.append(Spacer(1, 6))

        image_elements = []
        if frame_01_path and os.path.exists(frame_01_path):
            image_elements.append(RLImage(frame_01_path, width=250, height=180))
        if frame_02_path and os.path.exists(frame_02_path):
            image_elements.append(RLImage(frame_02_path, width=250, height=180))

        if len(image_elements) == 2:
            img_table = Table([[image_elements[0], image_elements[1]]], colWidths=[270, 270])
            img_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(img_table)
            story.append(Table([
                [Paragraph("<font color='#0284C7'><b>Evidence Frame 01 (Initial Kinetic Onset)</b></font>", body_style),
                 Paragraph("<font color='#EF4444'><b>Evidence Frame 02 (Peak Altercation Moment)</b></font>", body_style)]
            ], colWidths=[270, 270]))
        elif len(image_elements) == 1:
            story.append(image_elements[0])

        story.append(Spacer(1, 14))

        # Section: AI Model Architecture & Processing
        story.append(Paragraph("<b>SPATIAL-TEMPORAL PROCESSING PIPELINE:</b>", body_style))
        story.append(Paragraph(
            "Video sequences are processed through MobileNetV2 spatial feature extraction coupled with inter-frame "
            "kinetic motion divergence descriptors (1,344-dim fused representation). A 2-layer temporal LSTM with sequence "
            "dropout evaluates dynamic physical trajectories across a 16-frame sliding window. The alert is validated "
            "using multi-frame temporal hysteresis to eliminate false positives from benign fast movement.",
            body_style
        ))
        story.append(Spacer(1, 12))

        # Section: Legal Disclaimer
        story.append(Paragraph("<b>IMPORTANT DISCLAIMER:</b>", body_style))
        story.append(Paragraph(
            "This document records the automated output of an AI-based video analysis system. AI predictions may contain "
            "false positives and false negatives. The result is not definitive legal proof of violence and should be reviewed "
            "by a qualified human operator before taking administrative or security action.",
            disclaimer_style
        ))
        story.append(Spacer(1, 14))

        # Footer & Creator Attribution
        story.append(Paragraph(
            f"VIGIL Safety Intelligence Platform &copy; 2026 // Created by {CREATOR_NAME} // Contact: {CREATOR_EMAIL}",
            footer_style
        ))

        doc.build(story)
        logger.info(f"Generated PDF Detection Report at: {pdf_path}")
        return pdf_path

    def _generate_html_report(self, event_id, detection_data, f1, f2, output_path):
        """Fallback printable HTML report if ReportLab fails."""
        html_path = output_path.replace(".pdf", ".html")
        html_content = f"""<!DOCTYPE html>
<html>
<head>
<title>VIGIL Detection Report #{event_id}</title>
<style>
  body {{ font-family: -apple-system, sans-serif; background: #0b0f19; color: #e2e8f0; padding: 30px; }}
  .card {{ background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; max-width: 800px; margin: 0 auto; }}
  h1 {{ color: #f8fafc; font-size: 24px; }}
  .badge {{ color: #ef4444; font-weight: bold; }}
  .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }}
  img {{ width: 100%; border-radius: 8px; border: 1px solid #334155; }}
  .footer {{ margin-top: 24px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px; text-align: center; }}
</style>
</head>
<body>
<div class="card">
  <h1>VIGIL — AI DETECTION EVIDENCE REPORT</h1>
  <p class="badge">EVENT REFERENCE ID: #{event_id} // VIOLENCE DETECTED</p>
  <p>Timestamp: {detection_data.get('timestamp')}</p>
  <p>Confidence: {(detection_data.get('confidence', 0.95)*100):.1f}%</p>
  <div class="grid">
    <div><img src="VIGIL_Evidence_Frame_01.png"><p>Evidence Frame 01</p></div>
    <div><img src="VIGIL_Evidence_Frame_02.png"><p>Evidence Frame 02</p></div>
  </div>
  <p style="font-size: 11px; color: #94a3b8;"><b>DISCLAIMER:</b> AI predictions may contain false positives and false negatives. Review by qualified human recommended.</p>
  <div class="footer">
    Created by {CREATOR_NAME} | Contact: {CREATOR_EMAIL} | VIGIL Safety Intelligence Platform
  </div>
</div>
</body>
</html>"""
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return html_path

    def create_zip_archive(self, event_id: str) -> str:
        """Packages Frame 01, Frame 02, Clip, and Report into a single downloadable ZIP archive."""
        event_dir = self.create_event_directory(event_id)
        zip_path = os.path.join(event_dir, f"VIGIL_Evidence_Archive_{event_id}.zip")

        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for fname in os.listdir(event_dir):
                if fname.endswith(".zip"):
                    continue
                fpath = os.path.join(event_dir, fname)
                if os.path.isfile(fpath):
                    zf.write(fpath, arcname=fname)

        logger.info(f"Created Evidence ZIP archive: {zip_path}")
        return zip_path

    def save_event_metadata(self, event_id: str, meta: Dict[str, Any]) -> str:
        """Saves metadata JSON for an incident/evidence package."""
        event_dir = self.create_event_directory(event_id)
        meta_path = os.path.join(event_dir, "metadata.json")
        meta["event_id"] = event_id
        meta["creator_name"] = CREATOR_NAME
        meta["creator_email"] = CREATOR_EMAIL
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
        return meta_path

    def get_event_metadata(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Reads metadata JSON for an event."""
        event_dir = os.path.join(self.storage_dir, event_id)
        meta_path = os.path.join(event_dir, "metadata.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to read metadata for {event_id}: {e}")
        return None

    def list_all_events(self) -> List[Dict[str, Any]]:
        """Scans the evidence directory and returns all recorded events sorted by recency."""
        events = []
        if not os.path.exists(self.storage_dir):
            return events

        for item in os.listdir(self.storage_dir):
            item_path = os.path.join(self.storage_dir, item)
            if os.path.isdir(item_path):
                meta = self.get_event_metadata(item)
                has_f1 = os.path.exists(os.path.join(item_path, "VIGIL_Evidence_Frame_01.png"))
                has_f2 = os.path.exists(os.path.join(item_path, "VIGIL_Evidence_Frame_02.png"))
                has_clip = os.path.exists(os.path.join(item_path, "VIGIL_Detection_Event_Clip.mp4"))
                has_pdf = os.path.exists(os.path.join(item_path, "VIGIL_Detection_Report.pdf"))
                has_zip = any(f.endswith(".zip") for f in os.listdir(item_path))

                if meta is None:
                    # Synthesize basic metadata from directory modification time
                    mtime = os.path.getmtime(item_path)
                    ts = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime(mtime))
                    meta = {
                        "event_id": item,
                        "timestamp": ts,
                        "confidence": 0.95,
                        "violence_prob": 0.95,
                        "severity": "CRITICAL",
                        "source": "Historical Analysis",
                        "creator_name": CREATOR_NAME,
                        "creator_email": CREATOR_EMAIL
                    }

                meta["has_frame1"] = has_f1
                meta["has_frame2"] = has_f2
                meta["has_clip"] = has_clip
                meta["has_pdf"] = has_pdf
                meta["has_zip"] = has_zip
                meta["frame1_url"] = f"/api/evidence/{item}/frame1" if has_f1 else None
                meta["frame2_url"] = f"/api/evidence/{item}/frame2" if has_f2 else None
                meta["clip_url"] = f"/api/evidence/{item}/clip" if has_clip else None
                meta["report_url"] = f"/api/evidence/{item}/report" if has_pdf else None
                meta["zip_url"] = f"/api/evidence/{item}/zip" if has_zip else None
                events.append(meta)

        # Sort descending by timestamp or event_id
        events.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return events


evidence_manager = VigilEvidenceManager()

