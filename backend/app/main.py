from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.simulation import sim_engine
import asyncio
import json
from app.database.session import engine, Base, SessionLocal
from app.database.models import LeakEvent, NodeRecord
from app.core.ai_models import ai_engine
from app.api.endpoints import router as api_router

app = FastAPI(
    title="LeakSense AI Backend",
    description="Smart City Water Infrastructure Digital Twin API",
    version="1.0.0"
)

# Crucial for local frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to specific Vite port in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass # Handle dead connections gracefully

manager = ConnectionManager()

app.include_router(api_router, prefix="/api", tags=["API Endpoints"])
@app.get("/")
def read_root():
    return {"status": "LeakSense AI Core Online", "theme": "White & Blue Ready"}

@app.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):
    """
    Real-time streaming endpoint. Pushes IoT data every 1 second.
    """
    await manager.connect(websocket)
    try:
        while True:
            # 1. Fetch current simulated physics state
            current_state = sim_engine.get_state()
            
            # (In Step 9, we will pass this state through the AI Model here)
            
            # 2. Broadcast to React Frontend
            await manager.broadcast(json.dumps({
                "type": "SIMULATION_TICK",
                "data": current_state
            }))
            
            # Stream at 1Hz
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Frontend Dashboard Disconnected")

# Endpoint to trigger hackathon demo leaks
@app.post("/api/demo/trigger-leak/{node_id}")
async def trigger_leak(node_id: str, type: str = "LEAK"):
    success = sim_engine.trigger_anomaly(node_id, type)
    if success:
        return {"message": f"Anomaly {type} triggered on {node_id}"}
    return {"error": "Node not found"}, 404