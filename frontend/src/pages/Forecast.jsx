import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CloudRain, CloudSun, CloudDrizzle, CloudLightning, Sun, Navigation, Droplets, AlertTriangle, RefreshCw } from 'lucide-react';

const iconMap = {
  CloudRain: CloudRain,
  CloudDrizzle: CloudDrizzle,
  CloudLightning: CloudLightning,
  CloudSun: CloudSun,
  Sun: Sun
};

export default function Forecast() {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://ai-powereddigitaltwin.onrender.com';
      const res = await fetch(`${apiUrl}/api/forecast/`);
      if (!res.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      const data = await res.json();
      setForecastData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to the forecast engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 animate-spin">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-200">Initializing Forecast Models...</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Running high-dimensional regional projections and downloading atmospheric boundary layers from the neural network solver.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md bg-slate-900/50 border border-red-500/30 p-8 rounded-2xl backdrop-blur-md shadow-lg shadow-red-950/10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-200">Forecast Initialization Failed</h2>
          <p className="text-red-400 text-xs leading-relaxed font-mono">
            {error}
          </p>
          <p className="text-slate-400 text-xs">
            Verify that your backend Python server is running at <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{import.meta.env.VITE_API_URL || 'https://ai-powereddigitaltwin.onrender.com'}</code>.
          </p>
          <button
            onClick={fetchForecastData}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-sm font-semibold rounded-lg border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-md active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
            <span>Retry Connection</span>
          </button>
        </div>
      </main>
    );
  }

  // Chart data matching the forecast
  const chartData = forecastData.map(item => ({
    name: item.day,
    'Predicted Rainfall': item.rainfall,
    'Temperature Max': item.tempMax,
  }));

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Climate Forecast Engine
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              7-day atmospheric projections generated via deep learning transformer models.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg">
            <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Region: Global Grid Model</span>
          </div>
        </div>

        {/* 7-Day Forecast: Horizontal Cards Stacked Vertically */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-200">7-Day Atmospheric Outlook</h2>
          <div className="space-y-3">
            {forecastData.map((item, idx) => {
              const IconComponent = iconMap[item.icon] || Sun;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/60 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-slate-950/20 backdrop-blur-sm group"
                >
                  {/* Date and Day */}
                  <div className="flex items-center space-x-4 w-full md:w-1/4">
                    <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-xl flex flex-col items-center justify-center text-xs font-semibold text-slate-300 font-mono shadow-inner group-hover:border-blue-500/20 transition-colors">
                      <span className="text-[10px] text-slate-500 uppercase">{item.day}</span>
                      <span>{item.date.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-200">{item.date}</h3>
                      <p className="text-xs text-slate-500 font-mono">ID: IN-FC-0{idx + 1}</p>
                    </div>
                  </div>

                  {/* Conditions & Icon */}
                  <div className="flex items-center space-x-3 w-full md:w-1/4 md:justify-center">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-blue-400">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-slate-400 block">Condition</span>
                      <span className="text-sm font-semibold text-slate-200">{item.condition}</span>
                    </div>
                  </div>

                  {/* Temperature Range */}
                  <div className="flex items-center space-x-3 w-full md:w-1/4 md:justify-center">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-orange-400">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-slate-400 block">Thermal Range</span>
                      <span className="text-sm font-bold font-mono">
                        {item.tempMax}°C <span className="text-slate-500 font-normal">/ {item.tempMin}°C</span>
                      </span>
                    </div>
                  </div>

                  {/* Precipitation Indicators */}
                  <div className="flex items-center space-x-3 w-full md:w-1/4 md:justify-end">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-blue-400">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 block">Precipitation</span>
                      <span className="text-sm font-bold text-blue-400 font-mono">
                        {item.rainfall} mm <span className="text-slate-500 text-xs font-normal">({item.prob})</span>
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Recharts Line Chart for Rainfall Trends */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Rainfall Prediction Trend</h2>
            <p className="text-slate-400 text-xs mt-1">Precipitation probability and accumulation curve over the forecast timeline.</p>
          </div>

          <div className="w-full h-[300px] border border-slate-950/40 rounded-xl bg-slate-950/40 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="Predicted Rainfall"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRainfall)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </main>
  );
}
