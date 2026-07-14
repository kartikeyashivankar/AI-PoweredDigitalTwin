import React, { useState, useEffect } from 'react';
import { Sliders, AlertOctagon, RefreshCw, CheckCircle2, TrendingDown, Thermometer, CloudRain } from 'lucide-react';

export default function WhatIfSimulator() {
  const [rainfallChange, setRainfallChange] = useState(0); // -50% to +50%
  const [tempChange, setTempChange] = useState(0.0); // -2.0°C to +5.0°C
  const [simulationResult, setSimulationResult] = useState({});

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

  // Run impact calculation logic based on slider coefficients
  useEffect(() => {
    let alertLevel = 'Nominal';
    let alertColor = 'border-blue-500/30 bg-blue-500/5 text-blue-400';
    let icon = CheckCircle2;
    let description = '';

    const tempCoeff = tempChange;
    const rainCoeff = rainfallChange;

    // Logic trees
    if (tempCoeff >= 3.5 && rainCoeff <= -20) {
      alertLevel = 'Extreme Risk: Severe Desertification';
      alertColor = 'border-orange-600/30 bg-orange-600/5 text-orange-400';
      icon = AlertOctagon;
      description = 'CRITICAL: High threat of agricultural collapse, extreme soil moisture loss, and widespread urban water rationing. Immediate action required in Western and Central zones.';
    } else if (tempCoeff >= 2.0 && rainCoeff <= -25) {
      alertLevel = 'High Risk: Regional Drought Alert';
      alertColor = 'border-orange-500/30 bg-orange-500/5 text-orange-400';
      icon = AlertOctagon;
      description = 'WARNING: Mild-to-moderate drought markers active. Water reservoirs projected to deplete by 25% over the simulation quarter. Dryland crops like millets and pulses are highly vulnerable.';
    } else if (rainCoeff >= 35) {
      alertLevel = 'High Risk: Fluvial Flash Floods';
      alertColor = 'border-blue-500/30 bg-blue-500/5 text-blue-400';
      icon = CloudRain;
      description = 'WARNING: Flash flood hazards identified in Ganges-Brahmaputra delta and coastal cities. Urban sewer drainage capacities exceeded. Landslide warnings issued for northern hill states.';
    } else if (tempCoeff >= 3.0) {
      alertLevel = 'Moderate Risk: Heat Stress & Energy Load';
      alertColor = 'border-orange-400/30 bg-orange-400/5 text-orange-300';
      icon = Thermometer;
      description = 'CAUTION: Urban heat islands under severe load. Peak power grid consumption expected to rise by 18% to sustain cooling systems. Wet-bulb temperatures exceed safety safety limits in eastern plains.';
    } else if (rainCoeff >= 15 && tempCoeff < 1.0) {
      alertLevel = 'Optimal Monsoon Flow';
      alertColor = 'border-blue-500/30 bg-blue-500/5 text-blue-400';
      icon = CheckCircle2;
      description = 'INFO: Simulated conditions project optimal groundwater replenishment and record-high yields for kharif crops (rice, sugarcane). Low soil erosion risk.';
    } else {
      alertLevel = 'Nominal Climate Grid';
      alertColor = 'border-slate-800 bg-slate-900/30 text-slate-300';
      icon = CheckCircle2;
      description = 'No significant anomalies detected. Regional temperature gradients, surface albedo ratios, and precipitation volumes align with baseline historical climate indexes.';
    }

    // Calculated indicators
    const agriculturalYield = Math.max(-50, Math.min(25, Math.round(rainCoeff * 0.4 - tempCoeff * 6.5)));
    const waterAvailability = Math.max(-60, Math.min(40, Math.round(rainCoeff * 1.2 - tempCoeff * 8.0)));
    const gridResilience = Math.max(-45, Math.min(10, Math.round(-tempCoeff * 9.5)));

    setSimulationResult({
      alertLevel,
      alertColor,
      icon,
      description,
      agriculturalYield,
      waterAvailability,
      gridResilience
    });
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
                  <span className="text-[10px] text-slate-400 font-mono">Real-time Solvers</span>
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
