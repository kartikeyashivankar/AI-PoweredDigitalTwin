import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from app.api.forecast import load_model_and_scalers

router = APIRouter(prefix="/whatif", tags=["whatif"])

@router.get("/")
def run_simulation(rainfall_change: float = 0.0, temp_change: float = 0.0):
    try:
        model, scaler_target, scaler_time, df = load_model_and_scalers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize simulation model: {str(e)}")

    # 1. Load the last 30 days of data as the base input context
    base_30_days = df.tail(30).copy()
    
    # 2. Apply perturbations to the entire last 30 days of data
    pert_30_days = base_30_days.copy()
    
    # Apply rainfall change percentage
    pert_30_days['rainfall'] = pert_30_days['rainfall'] * (1.0 + rainfall_change / 100.0)
    pert_30_days['rainfall'] = np.maximum(0.0, pert_30_days['rainfall']) # rainfall cannot be negative
    
    # Apply absolute temperature shift in °C
    pert_30_days['tempmax'] = pert_30_days['tempmax'] + temp_change
    pert_30_days['tempmin'] = pert_30_days['tempmin'] + temp_change

    # 3. Slice the last 7 days of BOTH the baseline and perturbed contexts to construct model sequences
    base_7_days = base_30_days.tail(7).copy()
    pert_7_days = pert_30_days.tail(7).copy()
    
    # Add time features
    for dataframe in [base_7_days, pert_7_days]:
        dataframe['dayofyear'] = dataframe['date'].dt.dayofyear
        dataframe['month'] = dataframe['date'].dt.month

    # 4. Transform and scale features for both scenarios
    try:
        # Scale baseline inputs
        base_target_scaled = scaler_target.transform(base_7_days[['rainfall', 'tempmax', 'tempmin']])
        base_time_scaled = scaler_time.transform(base_7_days[['dayofyear', 'month']])
        X_base = np.expand_dims(np.hstack([base_target_scaled, base_time_scaled]), axis=0)

        # Scale perturbed inputs
        pert_target_scaled = scaler_target.transform(pert_7_days[['rainfall', 'tempmax', 'tempmin']])
        pert_time_scaled = scaler_time.transform(pert_7_days[['dayofyear', 'month']])
        X_pert = np.expand_dims(np.hstack([pert_target_scaled, pert_time_scaled]), axis=0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data scaling failed in simulation: {str(e)}")

    # 5. Run inference to get predictions
    try:
        # Predict baseline
        y_base = model.predict(X_base, verbose=0)
        y_base_orig = scaler_target.inverse_transform(y_base.reshape(-1, 3)).reshape(y_base.shape)[0]
        
        # Predict perturbed
        y_pert = model.predict(X_pert, verbose=0)
        y_pert_orig = scaler_target.inverse_transform(y_pert.reshape(-1, 3)).reshape(y_pert.shape)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed in simulation: {str(e)}")

    # 6. Calculate predicted outputs
    base_rain_sum = float(np.sum(y_base_orig[:, 0]))
    pert_rain_sum = float(np.sum(y_pert_orig[:, 0]))
    
    base_tempmax_avg = float(np.mean(y_base_orig[:, 1]))
    pert_tempmax_avg = float(np.mean(y_pert_orig[:, 1]))
    
    # Calculate predicted drought risk indexes: (tempmax - 15) / (rainfall + 10)
    base_droughts = (y_base_orig[:, 1] - 15.0) / (y_base_orig[:, 0] + 10.0)
    pert_droughts = (y_pert_orig[:, 1] - 15.0) / (y_pert_orig[:, 0] + 10.0)
    base_drought_avg = float(np.mean(base_droughts))
    pert_drought_avg = float(np.mean(pert_droughts))
    
    # 7. Calculate direct model-predicted percentage shifts (no hardcoded combination math!)
    # Rainfall Change %
    if base_rain_sum > 0.01:
        eff_rain_change = ((pert_rain_sum - base_rain_sum) / base_rain_sum) * 100.0
    else:
        eff_rain_change = (pert_rain_sum - base_rain_sum) * 100.0
        
    # Temperature Change % (relative to the baseline predicted temperature avg)
    if base_tempmax_avg > 0.01:
        eff_temp_change_percent = ((pert_tempmax_avg - base_tempmax_avg) / base_tempmax_avg) * 100.0
    else:
        eff_temp_change_percent = (pert_tempmax_avg - base_tempmax_avg) * 100.0
        
    # Drought Risk Change %
    if abs(base_drought_avg) > 0.01:
        eff_drought_change = ((pert_drought_avg - base_drought_avg) / base_drought_avg) * 100.0
    else:
        eff_drought_change = (pert_drought_avg - base_drought_avg) * 100.0

    # Map directly to frontend response keys (capped/rounded)
    # agriculturalYield = Predicted Rainfall Change %
    # waterAvailability = Predicted Temperature Change %
    # gridResilience = Predicted Drought Risk Change %
    agri_yield = int(round(eff_rain_change))
    water_avail = int(round(eff_temp_change_percent))
    grid_res = int(round(eff_drought_change))

    # 8. Alert Logic Trees and Impact descriptions based on input changes and model forecasts
    if temp_change >= 3.5 and rainfall_change <= -20:
        alert_level = "Extreme Risk: Severe Desertification"
        alert_color = "border-orange-600/30 bg-orange-600/5 text-orange-400"
        description = f"CRITICAL: High threat of agricultural collapse, extreme soil moisture loss, and widespread urban water rationing. Model outputs predict rainfall shift of {eff_rain_change:+.1f}%, temperature shift of {eff_temp_change_percent:+.1f}%, and drought risk increase of {eff_drought_change:+.1f}%."
    elif temp_change >= 2.0 and rainfall_change <= -25:
        alert_level = "High Risk: Regional Drought Alert"
        alert_color = "border-orange-500/30 bg-orange-500/5 text-orange-400"
        description = f"WARNING: Mild-to-moderate drought markers active. Water reservoirs projected to deplete. Model outputs predict rainfall shift of {eff_rain_change:+.1f}%, temperature shift of {eff_temp_change_percent:+.1f}%, and drought risk shift of {eff_drought_change:+.1f}%."
    elif rainfall_change >= 35:
        alert_level = "High Risk: Fluvial Flash Floods"
        alert_color = "border-blue-500/30 bg-blue-500/5 text-blue-400"
        description = f"WARNING: Flash flood hazards identified in Ganges-Brahmaputra delta and coastal cities. Model outputs predict rainfall shift of {eff_rain_change:+.1f}%, temperature shift of {eff_temp_change_percent:+.1f}%, and drought risk shift of {eff_drought_change:+.1f}%."
    elif temp_change >= 3.0:
        alert_level = "Moderate Risk: Heat Stress & Energy Load"
        alert_color = "border-orange-400/30 bg-orange-400/5 text-orange-300"
        description = f"CAUTION: Urban heat islands under severe load. Peak power grid consumption expected to rise to sustain cooling systems. Model outputs predict rainfall shift of {eff_rain_change:+.1f}%, temperature shift of {eff_temp_change_percent:+.1f}%, and drought risk shift of {eff_drought_change:+.1f}%."
    elif rainfall_change >= 15 and temp_change < 1.0:
        alert_level = "Optimal Monsoon Flow"
        alert_color = "border-blue-500/30 bg-blue-500/5 text-blue-400"
        description = f"INFO: Simulated conditions project optimal groundwater replenishment and record-high yields for crops. Model outputs predict rainfall shift of {eff_rain_change:+.1f}%, temperature shift of {eff_temp_change_percent:+.1f}%, and drought risk shift of {eff_drought_change:+.1f}%."
    else:
        alert_level = "Nominal Climate Grid"
        alert_color = "border-slate-800 bg-slate-900/30 text-slate-300"
        description = f"No significant anomalies detected. Regional temperature gradients, albedo ratios, and precipitation volumes align with baseline indexes. Model outputs predict rainfall shift of {eff_rain_change:+.1f}%, temperature shift of {eff_temp_change_percent:+.1f}%, and drought risk shift of {eff_drought_change:+.1f}%."

    return {
        "alertLevel": alert_level,
        "alertColor": alert_color,
        "description": description,
        "agriculturalYield": agri_yield,
        "waterAvailability": water_avail,
        "gridResilience": grid_res
    }

