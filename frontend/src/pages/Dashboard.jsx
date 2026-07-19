import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { CloudRain, Sun, Thermometer, Droplet, AlertTriangle, Info, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [activeMetric, setActiveMetric] = useState('Rainfall'); // 'Rainfall', 'Temperature', 'Drought'
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [regionalData, setRegionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const regions = ['mumbai', 'delhi', 'chennai', 'kolkata', 'guwahati', 'bengaluru'];
      const responses = await Promise.all(
        regions.map(r =>
          fetch(`http://localhost:8000/api/dashboard/?region=${r}`).then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch region: ${r}`);
            }
            return res.json();
          })
        )
      );

      const parsedRainfall = responses.map(r => ({
        name: r.region,
        lat: r.lat,
        lng: r.lng,
        value: r.rainfall.value,
        unit: r.rainfall.unit,
        status: r.rainfall.status,
        color: r.rainfall.color
      }));

      const parsedTemperature = responses.map(r => ({
        name: r.region,
        lat: r.lat,
        lng: r.lng,
        value: r.temperature.value,
        unit: r.temperature.unit,
        status: r.temperature.status,
        color: r.temperature.color
      }));

      const parsedDrought = responses.map(r => ({
        name: r.region,
        lat: r.lat,
        lng: r.lng,
        value: r.drought.value,
        unit: r.drought.unit,
        status: r.drought.status,
        color: r.drought.color
      }));

      setRegionalData({
        Rainfall: parsedRainfall,
        Temperature: parsedTemperature,
        Drought: parsedDrought
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to the digital twin database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
          <h2 className="text-xl font-bold tracking-tight text-slate-200">Syncing Climate Twin...</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Establishing secure handshake protocols and downloading live telemetry matrices from the weather simulation nodes.
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
          <h2 className="text-xl font-bold tracking-tight text-slate-200">Twin Synchronization Failed</h2>
          <p className="text-red-400 text-xs leading-relaxed font-mono">
            {error}
          </p>
          <p className="text-slate-400 text-xs">
            Verify that your backend Python server is running locally at <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">http://localhost:8000</code>.
          </p>
          <button
            onClick={fetchDashboardData}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-855 text-sm font-semibold rounded-lg border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-md active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
            <span>Retry Connection</span>
          </button>
        </div>
      </main>
    );
  }

  const getMetricSummary = () => {
    if (!regionalData) return {};
    const data = regionalData[activeMetric] || [];
    const sum = data.reduce((acc, curr) => acc + curr.value, 0);
    const avg = data.length > 0 ? (sum / data.length) : 0;

    switch (activeMetric) {
      case 'Rainfall':
        return { avg: `${Math.round(avg)} mm`, label: 'National Average', status: 'Active Monsoon Flow', icon: CloudRain, colorClass: 'text-blue-400' };
      case 'Temperature':
        return { avg: `${avg.toFixed(1)} °C`, label: 'National Average', status: 'Localized Heatwaves', icon: Thermometer, colorClass: 'text-orange-400' };
      case 'Drought':
        return { avg: `${avg.toFixed(2)} Index`, label: 'Average Risk Factor', status: 'Water Deficits in NW', icon: AlertTriangle, colorClass: 'text-amber-400' };
      default:
        return {};
    }
  };

  const currentSummary = getMetricSummary();
  const activeData = regionalData ? regionalData[activeMetric] : [];

  const getSummaryRainfall = () => {
    if (!regionalData) return '0 mm (Avg)';
    const data = regionalData.Rainfall || [];
    const sum = data.reduce((acc, curr) => acc + curr.value, 0);
    const avg = data.length > 0 ? (sum / data.length) : 0;
    return `${Math.round(avg)} mm (Avg)`;
  };

  const getSummaryTemperature = () => {
    if (!regionalData) return '0 °C (Avg)';
    const data = regionalData.Temperature || [];
    const sum = data.reduce((acc, curr) => acc + curr.value, 0);
    const avg = data.length > 0 ? (sum / data.length) : 0;
    return `${avg.toFixed(1)} °C (Avg)`;
  };

  const summaryRainfall = getSummaryRainfall();
  const summaryTemperature = getSummaryTemperature();

  const getRegionValue = (metric, nameFragment) => {
    if (!regionalData) return { value: 0, status: '', percent: 0 };
    const item = regionalData[metric]?.find(r => r.name.toLowerCase().includes(nameFragment.toLowerCase()));
    if (!item) return { value: 0, status: '', percent: 0 };
    
    let percent = 0;
    if (metric === 'Rainfall') {
      percent = Math.min(100, Math.round((item.value / 450) * 100));
    } else if (metric === 'Temperature') {
      percent = Math.min(100, Math.round((item.value / 45) * 100));
    } else if (metric === 'Drought') {
      percent = Math.min(100, Math.round(item.value * 100));
    }

    return {
      value: item.value,
      status: item.status,
      percent
    };
  };

  const guwahatiRain = getRegionValue('Rainfall', 'Guwahati');
  const delhiRain = getRegionValue('Rainfall', 'Delhi');
  const delhiTemp = getRegionValue('Temperature', 'Delhi');
  const bengaluruTemp = getRegionValue('Temperature', 'Bengaluru');

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
                  <span className="font-bold text-blue-400">{guwahatiRain.value} mm</span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${guwahatiRain.percent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Indo-Gangetic Basin (Delhi)</span>
                  <span className="font-bold text-amber-500">{delhiRain.value} mm ({delhiRain.status})</span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${delhiRain.percent}%` }}></div>
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
                  <span className="font-bold text-orange-500">{delhiTemp.value} °C</span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${delhiTemp.percent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">South-Central Plateau (Bengaluru)</span>
                  <span className="font-bold text-emerald-400">{bengaluruTemp.value} °C ({bengaluruTemp.status})</span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${bengaluruTemp.percent}%` }}></div>
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
