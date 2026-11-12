import sys
import os

# Add workspace root so backend modules resolve properly
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

import uvicorn
from backend.main import app

if __name__ == "__main__":
    port = int(os.environ.get("BACKEND_PORT", 8005))
    print(f"Starting ScholarFind FastAPI backend on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
