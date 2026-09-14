"""
AegisVision: Backend Startup Entrypoint
Launches the FastAPI server via Uvicorn on http://0.0.0.0:8000 with WebSocket support.
"""
import uvicorn
import os
import sys

# Ensure backend folder is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    print("==================================================================")
    print("  AEGISVISION - REAL-TIME VIOLENCE DETECTION SYSTEM (BACKEND)   ")
    print("==================================================================")
    print("  * REST API:       http://localhost:8000/docs")
    print("  * WebSocket:      ws://localhost:8000/ws/stream")
    print("  * System Health:  http://localhost:8000/api/health")
    print("==================================================================")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, app_dir=backend_dir)
