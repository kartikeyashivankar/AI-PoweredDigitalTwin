import requests
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/live-weather", tags=["live-weather"])

# WMO Weather interpretation codes (WW)
WMO_WEATHER_CODES = {
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
}

def get_weather_description(code: int) -> str:
    return WMO_WEATHER_CODES.get(code, "Unknown")

@router.get("/")
def get_live_weather(
    latitude: float = Query(..., description="Latitude coordinate (-90 to 90)"),
    longitude: float = Query(..., description="Longitude coordinate (-180 to 180)")
):
    if not (-90.0 <= latitude <= 90.0):
        raise HTTPException(
            status_code=400,
            detail="Invalid latitude value. Must be between -90 and 90."
        )
    if not (-180.0 <= longitude <= 180.0):
        raise HTTPException(
            status_code=400,
            detail="Invalid longitude value. Must be between -180 and 180."
        )

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,precipitation,weather_code"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Open-Meteo API returned error status {response.status_code}"
            )
        
        data = response.json()
        current = data.get("current", {})
        current_units = data.get("current_units", {})

        temp = current.get("temperature_2m")
        temp_unit = current_units.get("temperature_2m", "°C")
        
        precip = current.get("precipitation")
        precip_unit = current_units.get("precipitation", "mm")
        
        weather_code = current.get("weather_code")
        condition = get_weather_description(weather_code) if weather_code is not None else "Unknown"

        return {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": {
                "value": temp,
                "unit": temp_unit
            },
            "precipitation": {
                "value": precip,
                "unit": precip_unit
            },
            "weather_code": weather_code,
            "condition": condition
        }

    except requests.RequestException as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to communicate with Open-Meteo service: {str(e)}"
        )
