import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, TrendingUp, DollarSign, Database, FileText, Droplets } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Digital Twin', icon: <Activity size={20} /> },
  { path: '/forecast', label: 'AI Forecast', icon: <TrendingUp size={20} /> },
  { path: '/roi', label: 'ROI Analytics', icon: <DollarSign size={20} /> },
  { path: '/csv-analysis', label: 'CSV Analysis', icon: <FileText size={20} /> },
];

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-brand-bg border-r border-brand-border flex flex-col shadow-sm fixed top-0 left-0">
      <div className="h-20 flex items-center gap-3 px-6 border-b border-brand-border">
        <Droplets className="text-brand-primary" size={28} />
        <h1 className="text-xl font-bold text-text-main">LeakSense AI</h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-md' 
                  : 'text-text-muted hover:bg-brand-light hover:text-brand-primary'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}