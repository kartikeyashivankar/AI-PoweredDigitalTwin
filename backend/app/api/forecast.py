import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler

router = APIRouter(prefix="/forecast", tags=["forecast"])

# Cache dictionary to store model and fit scalers across API calls
_MODEL_CACHE = {}

def get_project_paths():
    """
    Computes absolute paths for project resources.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
    model_path = os.path.join(project_root, "models", "saved_models", "climate_lstm_model.h5")
    data_path = os.path.join(project_root, "data", "processed", "climate_data.csv")
    return model_path, data_path

def load_model_and_scalers():
    """
    Loads the trained model and fits the MinMaxScaler instances using the training set range.
    """
    if not _MODEL_CACHE:
        model_path, data_path = get_project_paths()
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"LSTM model not found at {model_path}")
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Processed climate data not found at {data_path}")
            
        # Load the Keras model with compile=False to bypass Keras 3 metric deserialization issues
        model = tf.keras.models.load_model(model_path, compile=False)
        
        # Load historical climate data
        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        
        # Define and fit scalers exactly matching the train_lstm.py configuration
        train_df = df[df['date'] < '2024-01-01'].copy()
        
        scaler_target = MinMaxScaler()
        scaler_time = MinMaxScaler()
        
        # Fit target scaler on: rainfall, tempmax, tempmin
        scaler_target.fit(train_df[['rainfall', 'tempmax', 'tempmin']])
        
        # Fit time scaler on: dayofyear, month
        train_df['dayofyear'] = train_df['date'].dt.dayofyear
        train_df['month'] = train_df['date'].dt.month
        scaler_time.fit(train_df[['dayofyear', 'month']])
        
        # Store in cache
        _MODEL_CACHE['model'] = model
        _MODEL_CACHE['scaler_target'] = scaler_target
        _MODEL_CACHE['scaler_time'] = scaler_time
        _MODEL_CACHE['df'] = df

    return (
        _MODEL_CACHE['model'],
        _MODEL_CACHE['scaler_target'],
        _MODEL_CACHE['scaler_time'],
        _MODEL_CACHE['df']
    )

def map_weather_metrics(rainfall: float, temp_max: float) -> tuple[str, str, str]:
    """
    Maps predicted temperature and rainfall values into dynamic probability, icon, and conditions.
    """
    if rainfall < 0.1:
        prob = "5%"
        icon = "Sun"
        condition = "Clear Sky" if temp_max >= 25 else "Cool & Dry"
    elif rainfall < 2.0:
        p = int(10 + (rainfall / 2.0) * 30)
        prob = f"{p}%"
        icon = "CloudSun"
        condition = "Scattered Clouds"
    elif rainfall < 10.0:
        p = int(40 + ((rainfall - 2.0) / 8.0) * 35)
        prob = f"{p}%"
        icon = "CloudDrizzle"
        condition = "Light Rain" if rainfall < 5.0 else "Light Showers"
    elif rainfall < 30.0:
        p = int(75 + ((rainfall - 10.0) / 20.0) * 15)
        prob = f"{p}%"
        icon = "CloudRain"
        condition = "Moderate Rain" if rainfall < 20.0 else "Showers"
    else:
        p = int(90 + min((rainfall - 30.0) * 0.2, 9.0))
        prob = f"{p}%"
        if temp_max >= 28.0:
            icon = "CloudLightning"
            condition = "Thunderstorm"
        else:
            icon = "CloudRain"
            condition = "Heavy Rain"
            
    return prob, icon, condition

@router.get("/")
def get_forecast():
    try:
        model, scaler_target, scaler_time, df = load_model_and_scalers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize forecasting components: {str(e)}")

    # 1. Load the last 30 days of data as input context
    last_30_days = df.tail(30).copy()
    
    # 2. Slice the last 7 days of the input context to build the sequence for prediction
    last_7_days = last_30_days.tail(7).copy()
    last_7_days['dayofyear'] = last_7_days['date'].dt.dayofyear
    last_7_days['month'] = last_7_days['date'].dt.month

    # 3. Transform features
    try:
        target_scaled = scaler_target.transform(last_7_days[['rainfall', 'tempmax', 'tempmin']])
        time_scaled = scaler_time.transform(last_7_days[['dayofyear', 'month']])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data scaling failed: {str(e)}")

    # 4. Form sequence input (shape: 1, 7, 5)
    seq_features = np.hstack([target_scaled, time_scaled])
    X_input = np.expand_dims(seq_features, axis=0)

    # 5. Predict 7-day outlook
    try:
        y_pred = model.predict(X_input, verbose=0) # Shape: (1, 7, 3)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}")

    # 6. Inverse scale prediction back to original scales
    y_pred_orig = scaler_target.inverse_transform(y_pred.reshape(-1, 3)).reshape(y_pred.shape)
    predictions = y_pred_orig[0] # Shape: (7, 3)

    # 7. Construct response starting from today
    today = datetime.now()
    forecast = []
    
    for i in range(7):
        future_date = today + timedelta(days=i)
        day_str = future_date.strftime("%a")
        date_str = f"{future_date.strftime('%b')} {future_date.day}"
        
        # Extract variables and guarantee logical boundaries
        rain_pred = max(0.0, float(predictions[i, 0]))
        tmax_pred = float(predictions[i, 1])
        tmin_pred = float(predictions[i, 2])
        
        # Ensure tempmin <= tempmax
        if tmin_pred > tmax_pred:
            tmin_pred, tmax_pred = tmax_pred, tmin_pred
            
        prob, icon, condition = map_weather_metrics(rain_pred, tmax_pred)
        
        forecast.append({
            "day": day_str,
            "date": date_str,
            "tempMax": round(tmax_pred, 1),
            "tempMin": round(tmin_pred, 1),
            "rainfall": round(rain_pred, 1),
            "prob": prob,
            "icon": icon,
            "condition": condition
        })
        
    return forecast

