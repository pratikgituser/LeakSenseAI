import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../hooks/useWebSocket';
import { AlertCircle, CheckCircle, Activity, Droplets } from 'lucide-react';

// Custom Marker Generator
const createCustomIcon = (status) => {
  let colorClass = 'bg-brand-primary shadow-[0_0_15px_rgba(0,119,182,0.5)]'; // Normal (Blue)
  let animationClass = '';

  if (status === 'CRITICAL' || status === 'HIGH') {
    colorClass = 'bg-status-leak shadow-[0_0_20px_rgba(230,57,70,0.8)]'; // Leak (Red)
    animationClass = 'animate-pulse-fast';
  } else if (status === 'PREDICTED_RISK') {
    colorClass = 'bg-status-risk shadow-[0_0_15px_rgba(255,159,28,0.6)]'; // Risk (Orange)
    animationClass = 'animate-pulse';
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="w-5 h-5 rounded-full border-2 border-white ${colorClass} ${animationClass}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export default function DigitalTwin() {
  // Connect to FastAPI Backend (Ensure your Uvicorn backend is running!)
  const { data: nodes, isConnected } = useWebSocket('ws://127.0.0.1:8000/ws/simulation');
  const [selectedCity, setSelectedCity] = useState('Mumbai'); // Default City

  // Filter nodes for the current city
  const cityNodes = nodes.filter(node => node.city === selectedCity);
  
  // Calculate system health
  const criticalNodes = cityNodes.filter(n => n.severity === 'CRITICAL' || n.severity === 'HIGH').length;
  const riskNodes = cityNodes.filter(n => n.severity === 'PREDICTED_RISK').length;

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-brand-border">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Activity className="text-brand-primary" /> Live Digital Twin
          </h2>
          <p className="text-sm text-text-muted flex items-center gap-2">
            Status: {isConnected ? <span className="text-status-safe font-bold">● LIVE DATA STREAMING</span> : <span className="text-status-leak font-bold">● OFFLINE</span>}
          </p>
        </div>
        
        {/* City Selector */}
        <select 
          className="px-4 py-2 border border-brand-border rounded-lg bg-brand-light text-text-main font-semibold outline-none focus:border-brand-primary transition-all"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="Mumbai">Mumbai</option>
          <option value="Pune">Pune</option>
          <option value="Nagpur">Nagpur</option>
          <option value="Delhi">Delhi</option>
          <option value="Amravati">Amravati</option>
        </select>
      </div>

      {/* Main Content: Map + Side Panel */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* The Leaflet Map */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden relative">
          <MapContainer 
            center={[19.0760, 72.8777]} // Default to Mumbai roughly
            zoom={12} 
            className="w-full h-full z-0"
            key={selectedCity} // Force re-render map center on city change
          >
            {/* Very clean, light-themed map tiles to fit our UI */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            
            {/* Plot IoT Nodes */}
            {cityNodes.map((node) => (
              <Marker 
                key={node.node_id} 
                position={[node.lat, node.lon]}
                icon={createCustomIcon(node.severity)}
              >
                <Popup className="rounded-xl">
                  <div className="p-1">
                    <h3 className="font-bold text-text-main border-b pb-1 mb-2">{node.node_id}</h3>
                    <p className="text-sm mb-1"><b>Pressure:</b> {node.pressure} PSI</p>
                    <p className="text-sm mb-1"><b>Flow:</b> {node.flow_rate} L/m</p>
                    <p className="text-sm mb-2"><b>Acoustics:</b> {node.vibration} Hz</p>
                    <span className={`px-2 py-1 text-xs font-bold rounded-md text-white ${
                      node.severity === 'NORMAL' ? 'bg-status-safe' : 
                      node.severity === 'PREDICTED_RISK' ? 'bg-status-risk' : 'bg-status-leak'
                    }`}>
                      AI STATUS: {node.severity}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* AI Diagnostics Side Panel */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white rounded-xl shadow-sm border border-brand-border p-4 flex flex-col gap-4 overflow-y-auto"
        >
          <h3 className="text-lg font-bold text-text-main border-b border-brand-border pb-2">AI Diagnostics</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-brand-light p-3 rounded-lg text-center border border-brand-border">
              <p className="text-3xl font-bold text-brand-primary">{cityNodes.length}</p>
              <p className="text-xs text-text-muted">Total Nodes</p>
            </div>
            <div className="bg-[#FFF0F0] p-3 rounded-lg text-center border border-[#FFE0E0]">
              <p className="text-3xl font-bold text-status-leak">{criticalNodes}</p>
              <p className="text-xs text-text-muted">Active Leaks</p>
            </div>
          </div>

          <div className="mt-2">
            <h4 className="text-sm font-semibold text-text-muted mb-2">System Alerts</h4>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {cityNodes.filter(n => n.severity !== 'NORMAL').map(node => (
                  <motion.div 
                    key={node.node_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-lg text-sm border-l-4 shadow-sm flex items-start gap-2 ${
                      node.severity === 'PREDICTED_RISK' 
                        ? 'bg-[#FFF8EC] border-status-risk text-[#9C6500]' 
                        : 'bg-[#FFF0F0] border-status-leak text-[#991B1B]'
                    }`}
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">{node.node_id}</p>
                      <p className="text-xs">
                        {node.severity === 'PREDICTED_RISK' 
                          ? `High risk of failure predicted. (${node.prediction_risk}% probability)`
                          : `Anomaly detected! Pressure dropped to ${node.pressure} PSI.`}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {/* Show Safe state if no alerts */}
                {criticalNodes === 0 && riskNodes === 0 && cityNodes.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-3 rounded-lg bg-[#E8F8F5] border-l-4 border-status-safe text-[#117A65] flex items-center gap-2 text-sm"
                  >
                    <CheckCircle size={16} />
                    <span>System operating optimally.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}