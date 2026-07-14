import React from 'react';
import { CloudSun, Sliders, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Home({ onEnterDashboard }) {
  const features = [
    {
      title: 'Advanced Forecasting',
      description: 'Predict weather anomalies, monsoon behaviors, and localized surface temperature dynamics with transformer-based deep learning models.',
      icon: CloudSun,
      gradient: 'from-blue-400 to-sky-400',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    },
    {
      title: 'What-If Simulations',
      description: 'Interact with variables like carbon emissions, forest cover percentages, and aerosol optical depth to simulate multi-decade climate trajectories.',
      icon: Sliders,
      gradient: 'from-orange-400 to-amber-400',
      iconBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
    },
    {
      title: 'Disaster Early Warning',
      description: 'Receive real-time alerts for impending flash floods, heavy cyclones, and heatwaves using regional telemetry streams and sensor networks.',
      icon: AlertTriangle,
      gradient: 'from-red-500 to-orange-500',
      iconBg: 'bg-red-500/10 text-red-400 border border-red-500/20'
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-73px)] flex flex-col justify-center relative overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '12s' }}></div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center space-y-16">
        
        {/* Hero Section */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span>🇮🇳 India Meteorological Dataset Integrations Active</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            AI-Powered Digital Twin of{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-orange-400 bg-clip-text text-transparent">
              India's Climate
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A high-fidelity simulation and predictive engine modeled to study weather shifts, resource sustainability, and regional ecosystem hazards.
          </p>
          
          <div className="pt-6">
            <button
              onClick={onEnterDashboard}
              className="group inline-flex items-center space-x-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-orange-600 hover:from-blue-500 hover:via-sky-400 hover:to-orange-500 text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/60 p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950 backdrop-blur-sm group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${feature.iconBg} group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className={`text-xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-3`}>
                  {feature.title}
                </h3>
                
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
