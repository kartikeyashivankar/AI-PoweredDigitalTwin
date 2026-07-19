import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Cpu, HardDrive, ArrowRight, Home, ChevronRight, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 p-6 md:p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-10 py-4">
        
        {/* Breadcrumbs / Header */}
        <div className="border-b border-slate-900 pb-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-400">About</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            System & Science Architecture
          </h1>
          <p className="text-slate-400 text-sm">
            Learn about the meteorological datasets, neural forecasting models, and twin simulator engines driving this platform.
          </p>
        </div>

        {/* 4-Column Core Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Data Sources */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-4 hover:border-slate-700/60 transition-all duration-300">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Data Sources</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              The platform utilizes high-resolution daily gridded rainfall and temperature datasets from the <strong>India Meteorological Department (IMD)</strong>.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2 font-mono list-disc list-inside">
              <li>Temporal Range: 2015 – 2025</li>
              <li>Spatial Resolution: High-res daily grid</li>
              <li>Metrics: Gridded Rainfall, Max/Min Temp</li>
            </ul>
          </div>

          {/* Card 2: Neural Forecaster */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-4 hover:border-slate-700/60 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">AI Model</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              A deep learning <strong>Long Short-Term Memory (LSTM)</strong> recurrent neural network trained on 11 years of daily national climate data.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2 font-mono list-disc list-inside">
              <li>Training Context: 11 years daily records</li>
              <li>Sequence Length: 7 days historical window</li>
              <li>Outlook: Multi-variable 7-day prediction</li>
            </ul>
          </div>

          {/* Card 3: Architecture */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-4 hover:border-slate-700/60 transition-all duration-300">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              A modern microservices system pairing a <strong>FastAPI</strong> backend for real-time predictions with a <strong>React</strong> frontend featuring an interactive map and what-if simulation.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2 font-mono list-disc list-inside">
              <li>Backend API: FastAPI (Uvicorn runtime)</li>
              <li>GIS Mapping: React (Vite) & Leaflet</li>
              <li>Simulator: Double inference what-if sandbox</li>
            </ul>
          </div>

          {/* Card 4: Future Scaling */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-4 hover:border-slate-700/60 transition-all duration-300">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Future Scaling</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Developing region-specific models and integrating multi-spectral satellite telemetry for highly localized micro-climate modeling.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2 font-mono list-disc list-inside">
              <li>Granularity: Region-specific AI models</li>
              <li>GIS Portals: ISRO Bhuvan integration</li>
              <li>Data Feeds: MOSDAC satellite integration</li>
            </ul>
          </div>

        </div>

        {/* Workflow Diagram Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold text-slate-200">Platform Data Pipeline</h2>
            <p className="text-slate-400 text-xs">End-to-end telemetry workflow from weather sensors to user control dashboards.</p>
          </div>

          {/* Flex/Grid Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2">
            
            {/* Box 1: Raw Data */}
            <div className="flex-1 w-full bg-slate-950 border border-slate-850 p-4 rounded-xl text-center space-y-2 group hover:border-blue-500/20 transition-colors shadow-inner">
              <div className="text-blue-400 text-xs font-bold font-mono">STEP 01</div>
              <h4 className="font-bold text-sm text-slate-300">IMD Gridded Data</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">Raw NetCDF rainfall datasets & binary GRD temperature matrices</p>
            </div>
            
            <ArrowRight className="w-5 h-5 text-slate-650 rotate-90 md:rotate-0 flex-shrink-0" />
            
            {/* Box 2: Preprocessing */}
            <div className="flex-1 w-full bg-slate-950 border border-slate-850 p-4 rounded-xl text-center space-y-2 group hover:border-orange-500/20 transition-colors shadow-inner">
              <div className="text-orange-400 text-xs font-bold font-mono">STEP 02</div>
              <h4 className="font-bold text-sm text-slate-300">Preprocessing</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">Xarray & NumPy calculate daily spatial averages to output clean CSVs</p>
            </div>
            
            <ArrowRight className="w-5 h-5 text-slate-650 rotate-90 md:rotate-0 flex-shrink-0" />
            
            {/* Box 3: LSTM Model */}
            <div className="flex-1 w-full bg-slate-950 border border-slate-850 p-4 rounded-xl text-center space-y-2 group hover:border-amber-500/20 transition-colors shadow-inner">
              <div className="text-amber-400 text-xs font-bold font-mono">STEP 03</div>
              <h4 className="font-bold text-sm text-slate-300">LSTM Network</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">TensorFlow loads the weights and performs sequence predictions</p>
            </div>
            
            <ArrowRight className="w-5 h-5 text-slate-650 rotate-90 md:rotate-0 flex-shrink-0" />
            
            {/* Box 4: API Gateway */}
            <div className="flex-1 w-full bg-slate-950 border border-slate-850 p-4 rounded-xl text-center space-y-2 group hover:border-emerald-500/20 transition-colors shadow-inner">
              <div className="text-emerald-400 text-xs font-bold font-mono">STEP 04</div>
              <h4 className="font-bold text-sm text-slate-300">FastAPI Router</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">Uvicorn exposes JSON endpoints serving dynamic forecasts & simulators</p>
            </div>
            
            <ArrowRight className="w-5 h-5 text-slate-650 rotate-90 md:rotate-0 flex-shrink-0" />
            
            {/* Box 5: Dashboard */}
            <div className="flex-1 w-full bg-slate-950 border border-slate-850 p-4 rounded-xl text-center space-y-2 group hover:border-pink-500/20 transition-colors shadow-inner">
              <div className="text-pink-400 text-xs font-bold font-mono">STEP 05</div>
              <h4 className="font-bold text-sm text-slate-300">GIS Dashboard</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">React processes JSON packets to render charts and interactive maps</p>
            </div>
            
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-sm font-semibold rounded-lg border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all active:scale-[0.98] shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Return to Workspace</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
