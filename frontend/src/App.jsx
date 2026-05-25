import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import DigitalTwin from './pages/DigitalTwin';
import Forecast from './pages/Forecast';
import ROI from './pages/ROI';
import CSVAnalysis from './pages/CSVAnalysis';

function App() {
  return (
    <BrowserRouter>
      <div className="flex w-full min-h-screen bg-brand-light">
        <Sidebar />
        <div className="flex-1 ml-64 bg-brand-light min-h-screen p-4">
          <div className="bg-brand-bg rounded-2xl shadow-sm border border-brand-border h-[calc(100vh-2rem)] overflow-hidden relative">
            <Routes>
              <Route path="/" element={<DigitalTwin />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/roi" element={<ROI />} />
              <Route path="/csv-analysis" element={<CSVAnalysis />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;