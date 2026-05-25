import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { IndianRupee, Droplets, Leaf, TrendingUp, Calculator } from 'lucide-react';

// Mock Data for City-wise ROI
const cityRoiData = [
  { name: 'Mumbai', savings: 850000, cost: 150000 },
  { name: 'Pune', savings: 420000, cost: 90000 },
  { name: 'Nagpur', savings: 380000, cost: 85000 },
  { name: 'Delhi', savings: 950000, cost: 200000 },
  { name: 'Amravati', savings: 210000, cost: 50000 },
];

// Mock Data for Cumulative Yearly Savings
const monthlyTrendData = [
  { month: 'Jan', cumulative: 100000 },
  { month: 'Feb', cumulative: 350000 },
  { month: 'Mar', cumulative: 750000 },
  { month: 'Apr', cumulative: 1200000 },
  { month: 'May', cumulative: 1850000 },
  { month: 'Jun', cumulative: 2810000 }, // Current Month
];

// Animation variants for staggered card loading
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ROI() {
  // Interactive Calculator State
  const [burstsPrevented, setBurstsPrevented] = useState(15);
  const [costPerBurst, setCostPerBurst] = useState(75000);
  
  const estimatedSavings = burstsPrevented * costPerBurst;
  const roiPercentage = ((estimatedSavings - 500000) / 500000) * 100; // Assuming 5L base system cost

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-full flex flex-col p-6 gap-6 overflow-y-auto"
    >
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <IndianRupee className="text-brand-primary" /> Financial ROI & Impact
        </h2>
        <p className="text-sm text-text-muted">Economic savings and sustainability metrics driven by AI predictions</p>
      </div>

      {/* Top Impact Metric Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants} className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-[#E8F8F5] rounded-lg text-status-safe">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold">Total Est. Savings</p>
            <p className="text-2xl font-bold text-text-main">₹ 28.1 L</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-brand-light rounded-lg text-brand-primary">
            <Droplets size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold">Water Loss Prevented</p>
            <p className="text-2xl font-bold text-text-main">4.2M Liters</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-[#FFF8EC] rounded-lg text-status-risk">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold">Maintenance ROI</p>
            <p className="text-2xl font-bold text-text-main">+ 462 %</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-4 rounded-xl shadow-sm border border-brand-border flex items-center gap-4">
          <div className="p-3 bg-[#E8F8F5] rounded-lg text-status-safe">
            <Leaf size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold">CO2 Emission Cut</p>
            <p className="text-2xl font-bold text-text-main">1,840 kg</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Area: Charts & Calculator */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[400px]">
        
        {/* Left Column: City ROI Bar Chart */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-brand-border flex flex-col">
          <h3 className="text-lg font-bold text-text-main mb-4">City-wise: Smart Infrastructure vs Savings (₹)</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityRoiData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FF" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4A6FA5', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4A6FA5', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 100000}L`} />
                <Tooltip 
                  cursor={{ fill: '#F4FAFF' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E0F2FF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => `₹ ${value.toLocaleString()}`}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#023E8A' }} />
                <Bar dataKey="savings" name="Predicted Savings Prevented" fill="#0077B6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Maintenance Cost Incurred" fill="#00B4D8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Interactive ROI Calculator */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-border flex flex-col relative overflow-hidden">
          {/* Decorative background wave element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-light rounded-full blur-3xl opacity-50 z-0"></div>
          
          <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2 relative z-10">
            <Calculator className="text-brand-primary" size={20} /> Live ROI Calculator
          </h3>
          
          <div className="flex-1 flex flex-col gap-6 relative z-10">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-muted flex justify-between">
                <span>Critical Bursts Prevented (Yearly)</span>
                <span className="text-brand-primary font-bold">{burstsPrevented}</span>
              </label>
              <input 
                type="range" min="1" max="50" 
                value={burstsPrevented} 
                onChange={(e) => setBurstsPrevented(Number(e.target.value))}
                className="w-full h-2 bg-brand-light rounded-lg appearance-none cursor-pointer accent-brand-primary" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-muted flex justify-between">
                <span>Avg. Cost per Pipe Failure (₹)</span>
                <span className="text-brand-primary font-bold">₹ {costPerBurst.toLocaleString()}</span>
              </label>
              <input 
                type="range" min="10000" max="200000" step="5000"
                value={costPerBurst} 
                onChange={(e) => setCostPerBurst(Number(e.target.value))}
                className="w-full h-2 bg-brand-light rounded-lg appearance-none cursor-pointer accent-brand-primary" 
              />
            </div>

            <div className="mt-auto bg-brand-light p-4 rounded-xl border border-brand-border">
              <p className="text-sm text-text-muted text-center mb-1">Estimated Annual Savings</p>
              <p className="text-3xl font-bold text-text-main text-center mb-2">
                ₹ {(estimatedSavings / 100000).toFixed(2)} Lakhs
              </p>
              
              <div className="w-full bg-white rounded-full h-2 mb-1 overflow-hidden">
                <div className="bg-status-safe h-2 rounded-full" style={{ width: `${Math.min(roiPercentage, 100)}%` }}></div>
              </div>
              <p className="text-xs text-center text-status-safe font-bold">ROI: +{roiPercentage.toFixed(0)}% within 12 months</p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}