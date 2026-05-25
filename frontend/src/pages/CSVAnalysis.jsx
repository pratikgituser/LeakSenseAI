import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { UploadCloud, FileText, Activity, AlertTriangle, CheckCircle, Download, Loader2 } from 'lucide-react';

export default function CSVAnalysis() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setError('');
      setResults(null); // Reset previous results
    } else {
      setError('Please select a valid CSV file.');
      setFile(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      setError('');
      setResults(null);
    } else {
      setError('Please drop a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send to FastAPI backend
      const response = await axios.post('http://127.0.0.1:8000/api/upload/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Simulate slight delay for dramatic hackathon effect
      setTimeout(() => {
        setResults(response.data);
        setIsUploading(false);
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading file. Is the backend running?');
      setIsUploading(false);
    }
  };

  const handleDownloadReport = () => {
    // Triggers a download from the FastAPI PDF endpoint
    window.open('http://127.0.0.1:8000/api/reports/download', '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-full flex flex-col p-6 gap-6 overflow-y-auto"
    >
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <FileText className="text-brand-primary" /> Batch AI Analysis (CSV)
        </h2>
        <p className="text-sm text-text-muted">Upload historical IoT pipeline data for deep anomaly detection</p>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Column: Upload Zone */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border flex flex-col h-full">
          <h3 className="text-lg font-bold text-text-main mb-4">Data Ingestion</h3>
          
          <div 
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-300 ${
              file ? 'border-brand-primary bg-brand-light' : 'border-[#CBD5E1] hover:border-brand-accent hover:bg-[#F8FAFC]'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            
            {!file ? (
              <>
                <div className="w-16 h-16 bg-brand-light text-brand-primary rounded-full flex items-center justify-center mb-4">
                  <UploadCloud size={32} />
                </div>
                <p className="text-text-main font-bold mb-1">Click to upload or drag and drop</p>
                <p className="text-text-muted text-sm">CSV files only. Must contain pressure, flow_rate, vibration columns.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center mb-4">
                  <FileText size={32} />
                </div>
                <p className="text-brand-primary font-bold mb-1 text-lg">{file.name}</p>
                <p className="text-text-muted text-sm mb-6">{(file.size / 1024).toFixed(2)} KB</p>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  disabled={isUploading}
                  className="px-6 py-2 bg-brand-primary hover:bg-[#005f92] text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Activity size={20} />}
                  {isUploading ? 'Analyzing via AI...' : 'Run AI Diagnostics'}
                </button>
              </>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-[#FFF0F0] border border-status-leak rounded-lg flex items-center gap-2 text-status-leak text-sm font-semibold">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Results Dashboard */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border flex flex-col h-full relative overflow-hidden">
          <h3 className="text-lg font-bold text-text-main mb-4">AI Intelligence Report</h3>
          
          <div className="flex-1 flex flex-col justify-center relative z-10">
            {!results && !isUploading && (
              <div className="text-center text-text-muted flex flex-col items-center opacity-60">
                <Activity size={48} className="mb-2" />
                <p>Upload a dataset to generate insights.</p>
              </div>
            )}

            {isUploading && (
              <div className="text-center flex flex-col items-center">
                <div className="relative w-24 h-24 mb-4">
                  {/* Custom water ripple loading animation */}
                  <div className="absolute inset-0 border-4 border-brand-accent rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-0 border-4 border-brand-primary rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-brand-primary">
                    <Activity size={32} />
                  </div>
                </div>
                <p className="text-brand-primary font-bold animate-pulse">Processing Isolation Forest Engine...</p>
              </div>
            )}

            <AnimatePresence>
              {results && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between p-4 bg-brand-light rounded-xl border border-brand-border">
                    <div>
                      <p className="text-sm text-text-muted font-semibold">Overall Pipe Health</p>
                      <p className={`text-3xl font-bold ${results.pipe_health_score > 90 ? 'text-status-safe' : 'text-status-risk'}`}>
                        {results.pipe_health_score}%
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${results.pipe_health_score > 90 ? 'bg-[#E8F8F5] text-status-safe' : 'bg-[#FFF8EC] text-status-risk'}`}>
                      {results.pipe_health_score > 90 ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1]">
                      <p className="text-sm text-text-muted font-semibold">Rows Analyzed</p>
                      <p className="text-2xl font-bold text-text-main">{results.total_records_analyzed.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-[#FFF0F0] rounded-xl border border-[#FFE0E0]">
                      <p className="text-sm text-text-muted font-semibold">Anomalies Found</p>
                      <p className="text-2xl font-bold text-status-leak">{results.anomalies_detected.toLocaleString()}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleDownloadReport}
                    className="mt-4 w-full py-3 bg-white border-2 border-brand-primary text-brand-primary hover:bg-brand-light font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download size={20} /> Download Official PDF Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Decorative background logo */}
          <div className="absolute -bottom-10 -right-10 text-brand-light opacity-50 z-0">
            <FileText size={200} />
          </div>
        </div>

      </div>
    </motion.div>
  );
}