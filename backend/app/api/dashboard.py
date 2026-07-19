import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from app.api.forecast import load_model_and_scalers

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Static regional configuration with offsets and multipliers
# relative to national average values computed from the CSV
REGIONAL_CONFIGS = {
    "mumbai": {
        "region": "Mumbai (West)",
        "lat": 19.0760,
        "lng": 72.8777,
        "rain_mult": 75.0,     # Mumbai has very heavy monsoonal rain
        "temp_offset": 4.2,     # High coastal humidity, stable warm temp
        "drought_mult": 0.2,    # Low drought risk
    },
    "delhi": {
        "region": "Delhi (North)",
        "lat": 28.6139,
        "lng": 77.2090,
        "rain_mult": 21.0,     # Semi-arid climate
        "temp_offset": 15.6,    # Severe continentality (extremely hot in summer)
        "drought_mult": 0.9,    # High drought risk
    },
    "chennai": {
        "region": "Chennai (South)",
        "lat": 13.0827,
        "lng": 80.2707,
        "rain_mult": 31.0,     # Coastal south
        "temp_offset": 8.9,     # Hot year-round
        "drought_mult": 0.6,    # High water vulnerability
    },
    "kolkata": {
        "region": "Kolkata (East)",
        "lat": 22.5726,
        "lng": 88.3639,
        "rain_mult": 46.0,     # Heavy tropical rain
        "temp_offset": 7.5,     # Warm and humid
        "drought_mult": 0.3,    # Low-to-moderate drought risk
    },
    "guwahati": {
        "region": "Guwahati (North-East)",
        "lat": 26.1445,
        "lng": 91.7362,
        "rain_mult": 90.0,     # Extremely heavy rain (Cherrapunji sub-region)
        "temp_offset": 2.8,     # Cooler hilly profile
        "drought_mult": 0.07,   # Negligible drought risk
    },
    "bengaluru": {
        "region": "Bengaluru (South-Central)",
        "lat": 12.9716,
        "lng": 77.5946,
        "rain_mult": 25.0,     # Moderate rainfall
        "temp_offset": 1.9,     # Mild, comfortable climate
        "drought_mult": 0.7,    # High groundwater depletion threat
    }
}

def get_rainfall_status_and_color(val: float) -> tuple[str, str]:
    if val >= 300.0:
        return "Excessive", "#38bdf8"
    elif val >= 100.0:
        return "Normal", "#34d399"
    else:
        return "Deficit", "#fb923c"

def get_temp_status_and_color(val: float) -> tuple[str, str]:
    if val >= 40.0:
        return "Heatwave Warning", "#ef4444"
    elif val >= 32.0:
        return "High", "#f97316"
    else:
        return "Nominal", "#34d399"

def get_drought_status_and_color(val: float) -> tuple[str, str]:
    if val >= 0.6:
        return "Moderate", "#fb923c"
    elif val >= 0.35:
        return "Mild", "#facc15"
    else:
        return "No Drought", "#34d399"

@router.get("/")
def get_dashboard_data(region: str = "mumbai"):
    key = region.lower().strip()
    
    selected_config = None
    for r_key, cfg in REGIONAL_CONFIGS.items():
        if r_key in key:
            selected_config = cfg
            break
            
    if not selected_config:
        raise HTTPException(
            status_code=404, 
            detail=f"Region '{region}' not found. Available regions: Mumbai, Delhi, Chennai, Kolkata, Guwahati, Bengaluru"
        )
        
    try:
        # Load processed data via forecast caching function
        _, _, _, df = load_model_and_scalers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load climate data for dashboard: {str(e)}")
        
    # Get last 30 rows (representing the most recent month)
    last_30_days = df.tail(30)
    
    avg_tempmax = float(last_30_days['tempmax'].mean())
    sum_rainfall = float(last_30_days['rainfall'].sum())
    
    # Compute base drought index: higher temps and lower rainfall increase drought risk
    base_drought = (avg_tempmax - 15.0) / (sum_rainfall + 10.0)
    
    # Calculate regional perturbed variables
    rain_val = round(sum_rainfall * selected_config["rain_mult"], 1)
    temp_val = round(avg_tempmax + selected_config["temp_offset"], 1)
    drought_val = round(max(0.0, min(1.0, base_drought * selected_config["drought_mult"])), 2)
    
    rain_status, rain_color = get_rainfall_status_and_color(rain_val)
    temp_status, temp_color = get_temp_status_and_color(temp_val)
    drought_status, drought_color = get_drought_status_and_color(drought_val)
    
    return {
        "region": selected_config["region"],
        "lat": selected_config["lat"],
        "lng": selected_config["lng"],
        "rainfall": { "value": rain_val, "unit": "mm", "status": rain_status, "color": rain_color },
        "temperature": { "value": temp_val, "unit": "°C", "status": temp_status, "color": temp_color },
        "drought": { "value": drought_val, "unit": "D-Index", "status": drought_status, "color": drought_color }
    }

