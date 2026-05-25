import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from collections import deque
from typing import Dict, List, Tuple

class LeakSenseAI:
    def __init__(self):
        # 1. Anomaly Detection Model
        self.iso_forest = IsolationForest(
            n_estimators=100, 
            contamination=0.05, # Expecting 5% of data to be anomalous
            random_state=42
        )
        self.is_trained = False
        
        # 2. Predictive Engine Memory (Sliding Window of last 20 ticks per node)
        # Structure: { "MUM-N1": deque([pressure1, pressure2...], maxlen=20) }
        self.node_history: Dict[str, deque] = {}

    def train_baseline(self, baseline_data: List[Dict]):
        """Trains the AI on 'Normal' simulated data at startup."""
        df = pd.DataFrame(baseline_data)
        features = df[['pressure', 'flow_rate', 'vibration']].values
        self.iso_forest.fit(features)
        self.is_trained = True
        print("🟢 AI Model Trained on Baseline Physics.")

    def analyze_telemetry(self, telemetry: Dict) -> Tuple[bool, str, float]:
        """
        Takes a single node's telemetry tick and runs dual-AI analysis.
        Returns: (Is_Anomaly, Severity, Prediction_Risk_Percentage)
        """
        if not self.is_trained:
            return False, "NORMAL", 0.0

        node_id = telemetry["node_id"]
        pressure = telemetry["pressure"]
        features = np.array([[pressure, telemetry["flow_rate"], telemetry["vibration"]]])

        # -- AI LAYER 1: ISOLATION FOREST (Instant Anomaly) --
        # Returns -1 for outliers, 1 for inliers.
        prediction = self.iso_forest.predict(features)[0]
        anomaly_score = self.iso_forest.score_samples(features)[0] 
        
        is_anomaly = prediction == -1
        severity = "NORMAL"

        if is_anomaly:
            if anomaly_score < -0.65:
                severity = "CRITICAL" # Pipe burst
            elif anomaly_score < -0.55:
                severity = "HIGH"
            else:
                severity = "MEDIUM"

        # -- AI LAYER 2: PREDICTIVE RISK (Time-Series Degradation) --
        if node_id not in self.node_history:
            self.node_history[node_id] = deque(maxlen=20)
        self.node_history[node_id].append(pressure)

        risk_percentage = 0.0
        # Need at least 10 ticks to calculate a trend slope
        if len(self.node_history[node_id]) > 10:
            y = list(self.node_history[node_id])
            x = list(range(len(y)))
            # Simple Linear Regression (Slope)
            slope, intercept = np.polyfit(x, y, 1)
            
            # If pressure is trending downwards consistently (Pre-Fail state)
            if slope < -0.1:
                # Calculate how severe the drop is out of 100%
                risk_percentage = min(abs(slope) * 200, 99.0)
                if not is_anomaly and risk_percentage > 70.0:
                    severity = "PREDICTED_RISK"

        return is_anomaly, severity, round(risk_percentage, 2)

# Global singleton AI Engine
ai_engine = LeakSenseAI()