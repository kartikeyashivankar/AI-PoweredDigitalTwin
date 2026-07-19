import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Reshape
from sklearn.preprocessing import MinMaxScaler

def main():
    # 1. Load data
    data_path = os.path.join("data", "processed", "climate_data.csv")
    if not os.path.exists(data_path):
        print(f"Error: Processed data not found at {data_path}")
        return
        
    df = pd.read_csv(data_path)
    df['date'] = pd.to_datetime(df['date'])
    
    # 2. Create time features
    df['dayofyear'] = df['date'].dt.dayofyear
    df['month'] = df['date'].dt.month
    
    # Split into train (2015-2023) and test (2024-2025) sets
    train_df = df[df['date'] < '2024-01-01'].copy()
    test_df = df[df['date'] >= '2024-01-01'].copy()
    
    print(f"Train set: {len(train_df)} rows ({train_df['date'].min().strftime('%Y-%m-%d')} to {train_df['date'].max().strftime('%Y-%m-%d')})")
    print(f"Test set: {len(test_df)} rows ({test_df['date'].min().strftime('%Y-%m-%d')} to {test_df['date'].max().strftime('%Y-%m-%d')})")
    
    # Fit scalers on train set
    scaler_target = MinMaxScaler()
    scaler_time = MinMaxScaler()
    
    # Fit target scaler on rainfall, tempmax, tempmin
    train_target_scaled = scaler_target.fit_transform(train_df[['rainfall', 'tempmax', 'tempmin']])
    test_target_scaled = scaler_target.transform(test_df[['rainfall', 'tempmax', 'tempmin']])
    
    # Fit time scaler on dayofyear, month
    train_time_scaled = scaler_time.fit_transform(train_df[['dayofyear', 'month']])
    test_time_scaled = scaler_time.transform(test_df[['dayofyear', 'month']])
    
    # Create sequence datasets (seq_len=7, horizon=7)
    def create_sequences(target_data, time_data, seq_len=7, horizon=7):
        X, y = [], []
        n = len(target_data)
        for i in range(seq_len, n - horizon + 1):
            # Input features: target + time features of previous 7 days
            seq_target = target_data[i - seq_len : i]
            seq_time = time_data[i - seq_len : i]
            seq_features = np.hstack([seq_target, seq_time])
            
            # Target features: next 7 days of rainfall, tempmax, tempmin
            target = target_data[i : i + horizon]
            
            X.append(seq_features)
            y.append(target)
        return np.array(X), np.array(y)
        
    X_train, y_train = create_sequences(train_target_scaled, train_time_scaled)
    X_test, y_test = create_sequences(test_target_scaled, test_time_scaled)
    
    print(f"\nSequence input shape (X_train): {X_train.shape}")
    print(f"Sequence target shape (y_train): {y_train.shape}")
    
    # 3. Train simple LSTM model
    print("\nBuilding and training LSTM model...")
    model = Sequential([
        # Shape: (time_steps=7, features=5)
        LSTM(64, activation='tanh', input_shape=(7, 5), return_sequences=False),
        Dense(32, activation='relu'),
        Dense(21), # 7 days * 3 variables
        Reshape((7, 3)) # Reshape output to (horizon=7, variables=3)
    ])
    
    model.compile(optimizer='adam', loss='mse')
    model.summary()
    
    # Train model
    history = model.fit(
        X_train, y_train,
        epochs=15,
        batch_size=32,
        validation_split=0.1,
        verbose=1
    )
    
    # 4. Evaluate the model
    print("\nEvaluating model on test set...")
    y_pred = model.predict(X_test)
    
    # Inverse transform to original scales
    y_pred_orig = scaler_target.inverse_transform(y_pred.reshape(-1, 3)).reshape(y_pred.shape)
    y_test_orig = scaler_target.inverse_transform(y_test.reshape(-1, 3)).reshape(y_test.shape)
    
    # Calculate RMSE for each variable
    rmse_rain = np.sqrt(np.mean((y_test_orig[:, :, 0] - y_pred_orig[:, :, 0])**2))
    rmse_tmax = np.sqrt(np.mean((y_test_orig[:, :, 1] - y_pred_orig[:, :, 1])**2))
    rmse_tmin = np.sqrt(np.mean((y_test_orig[:, :, 2] - y_pred_orig[:, :, 2])**2))
    
    print(f"Test Set RMSE:")
    print(f"  Rainfall: {rmse_rain:.4f} mm")
    print(f"  Temp Max: {rmse_tmax:.4f}°C")
    print(f"  Temp Min: {rmse_tmin:.4f}°C")
    
    # 5. Plot predictions vs actuals (1-day ahead forecasts)
    print("\nGenerating prediction plots...")
    # Extracts the 1-day ahead forecasts
    actual_1d = y_test_orig[:, 0, :]
    pred_1d = y_pred_orig[:, 0, :]
    test_dates = test_df['date'].iloc[7 : 7 + len(actual_1d)].values
    
    fig, axes = plt.subplots(3, 1, figsize=(12, 14), sharex=True)
    
    variables = [('Rainfall (mm)', '#3b82f6'), ('Temp Max (°C)', '#f97316'), ('Temp Min (°C)', '#10b981')]
    for idx, (label, color) in enumerate(variables):
        axes[idx].plot(test_dates, actual_1d[:, idx], label='Actual', color='slategray', alpha=0.5, linestyle='--')
        axes[idx].plot(test_dates, pred_1d[:, idx], label='LSTM Predict (1d-ahead)', color=color, alpha=0.9)
        axes[idx].set_ylabel(label)
        axes[idx].legend()
        axes[idx].grid(True, linestyle=':', alpha=0.6)
        
    axes[2].set_xlabel('Date')
    plt.suptitle('LSTM Climate Predictions vs Actuals (Test Set: 2024-2025)', fontsize=14, y=0.95)
    
    # Save the plot image
    plots_dir = "notebooks/model_experiments"
    os.makedirs(plots_dir, exist_ok=True)
    plot_path = os.path.join(plots_dir, "prediction_evaluation_plot.png")
    plt.savefig(plot_path, dpi=150, bbox_inches='tight')
    print(f"Plot saved to: {plot_path}")
    
    # 6. Save model to models/saved_models/climate_lstm_model.h5
    model_dir = os.path.join("models", "saved_models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "climate_lstm_model.h5")
    
    print(f"\nSaving trained model to: {model_path}...")
    model.save(model_path)
    print("Success! Model saved.")

if __name__ == "__main__":
    main()
