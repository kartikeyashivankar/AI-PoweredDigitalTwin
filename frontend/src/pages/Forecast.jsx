import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CloudRain, CloudSun, CloudDrizzle, CloudLightning, Sun, Navigation, Droplets } from 'lucide-react';

export default function Forecast() {
  // Mock 7-day forecast datasets
  const forecastData = [
    { day: 'Wed', date: 'Jul 15', tempMax: 33, tempMin: 27, rainfall: 45, prob: '90%', icon: CloudRain, condition: 'Heavy Showers' },
    { day: 'Thu', date: 'Jul 16', tempMax: 34, tempMin: 28, rainfall: 32, prob: '75%', icon: CloudDrizzle, condition: 'Light Rain' },
    { day: 'Fri', date: 'Jul 17', tempMax: 31, tempMin: 26, rainfall: 65, prob: '95%', icon: CloudLightning, condition: 'Thunderstorm' },
    { day: 'Sat', date: 'Jul 18', tempMax: 32, tempMin: 27, rainfall: 15, prob: '40%', icon: CloudSun, condition: 'Scattered Clouds' },
    { day: 'Sun', date: 'Jul 19', tempMax: 35, tempMin: 29, rainfall: 5, prob: '10%', icon: Sun, condition: 'Clear Sky' },
    { day: 'Mon', date: 'Jul 20', tempMax: 34, tempMin: 28, rainfall: 22, prob: '60%', icon: CloudDrizzle, condition: 'Showers' },
    { day: 'Tue', date: 'Jul 21', tempMax: 33, tempMin: 27, rainfall: 55, prob: '85%', icon: CloudRain, condition: 'Moderate Rain' },
  ];

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
              const IconComponent = item.icon;
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
