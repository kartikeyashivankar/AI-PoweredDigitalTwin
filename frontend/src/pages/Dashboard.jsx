import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CloudRain, Sun, Thermometer, AlertTriangle, Info, RefreshCw, Search, MapPin, X, Loader2, Compass } from 'lucide-react';

// Custom Leaflet pin icon for selected interactive locations
const customPinIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `<div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
    <span class="absolute w-7 h-7 rounded-full bg-blue-500/40 animate-ping"></span>
    <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

// WMO Weather interpretation codes (WW) fallback dictionary
const WMO_WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

const getWmoCondition = (code) => WMO_WEATHER_CODES[code] || "Clear";

// Sub-component for handling map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Sub-component for animated camera flyTo
function MapFlyToController({ flyToTarget }) {
  const map = useMap();
  useEffect(() => {
    if (flyToTarget) {
      map.flyTo([flyToTarget.lat, flyToTarget.lng], flyToTarget.zoom || 9, {
        duration: 1.5
      });
    }
  }, [flyToTarget, map]);
  return null;
}

// Popular Indian Cities pre-indexed dictionary for instant zero-latency positioning
const POPULAR_INDIAN_CITIES = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi NCR' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362, state: 'Assam' },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, state: 'Punjab' },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  { name: 'Patna', lat: 25.5941, lng: 85.1376, state: 'Bihar' },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  { name: 'Shimla', lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh' },
  { name: 'Srinagar', lat: 34.0837, lng: 74.7973, state: 'Jammu & Kashmir' },
  { name: 'Panaji', lat: 15.4909, lng: 73.8278, state: 'Goa' },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  { name: 'Dehradun', lat: 30.3165, lng: 78.0322, state: 'Uttarakhand' }
];

export default function Dashboard() {
  const [activeMetric, setActiveMetric] = useState('Rainfall'); // 'Rainfall', 'Temperature', 'Drought'
  const [regionalData, setRegionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected interactive location state
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 20.5937,
    lng: 78.9629,
    name: 'Nagpur (Central India)'
  });

  // Live Weather Telemetry State
  const [liveWeather, setLiveWeather] = useState({
    loading: false,
    error: null,
    data: null
  });
  
  // Search box states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [flyToTarget, setFlyToTarget] = useState(null);

  const fetchLiveWeatherData = async (lat, lng) => {
    setLiveWeather({ loading: true, error: null, data: null });
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ai-powereddigitaltwin.onrender.com';
    
    // 1. Call registered backend live-weather endpoint
    try {
      const res = await fetch(`${apiUrl}/api/live-weather/?latitude=${lat}&longitude=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setLiveWeather({
          loading: false,
          error: null,
          data: {
            temperature: data.temperature?.value ?? 'N/A',
            tempUnit: data.temperature?.unit || '°C',
            precipitation: data.precipitation?.value ?? 0,
            precipUnit: data.precipitation?.unit || 'mm',
            condition: data.condition || 'Clear',
            weather_code: data.weather_code
          }
        });
        return;
      }
    } catch {
      // Direct failover if primary backend call encounters connection/CORS issue
    }

    // 2. Direct client-side fallback: Call Open-Meteo API
    try {
      const omRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code`);
      if (omRes.ok) {
        const omData = await omRes.json();
        const current = omData.current || {};
        const units = omData.current_units || {};
        setLiveWeather({
          loading: false,
          error: null,
          data: {
            temperature: current.temperature_2m ?? 'N/A',
            tempUnit: units.temperature_2m || '°C',
            precipitation: current.precipitation ?? 0,
            precipUnit: units.precipitation || 'mm',
            condition: getWmoCondition(current.weather_code),
            weather_code: current.weather_code
          }
        });
      } else {
        setLiveWeather({ loading: false, error: 'Weather data unavailable', data: null });
      }
    } catch {
      setLiveWeather({ loading: false, error: 'Network error fetching live weather', data: null });
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const regions = ['mumbai', 'delhi', 'chennai', 'kolkata', 'guwahati', 'bengaluru'];
      const apiUrl = import.meta.env.VITE_API_URL || 'https://ai-powereddigitaltwin.onrender.com';
      const responses = await Promise.all(
        regions.map(r =>
          fetch(`${apiUrl}/api/dashboard/?region=${r}`).then(res => {
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
    fetchLiveWeatherData(20.5937, 78.9629);
  }, []);

  // Location click handler
  const handleMapClick = async (lat, lng) => {
    setSearchError(null);
    const coordsName = `Location (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`;

    setSelectedLocation({
      lat,
      lng,
      name: coordsName
    });

    // Fetch live weather data immediately for clicked point
    fetchLiveWeatherData(lat, lng);

    // Reverse geocode to retrieve city/state name if available
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          const formattedName = parts.slice(0, 2).join(', ').trim() || coordsName;
          setSelectedLocation(prev => ({
            ...prev,
            name: formattedName
          }));
        }
      }
    } catch {
      // Keep default coordinate name if reverse geocoding fails
    }
  };

  // Search box submit handler
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchError(null);

    let targetLoc = null;

    // 1. Check popular Indian cities index
    const match = POPULAR_INDIAN_CITIES.find(c => 
      c.name.toLowerCase().includes(q.toLowerCase()) || 
      c.state.toLowerCase().includes(q.toLowerCase())
    );

    if (match) {
      targetLoc = {
        lat: match.lat,
        lng: match.lng,
        name: `${match.name}, ${match.state}`
      };
    } else {
      // 2. Query Nominatim API for general search in India
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=1`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const displayName = data[0].display_name.split(',').slice(0, 3).join(', ');
          targetLoc = { lat, lng, name: displayName };
        } else {
          setSearchError(`No location results found for "${q}". Try another Indian city or place.`);
        }
      } catch (err) {
        setSearchError(err.message || 'Unable to perform location search. Please check network connection.');
      }
    }

    if (targetLoc) {
      setSelectedLocation(targetLoc);
      setFlyToTarget({ lat: targetLoc.lat, lng: targetLoc.lng, zoom: 9 });
      fetchLiveWeatherData(targetLoc.lat, targetLoc.lng);
    }

    setIsSearching(false);
  };

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
            Verify that your backend Python server is running at <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{import.meta.env.VITE_API_URL || 'https://ai-powereddigitaltwin.onrender.com'}</code>.
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

  const getSummaryRainfall = () => {
    if (!regionalData) return '185 mm (Avg)';
    const data = regionalData.Rainfall || [];
    const sum = data.reduce((acc, curr) => acc + curr.value, 0);
    const avg = data.length > 0 ? (sum / data.length) : 0;
    return `${Math.round(avg)} mm (Avg)`;
  };

  const getSummaryTemperature = () => {
    if (!regionalData) return '31.8 °C (Avg)';
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
            <span>Live Weather Grid Active</span>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Leaflet Map Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 backdrop-blur-md overflow-hidden relative shadow-xl">
              
              {/* Map Top Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>Subcontinent Live Simulation Grid</span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">Click anywhere on India map or search city for instant live weather.</p>
                </div>

                {/* Location Search Box */}
                <form onSubmit={handleSearch} className="relative flex items-center min-w-[240px] sm:min-w-[290px]">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search city/region in India..."
                      className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 pl-9 pr-8 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => { setSearchQuery(''); setSearchError(null); }}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-md shrink-0 active:scale-95"
                  >
                    {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Fly To</span>}
                  </button>
                </form>
              </div>

              {/* Search Error Alert */}
              {searchError && (
                <div className="mb-3 px-3 py-2 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center justify-between animate-fadeIn">
                  <span>{searchError}</span>
                  <button onClick={() => setSearchError(null)} className="text-red-400 hover:text-red-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Layer Badge Header */}
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono text-[11px] text-slate-300">CartoDB Voyager GIS Active</span>
                </div>
                <div className="font-mono text-[11px] text-blue-400 bg-blue-950/50 border border-blue-900/60 px-2.5 py-1 rounded-md">
                  GIS Layer: CartoDB Voyager
                </div>
              </div>

              {/* Leaflet Map Frame */}
              <div className="w-full h-[360px] md:h-[460px] rounded-xl overflow-hidden border-2 border-slate-700/80 relative z-10 shadow-2xl ring-1 ring-slate-800">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  
                  <MapClickHandler onMapClick={handleMapClick} />
                  <MapFlyToController flyToTarget={flyToTarget} />

                  {selectedLocation && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={customPinIcon}>
                      <Popup autoPan={true} className="custom-voyager-popup">
                        <div className="text-slate-900 font-sans p-1.5 min-w-[210px] max-w-[240px]">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs truncate max-w-[130px]">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                              <span className="truncate">{selectedLocation.name}</span>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 rounded-full shrink-0 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Live Now
                            </span>
                          </div>

                          {liveWeather.loading ? (
                            <div className="py-4 text-center space-y-2">
                              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                              <p className="text-xs text-slate-500 font-medium">Fetching live telemetry...</p>
                            </div>
                          ) : liveWeather.error ? (
                            <div className="py-2 text-center text-xs text-red-600 font-medium">
                              {liveWeather.error}
                            </div>
                          ) : liveWeather.data ? (
                            <div className="space-y-1.5 text-xs text-slate-800">
                              <div className="flex justify-between items-center bg-orange-50/80 p-2 rounded-lg border border-orange-100 shadow-sm">
                                <span className="flex items-center gap-1.5 font-semibold text-orange-900">
                                  <Sun className="w-4 h-4 text-orange-500" />
                                  Temperature:
                                </span>
                                <span className="font-extrabold text-sm text-orange-600">
                                  {liveWeather.data.temperature} {liveWeather.data.tempUnit}
                                </span>
                              </div>

                              <div className="flex justify-between items-center bg-blue-50/80 p-2 rounded-lg border border-blue-100 shadow-sm">
                                <span className="flex items-center gap-1.5 font-semibold text-blue-900">
                                  <CloudRain className="w-4 h-4 text-blue-500" />
                                  Current Rainfall (mm):
                                </span>
                                <span className="font-extrabold text-sm text-blue-600">
                                  {liveWeather.data.precipitation} {liveWeather.data.precipUnit}
                                </span>
                              </div>

                              <div className="flex justify-between items-center bg-slate-100 p-1.5 rounded text-[11px] font-medium text-slate-700 border border-slate-200 mt-1">
                                <span>Condition:</span>
                                <span className="font-bold text-slate-900">{liveWeather.data.condition}</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </Popup>
                    </Marker>
                  )}
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
                  <span>Click anywhere on the map to stream live weather telemetry</span>
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
                  {currentSummary.icon && <currentSummary.icon className="w-6 h-6" />}
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

            {/* Active Selected Location Details Panel */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span>Active Location Telemetry</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE NOW
                </span>
              </div>

              {selectedLocation ? (
                <div className="space-y-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 animate-fadeIn">
                  <div className="flex justify-between items-start font-semibold border-b border-slate-850 pb-2 text-blue-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="truncate max-w-[170px] text-slate-100">{selectedLocation.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedLocation.lat.toFixed(2)}°, {selectedLocation.lng.toFixed(2)}°
                    </span>
                  </div>

                  {liveWeather.loading ? (
                    <div className="py-4 text-center space-y-2 text-slate-400">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin mx-auto" />
                      <p className="text-xs font-medium">Fetching live telemetry...</p>
                    </div>
                  ) : liveWeather.data ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-orange-400" />
                          Live Temperature:
                        </span>
                        <span className="font-bold text-orange-400 text-sm">
                          {liveWeather.data.temperature} {liveWeather.data.tempUnit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                          Current Rainfall (mm):
                        </span>
                        <span className="font-bold text-blue-400 text-sm">
                          {liveWeather.data.precipitation} {liveWeather.data.precipUnit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Weather Condition:</span>
                        <span className="font-bold text-slate-200">{liveWeather.data.condition}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-slate-400 text-center">
                      {liveWeather.error || 'Click map location to load live telemetry.'}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-850 text-[10px] text-emerald-400/90 leading-tight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Real-time Open-Meteo telemetry stream active</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 py-4 text-center bg-slate-950/40 rounded-xl border border-slate-850 border-dashed">
                  Click map location or search city to inspect live weather.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

