"""
Test FastAPI WebSocket endpoint /ws/stream using Starlette/FastAPI TestClient
"""
import os
import sys
import json
import base64
import numpy as np
import cv2

sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app

def make_test_frame_uri():
    img = np.zeros((240, 320, 3), dtype=np.uint8)
    img[50:150, 50:150] = [0, 255, 120]
    _, buffer = cv2.imencode('.jpg', img)
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

def test_fastapi_server():
    print(">>> Testing FastAPI TestClient...")
    client = TestClient(app)

    # 1. Test Root
    res = client.get("/")
    assert res.status_code == 200
    print("Root response:", res.json())

    # 2. Test Health
    health = client.get("/api/health")
    assert health.status_code == 200
    print("Health response:", health.json())

    # 3. Test Incidents API
    incidents = client.get("/api/incidents")
    assert incidents.status_code == 200
    print("Incidents response:", incidents.json())

    # 4. Test Simulated Threat Trigger
    test_alert = client.post("/api/test-alert")
    assert test_alert.status_code == 200
    print("Test alert response:", test_alert.json())

    # 5. Test WebSocket Streaming
    print(">>> Testing WebSocket /ws/stream...")
    frame_uri = make_test_frame_uri()
    with client.websocket_connect("/ws/stream") as ws:
        for i in range(5):
            payload = {
                "frame": frame_uri,
                "timestamp": 1000.0 + i,
                "threshold": 0.70
            }
            ws.send_text(json.dumps(payload))
            msg = ws.receive_json()
            print(f"WS response frame {i}: prediction={msg['prediction']}, prob={msg['violence_prob']}, is_alert={msg['is_alert']}")
            assert "prediction" in msg
            assert "violence_prob" in msg
            assert "is_alert" in msg

    print("\n>>> FASTAPI AND WEBSOCKET ENDPOINT TESTS PASSED! <<<\n")

if __name__ == "__main__":
    test_fastapi_server()
