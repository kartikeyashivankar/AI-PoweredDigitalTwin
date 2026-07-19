import os
import numpy as np
import matplotlib.pyplot as plt

def main():
    file_path = os.path.join("data", "raw", "temperature_max", "Maxtemp_MaxT_2015.GRD")
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    print(f"Loading binary temperature data from {file_path}...")
    
    # Each grid value is a 4-byte float (float32)
    # The grid size is 31 x 31 = 961 points per day
    grid_size = 31 * 31
    
    try:
        # Load binary data
        raw_data = np.fromfile(file_path, dtype=np.float32)
        print(f"Total elements loaded: {len(raw_data)}")
        
        num_days = len(raw_data) // grid_size
        print(f"Number of days detected: {num_days}")
        
        # Reshape data to (num_days, latitude, longitude)
        # In IMD GRD files, the daily data is written row-by-row (lat, lon)
        # where row 0 corresponds to Lat 7.5N and column 0 corresponds to Lon 67.5E.
        data = raw_data.reshape((num_days, 31, 31))
        print(f"Reshaped data shape: {data.shape}")
        
        # Replace missing data (marked as 99.9) with NaN
        # Missing values in IMD are exactly 99.9, so we mask values in that range
        data_clean = np.where((data > 99.0) & (data < 100.0), np.nan, data)
        
        # Calculate some statistics for verification
        valid_days = data_clean[~np.isnan(data_clean)]
        if len(valid_days) > 0:
            print(f"Data range (excluding missing values): {np.nanmin(data_clean):.2f}°C to {np.nanmax(data_clean):.2f}°C")
            print(f"Mean temperature: {np.nanmean(data_clean):.2f}°C")
        else:
            print("Warning: All data points seem to be missing (NaN).")
            
        print("\nPlotting temperature map for day 150 (mid-year/summer)...")
        day_idx = 150 # Late May
        day_temp = data_clean[day_idx]
        
        plt.figure(figsize=(10, 8))
        
        # origin='lower' puts i=0 (Lat 7.5) at the bottom
        # extent=[xmin, xmax, ymin, ymax] matches lon 67.5 to 97.5, lat 7.5 to 37.5
        im = plt.imshow(day_temp, origin='lower', extent=[67.5, 97.5, 7.5, 37.5], cmap='YlOrRd')
        
        cbar = plt.colorbar(im)
        cbar.set_label('Temperature (°C)', rotation=270, labelpad=15)
        
        plt.title(f"Max Temperature Map (Day {day_idx + 1}, 2015)")
        plt.xlabel("Longitude (°E)")
        plt.ylabel("Latitude (°N)")
        plt.grid(True, linestyle='--', alpha=0.5)
        
        output_plot_path = os.path.join("scripts", "temperature_explore_plot.png")
        plt.savefig(output_plot_path, dpi=150, bbox_inches='tight')
        print(f"Success! Plot saved to: {output_plot_path}")
        
    except Exception as e:
        print(f"Failed to process temperature data: {e}")

if __name__ == "__main__":
    main()
