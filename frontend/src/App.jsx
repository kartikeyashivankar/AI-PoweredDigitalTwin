import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import WhatIfSimulator from './pages/WhatIfSimulator';
import About from './pages/About';

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
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
