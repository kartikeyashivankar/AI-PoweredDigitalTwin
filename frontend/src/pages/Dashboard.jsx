import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CloudRain, Sun, Thermometer, Droplet, AlertTriangle, Info } from 'lucide-react';

export default function Dashboard() {
  const [activeMetric, setActiveMetric] = useState('Rainfall'); // 'Rainfall', 'Temperature', 'Drought'
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Region climate data for the Digital Twin
  const regionalData = {
    Rainfall: [
      { name: 'Mumbai (West)', lat: 19.0760, lng: 72.8777, value: 340, unit: 'mm', status: 'Excessive', color: '#38bdf8' },
      { name: 'Delhi (North)', lat: 28.6139, lng: 77.2090, value: 95, unit: 'mm', status: 'Deficit', color: '#fb923c' },
      { name: 'Chennai (South)', lat: 13.0827, lng: 80.2707, value: 140, unit: 'mm', status: 'Normal', color: '#34d399' },
      { name: 'Kolkata (East)', lat: 22.5726, lng: 88.3639, value: 210, unit: 'mm', status: 'Normal', color: '#34d399' },
      { name: 'Guwahati (North-East)', lat: 26.1445, lng: 91.7362, value: 410, unit: 'mm', status: 'Excessive', color: '#38bdf8' },
      { name: 'Bengaluru (South-Central)', lat: 12.9716, lng: 77.5946, value: 115, unit: 'mm', status: 'Normal', color: '#34d399' },
    ],
    Temperature: [
      { name: 'Mumbai (West)', lat: 19.0760, lng: 72.8777, value: 29.8, unit: '°C', status: 'Nominal', color: '#34d399' },
      { name: 'Delhi (North)', lat: 28.6139, lng: 77.2090, value: 41.2, unit: '°C', status: 'Heatwave Warning', color: '#ef4444' },
      { name: 'Chennai (South)', lat: 13.0827, lng: 80.2707, value: 34.5, unit: '°C', status: 'High', color: '#f97316' },
      { name: 'Kolkata (East)', lat: 22.5726, lng: 88.3639, value: 33.1, unit: '°C', status: 'High', color: '#f97316' },
      { name: 'Guwahati (North-East)', lat: 26.1445, lng: 91.7362, value: 28.4, unit: '°C', status: 'Nominal', color: '#34d399' },
      { name: 'Bengaluru (South-Central)', lat: 12.9716, lng: 77.5946, value: 27.5, unit: '°C', status: 'Nominal', color: '#34d399' },
    ],
    Drought: [
      { name: 'Mumbai (West)', lat: 19.0760, lng: 72.8777, value: 0.12, unit: 'D-Index', status: 'No Drought', color: '#34d399' },
      { name: 'Delhi (North)', lat: 28.6139, lng: 77.2090, value: 0.68, unit: 'D-Index', status: 'Moderate', color: '#fb923c' },
      { name: 'Chennai (South)', lat: 13.0827, lng: 80.2707, value: 0.45, unit: 'D-Index', status: 'Mild', color: '#facc15' },
      { name: 'Kolkata (East)', lat: 22.5726, lng: 88.3639, value: 0.22, unit: 'D-Index', status: 'No Drought', color: '#34d399' },
      { name: 'Guwahati (North-East)', lat: 26.1445, lng: 91.7362, value: 0.05, unit: 'D-Index', status: 'No Drought', color: '#34d399' },
      { name: 'Bengaluru (South-Central)', lat: 12.9716, lng: 77.5946, value: 0.52, unit: 'D-Index', status: 'Mild', color: '#facc15' },
    ],
  };

  const getMetricSummary = () => {
    switch (activeMetric) {
      case 'Rainfall':
        return { avg: '218 mm', label: 'National Average', status: 'Active Monsoon Flow', icon: CloudRain, colorClass: 'text-blue-400' };
      case 'Temperature':
        return { avg: '32.4 °C', label: 'National Average', status: 'Localized Heatwaves', icon: Thermometer, colorClass: 'text-orange-400' };
      case 'Drought':
        return { avg: '0.34 Index', label: 'Average Risk Factor', status: 'Water Deficits in NW', icon: AlertTriangle, colorClass: 'text-amber-400' };
      default:
        return {};
    }
  };

  const currentSummary = getMetricSummary();
  const activeData = regionalData[activeMetric];

  // Specific current values for quick-view right cards
  const summaryRainfall = '218 mm (Avg)';
  const summaryTemperature = '32.4 °C (Avg)';

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Climate Control Room
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Twin workspace monitoring weather patterns, precipitation, and thermal grids across the Indian subcontinent.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Sensor Stream Online</span>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Leaflet Map Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-md overflow-hidden relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>Subcontinent Simulation Grid</span>
                </h2>
                <div className="text-xs text-slate-400 font-mono">
                  GIS Layer: CartoDB Dark Matter
                </div>
              </div>

              {/* Leaflet Map */}
              <div className="w-full h-[350px] md:h-[450px] rounded-xl overflow-hidden border border-slate-850 relative z-10 shadow-inner">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  
                  {activeData.map((region, idx) => (
                    <CircleMarker
                      key={idx}
                      center={[region.lat, region.lng]}
                      radius={activeMetric === 'Rainfall' ? Math.max(8, region.value / 25) : activeMetric === 'Temperature' ? Math.max(8, region.value / 2.5) : Math.max(8, region.value * 25)}
                      fillColor={region.color}
                      color="#ffffff"
                      weight={1.5}
                      fillOpacity={0.6}
                      eventHandlers={{
                        mouseover: () => setHoveredRegion(region),
                        mouseout: () => setHoveredRegion(null),
                        click: () => setHoveredRegion(region),
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="text-slate-950 font-sans p-1">
                          <h4 className="font-bold text-sm border-b pb-1 mb-1">{region.name}</h4>
                          <div className="text-xs space-y-1">
                            <p><strong>{activeMetric}:</strong> {region.value} {region.unit}</p>
                            <p><strong>Status:</strong> <span className="font-semibold">{region.status}</span></p>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              {/* Metric Toggle Buttons below Map */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                  {['Rainfall', 'Temperature', 'Drought'].map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setActiveMetric(metric)}
                      className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeMetric === metric
                          ? metric === 'Rainfall'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : metric === 'Temperature'
                            ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                            : 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                      }`}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
                
                {/* Micro info tag */}
                <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-950/40 border border-slate-850 px-3 py-1.5 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Click circle nodes to examine regional detail popups</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Climate Metrics & Monitoring Cards */}
          <div className="space-y-6">
            
            {/* Live Parameter Summary Header */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${currentSummary.colorClass}`}>
                  <currentSummary.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{currentSummary.label}</span>
                  <div className="text-2xl font-extrabold">{currentSummary.avg}</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between text-xs text-slate-400">
                <span>System Status:</span>
                <span className="font-semibold text-slate-200">{currentSummary.status}</span>
              </div>
            </div>

            {/* Metric Card 1: Rainfall */}
            <div className={`bg-slate-900/50 border rounded-2xl p-6 transition-all duration-300 ${
              activeMetric === 'Rainfall' ? 'border-blue-500/50 shadow-lg shadow-blue-500/5' : 'border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <CloudRain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Monsoonal Rainfall</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Precipitation Accumulation</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  activeMetric === 'Rainfall' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-950 text-slate-400'
                }`}>
                  {summaryRainfall}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">West Coast Core (Guwahati/Guang)</span>
                  <span className="font-bold text-blue-400">410 mm</span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-[90%]"></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Indo-Gangetic Basin (Delhi)</span>
                  <span className="font-bold text-amber-500">95 mm (Deficit)</span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[23%]"></div>
                </div>
              </div>
            </div>

            {/* Metric Card 2: Temperature */}
            <div className={`bg-slate-900/50 border rounded-2xl p-6 transition-all duration-300 ${
              activeMetric === 'Temperature' ? 'border-orange-500/50 shadow-lg shadow-orange-500/5' : 'border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Surface Temperature</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Thermal Mapping Sensors</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  activeMetric === 'Temperature' ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-950 text-slate-400'
                }`}>
                  {summaryTemperature}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">North Region (Delhi Heatwave)</span>
                  <span className="font-bold text-orange-500">41.2 °C</span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full w-[95%]"></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">South-Central Plateau (Bengaluru)</span>
                  <span className="font-bold text-emerald-400">27.5 °C (Nominal)</span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full w-[55%]"></div>
                </div>
              </div>
            </div>

            {/* Quick Regional Indicator details panel */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="font-bold text-sm text-slate-200">Active Sensor Node Info</div>
              {hoveredRegion ? (
                <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-850 animate-fadeIn">
                  <div className="flex justify-between font-semibold border-b border-slate-800 pb-1.5 text-blue-400 text-[13px]">
                    <span>{hoveredRegion.name}</span>
                    <span>Active Node</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parameter reading:</span>
                    <span className="font-bold text-slate-200">{hoveredRegion.value} {hoveredRegion.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Anomaly Index:</span>
                    <span className="font-bold text-slate-200">{hoveredRegion.status}</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 py-3 text-center bg-slate-950/40 rounded-xl border border-slate-850 border-dashed">
                  Hover over map nodes to stream telemetry logs.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
