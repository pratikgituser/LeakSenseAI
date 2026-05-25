import random
import math
import time
from typing import List, Dict

# Pre-defined Smart City Grid
CITIES = [
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "base_pressure": 60.0},
    {"name": "Pune", "lat": 18.5204, "lon": 73.8567, "base_pressure": 55.0},
    {"name": "Nagpur", "lat": 21.1458, "lon": 79.0882, "base_pressure": 58.0},
    {"name": "Delhi", "lat": 28.7041, "lon": 77.1025, "base_pressure": 65.0},
    {"name": "Amravati", "lat": 20.9320, "lon": 77.7523, "base_pressure": 50.0}
]

class Node:
    def __init__(self, node_id: int, city_name: str, lat: float, lon: float, base_pressure: float):
        self.node_id = f"{city_name[:3].upper()}-N{node_id}"
        self.city_name = city_name
        self.lat = lat + random.uniform(-0.01, 0.01) # ~1km radius scatter
        self.lon = lon + random.uniform(-0.01, 0.01)
        self.base_pressure = base_pressure
        self.status = "NORMAL" # NORMAL, PRE-FAIL, LEAK
        self.tick_count = 0

    def generate_telemetry(self) -> Dict:
        self.tick_count += 1
        
        # Physics Engine: Sine wave for natural fluctuation + random noise
        pressure = self.base_pressure + math.sin(self.tick_count * 0.1) * 2 + random.uniform(-1, 1)
        flow_rate = 100.0 + math.cos(self.tick_count * 0.1) * 5 + random.uniform(-2, 2)
        vibration = random.uniform(1.0, 5.0) # Normal low vibration (Hz)
        temperature = 25.0 + random.uniform(-0.5, 0.5)

        # Fault Injection Logic
        if self.status == "LEAK":
            pressure *= random.uniform(0.6, 0.8) # Sudden pressure drop
            flow_rate *= random.uniform(1.5, 2.0) # Massive flow spike (burst)
            vibration = random.uniform(50.0, 100.0) # High acoustic noise
        elif self.status == "PRE-FAIL":
            # Simulating degradation over time (Predictive indicator)
            pressure -= (self.tick_count % 10) * 0.5
            vibration += random.uniform(10.0, 20.0)

        return {
            "node_id": self.node_id,
            "city": self.city_name,
            "lat": self.lat,
            "lon": self.lon,
            "pressure": round(pressure, 2),
            "flow_rate": round(flow_rate, 2),
            "vibration": round(vibration, 2),
            "temperature": round(temperature, 2),
            "status": self.status,
            "timestamp": time.time()
        }

class CitySimulation:
    def __init__(self):
        self.nodes: List[Node] = []
        self._initialize_grid()

    def _initialize_grid(self):
        # Generate 5 nodes per city
        node_counter = 1
        for city in CITIES:
            for _ in range(5):
                self.nodes.append(Node(
                    node_counter, city["name"], city["lat"], city["lon"], city["base_pressure"]
                ))
                node_counter += 1

    def trigger_anomaly(self, node_id: str, anomaly_type: str):
        """Allows the frontend/API to manually inject a hackathon demo leak"""
        for node in self.nodes:
            if node.node_id == node_id:
                node.status = anomaly_type # "LEAK" or "PRE-FAIL"
                return True
        return False

    def get_state(self) -> List[Dict]:
        return [node.generate_telemetry() for node in self.nodes]

# Global singleton for the app
sim_engine = CitySimulation()