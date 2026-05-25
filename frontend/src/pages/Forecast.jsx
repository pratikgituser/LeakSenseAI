import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { TrendingDown, ShieldAlert, Clock, Activity } from 'lucide-react';

// Mock Data simulating AI Time-Series Forecasting
const generateForecastData = () => {
  const data = [];
  let currentPressure = 60;
  let probability = 5;

  // Historical Data (Past 12 hours)
  for (let i = -12; i <= 0; i++) {
    currentPressure += (Math.random() - 0.6); // Slight downward trend
    data.push({
      time: i === 0 ? 'Now' : `${Math.abs(i)}h ago`,
      actualPressure: parseFloat(currentPressure.toFixed(2)),
      predictedPressure: null,
      riskProbability: probability
    });
  }

  // Predicted Data (Next 24 hours - demonstrating Pre-Fail state)
  for (let i = 1; i <= 24; i++) {
    currentPressure -= (Math.random() * 0.8 + 0.2); // Accelerating decay
    probability += (Math.random() * 5 + 2); // Risk goes up
    
    data.push({
      time: `+${i}h`,
      actualPressure: null,
      predictedPressure: parseFloat(currentPressure.toFixed(2)),
      riskProbability: Math.min(parseFloat(probability.toFixed(2)), 100)
    });
  }
  return data;
};

const forecastData = generateForecastData();

export default function Forecast() {
  const [selectedNode, setSelectedNode] = useState('MUM-N1');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-full flex flex-col p-6 gap-6 overflow-y-auto"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <TrendingDown className="text-brand-primary" /> AI Predictive Maintenance
          </h2>
          <p className="text-sm text-text-muted">Time-series anomaly forecasting and lifespan estimation</p>
        </div>
        <select 
          className="px-4 py-2 border border-brand-border rounded-lg bg-white text-text-main font-semibold shadow-sm outline-none focus:border-brand-primary"
          value={selectedNode}
          onChange={(e) => setSelectedNode(e.target.value)}
        >
          <option value="MUM-N1">MUM-N1 (High Risk)</option>
          <option value="PUN-N3">PUN-N3 (Stable)</option>
          <option value="DEL-N2">DEL-N2 (Monitoring)</option>
        </select>
      </div>

      {/* Top AI Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-brand-light rounded-lg text-brand-primary">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold">Pipe Health Index</p>
            <p className="text-2xl font-bold text-text-main">42 / 100 <span className="text-sm text-status-leak ml-1">↓</span></p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-status-risk flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-status-risk"></div>
          <div className="p-3 bg-[#FFF8EC] rounded-lg text-status-risk">
            <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold">Failure Probability</p>
            <p className="text-2xl font-bold text-status-risk">87.5%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-brand-light rounded-lg text-brand-primary">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold">Remaining Useful Life (RUL)</p>
            <p className="text-2xl font-bold text-text-main">~ 18 Hours</p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[400px]">
        
        {/* Chart 1: Pressure Degradation Forecast */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-border flex flex-col">
          <h3 className="text-lg font-bold text-text-main mb-4">Pressure Degradation Trajectory (PSI)</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FF" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#4A6FA5', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#4A6FA5', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <ReferenceLine x="Now" stroke="#023E8A" strokeDasharray="3 3" label={{ position: 'top', value: 'CURRENT TIME', fill: '#023E8A', fontSize: 10 }} />
                <ReferenceLine y={45} stroke="#E63946" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'CRITICAL THRESHOLD', fill: '#E63946', fontSize: 10 }} />
                
                {/* Solid blue line for historical data */}
                <Line type="monotone" dataKey="actualPressure" stroke="#0077B6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Historical Pressure" />
                
                {/* Dashed orange line for predicted future data */}
                <Line type="monotone" dataKey="predictedPressure" stroke="#FF9F1C" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Predicted Path" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Failure Probability Heatmap */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-border flex flex-col">
          <h3 className="text-lg font-bold text-text-main mb-4">AI Failure Probability Risk (%)</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E63946" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E63946" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FF" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#4A6FA5', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#4A6FA5', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <ReferenceLine x="Now" stroke="#023E8A" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="riskProbability" stroke="#E63946" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" name="Failure Probability" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
}