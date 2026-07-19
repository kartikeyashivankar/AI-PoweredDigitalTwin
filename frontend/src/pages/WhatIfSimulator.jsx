import React, { useState, useEffect } from 'react';
import { Sliders, AlertOctagon, RefreshCw, CheckCircle2, TrendingDown, Thermometer, CloudRain } from 'lucide-react';

export default function WhatIfSimulator() {
  const [rainfallChange, setRainfallChange] = useState(0); // -50% to +50%
  const [tempChange, setTempChange] = useState(0.0); // -2.0°C to +5.0°C

  // Presets mapping
  const presets = {
    drought: { rainfall: -40, temp: 2.5, name: 'Drought Scenario' },
    heavyRainfall: { rainfall: 45, temp: -0.5, name: 'Heavy Rainfall' },
    heatwave: { rainfall: -15, temp: 4.0, name: 'Severe Heatwave' },
  };

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    if (preset) {
      setRainfallChange(preset.rainfall);
      setTempChange(preset.temp);
    }
  };

  const resetSimulation = () => {
    setRainfallChange(0);
    setTempChange(0.0);
  };

  const [simulationResult, setSimulationResult] = useState({
    alertLevel: 'Nominal Climate Grid',
    alertColor: 'border-slate-800 bg-slate-900/30 text-slate-300',
    description: 'No significant anomalies detected.',
    agriculturalYield: 0,
    waterAvailability: 0,
    gridResilience: 0
  });
  const [simulating, setSimulating] = useState(false);

  const runSimulationApi = async (rainVal, tempVal) => {
    setSimulating(true);
    try {
      const res = await fetch(`http://localhost:8000/api/whatif/?rainfall_change=${rainVal}&temp_change=${tempVal}`);
      if (!res.ok) {
        throw new Error('Failed to run simulation');
      }
      const data = await res.json();
      
      // Determine the correct Lucide icon component based on alert level
      let icon = CheckCircle2;
      const alertLevel = data.alertLevel || '';
      if (alertLevel.includes('Desertification') || alertLevel.includes('Drought')) {
        icon = AlertOctagon;
      } else if (alertLevel.includes('Flash Floods')) {
        icon = CloudRain;
      } else if (alertLevel.includes('Heat Stress')) {
        icon = Thermometer;
      }

      setSimulationResult({
        alertLevel: data.alertLevel,
        alertColor: data.alertColor,
        description: data.description,
        agriculturalYield: data.agriculturalYield,
        waterAvailability: data.waterAvailability,
        gridResilience: data.gridResilience,
        icon
      });
    } catch (err) {
      console.error(err);
      setSimulationResult(prev => ({
        ...prev,
        description: `Error: Unable to connect to simulation solvers. Details: ${err.message}`
      }));
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      runSimulationApi(rainfallChange, tempChange);
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [rainfallChange, tempChange]);

  const ResultIcon = simulationResult.icon || CheckCircle2;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              What-If Simulator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Perturb precipitation and thermal attributes to model regional environmental vulnerabilities.
            </p>
          </div>
          
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Sliders & Preset Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sliders Box */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <span>Environmental Input Drivers</span>
              </h2>

              {/* Slider 1: Rainfall */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label htmlFor="rainfall-slider" className="font-semibold text-sm text-slate-200">Precipitation Variance</label>
                  <span className={`font-mono font-bold text-lg ${rainfallChange >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                    {rainfallChange >= 0 ? `+${rainfallChange}` : rainfallChange}%
                  </span>
                </div>
                <input
                  id="rainfall-slider"
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={rainfallChange}
                  onChange={(e) => setRainfallChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 border border-slate-850"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>-50% (Extreme Deficit)</span>
                  <span>Baseline (0%)</span>
                  <span>+50% (Extreme Saturation)</span>
                </div>
              </div>

              {/* Slider 2: Temp */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label htmlFor="temp-slider" className="font-semibold text-sm text-slate-200">Thermal Gradient Shift</label>
                  <span className={`font-mono font-bold text-lg ${tempChange >= 0 ? 'text-orange-400' : 'text-blue-400'}`}>
                    {tempChange >= 0 ? `+${tempChange.toFixed(1)}` : tempChange.toFixed(1)}°C
                  </span>
                </div>
                <input
                  id="temp-slider"
                  type="range"
                  min="-2.0"
                  max="5.0"
                  step="0.5"
                  value={tempChange}
                  onChange={(e) => setTempChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-slate-850"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>-2.0°C</span>
                  <span>Baseline (0°C)</span>
                  <span>+5.0°C (Critical Heating)</span>
                </div>
              </div>
            </div>

            {/* Presets Panel */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <h3 className="font-bold text-sm text-slate-200">Climate Simulation Presets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => applyPreset('drought')}
                  className="px-4 py-3 text-xs font-semibold rounded-xl bg-slate-950 hover:bg-orange-950/20 text-orange-400 hover:text-orange-300 border border-orange-500/10 hover:border-orange-500/30 transition-all text-center"
                >
                  Drought Scenario
                </button>
                <button
                  onClick={() => applyPreset('heavyRainfall')}
                  className="px-4 py-3 text-xs font-semibold rounded-xl bg-slate-950 hover:bg-blue-950/20 text-blue-400 hover:text-blue-300 border border-blue-500/10 hover:border-blue-500/30 transition-all text-center"
                >
                  Heavy Rainfall
                </button>
                <button
                  onClick={() => applyPreset('heatwave')}
                  className="px-4 py-3 text-xs font-semibold rounded-xl bg-slate-950 hover:bg-orange-950/20 text-orange-400 hover:text-orange-300 border border-orange-500/10 hover:border-orange-500/30 transition-all text-center"
                >
                  Severe Heatwave
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Simulation Results */}
          <div className="space-y-6">
            
            {/* Main Result Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between h-full min-h-[340px]">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Simulator Output</h2>
                  {simulating ? (
                    <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                      Solving...
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">Real-time Solvers</span>
                  )}
                </div>

                {/* Risk Level Badge */}
                <div className={`p-4 rounded-xl border flex items-center space-x-3 transition-colors duration-300 ${simulationResult.alertColor}`}>
                  <ResultIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-bold text-sm">{simulationResult.alertLevel}</span>
                </div>

                {/* Impact Text Box */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold block mb-2 uppercase tracking-wider">Climate Impact Log</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {simulationResult.description}
                  </p>
                </div>
              </div>

              {/* Quantitative indicators */}
              <div className="border-t border-slate-850 mt-6 pt-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Agricultural Yield Shift</span>
                  <span className={`font-bold font-mono ${simulationResult.agriculturalYield >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                    {simulationResult.agriculturalYield >= 0 ? `+${simulationResult.agriculturalYield}` : simulationResult.agriculturalYield}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Water Supply Capacity</span>
                  <span className={`font-bold font-mono ${simulationResult.waterAvailability >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                    {simulationResult.waterAvailability >= 0 ? `+${simulationResult.waterAvailability}` : simulationResult.waterAvailability}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Grid Stability Margin</span>
                  <span className={`font-bold font-mono ${simulationResult.gridResilience >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                    {simulationResult.gridResilience >= 0 ? `+${simulationResult.gridResilience}` : simulationResult.gridResilience}%
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
