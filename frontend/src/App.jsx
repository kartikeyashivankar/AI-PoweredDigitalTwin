import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import WhatIfSimulator from './pages/WhatIfSimulator';

function HomeWithRouter() {
  const navigate = useNavigate();
  return <Home onEnterDashboard={() => navigate('/dashboard')} />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 flex flex-col justify-between">
        <Navbar />
        
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeWithRouter />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/what-if" element={<WhatIfSimulator />} />
            <Route path="/about" element={
              <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">About Section</h2>
                  <p className="text-slate-400 text-sm">
                    This submodule is currently being integrated into the Climate Digital Twin platform. Check back soon for simulated updates!
                  </p>
                  <Link to="/" className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg border border-slate-700 transition-colors">
                    Back to Home
                  </Link>
                </div>
              </main>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
