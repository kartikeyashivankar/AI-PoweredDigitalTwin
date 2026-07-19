import os
import numpy as np
import pandas as pd
import xarray as xr

def process_rainfall(year):
    file_path = os.path.join("data", "raw", "rainfall", f"RF25_ind{year}_rfp25.nc")
    if not os.path.exists(file_path):
        print(f"Rainfall file for {year} not found at {file_path}")
        return None
        
    try:
        ds = xr.open_dataset(file_path)
        
        # Find coordinates/dimensions case-insensitively
        time_coord = next((c for c in ds.coords if c.lower() == 'time'), None)
        lat_dim = next((d for d in ds.sizes if d.lower() in ('latitude', 'lat')), None)
        lon_dim = next((d for d in ds.sizes if d.lower() in ('longitude', 'lon')), None)
        rain_var = next((v for v in ds.data_vars if 'rain' in v.lower() or v.lower() == 'rf'), None)
        
        if not rain_var and ds.data_vars:
            rain_var = list(ds.data_vars.keys())[0]
            
        if not time_coord or not lat_dim or not lon_dim or not rain_var:
            print(f"Error: Missing variables or dimensions in rainfall file for {year}")
            return None
            
        # Calculate daily spatial average across all grid points
        spatial_mean = ds[rain_var].mean(dim=[lat_dim, lon_dim]).values
        dates = pd.to_datetime(ds[time_coord].values).strftime('%Y-%m-%d')
        
        df = pd.DataFrame({
            'date': dates,
            'rainfall': spatial_mean
        })
        return df
    except Exception as e:
        print(f"Failed to process rainfall file for {year}: {e}")
        return None

def process_temperature(year, temp_type='max'):
    dir_name = "temperature_max" if temp_type == 'max' else "temperature_min"
    file_prefix = "Maxtemp_MaxT" if temp_type == 'max' else "Mintemp_MinT"
    col_name = "tempmax" if temp_type == 'max' else "tempmin"
    
    file_path = os.path.join("data", "raw", dir_name, f"{file_prefix}_{year}.GRD")
    if not os.path.exists(file_path):
        print(f"Temperature {temp_type} file for {year} not found at {file_path}")
        return None
        
    try:
        # Check leap year for expected days
        is_leap = (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0))
        expected_days = 366 if is_leap else 365
        
        grid_size = 31 * 31
        raw_data = np.fromfile(file_path, dtype=np.float32)
        
        # Verify length alignment
        actual_days = len(raw_data) // grid_size
        if actual_days != expected_days:
            print(f"Warning: {temp_type} file for {year} has {actual_days} days, expected {expected_days}.")
            
        # Trim or reshape to valid grids
        raw_data = raw_data[:actual_days * grid_size]
        data = raw_data.reshape((actual_days, 31, 31))
        
        # Clean missing values (marked as 99.9)
        data_clean = np.where((data > 99.0) & (data < 100.0), np.nan, data)
        
        # Calculate daily average across all spatial grid points
        daily_avg = np.nanmean(data_clean, axis=(1, 2))
        
        # Generate dates for this period
        dates = pd.date_range(start=f"{year}-01-01", periods=actual_days, freq='D').strftime('%Y-%m-%d')
        
        df = pd.DataFrame({
            'date': dates,
            col_name: daily_avg
        })
        return df
    except Exception as e:
        print(f"Failed to process temperature {temp_type} file for {year}: {e}")
        return None

def main():
    years = list(range(2015, 2026))
    year_dfs = []
    
    print("Preprocessing climate data from 2015 to 2025...")
    
    for year in years:
        print(f"\nProcessing year {year}...")
        
        # Load and process each parameter
        df_rain = process_rainfall(year)
        df_tempmax = process_temperature(year, 'max')
        df_tempmin = process_temperature(year, 'min')
        
        if df_rain is None or df_tempmax is None or df_tempmin is None:
            print(f"Skipping year {year} due to missing or failed files.")
            continue
            
        # Merge the parameters on date for this year
        df_year = df_rain.merge(df_tempmax, on='date', how='outer')
        df_year = df_year.merge(df_tempmin, on='date', how='outer')
        
        print(f"Year {year} processed successfully: {len(df_year)} rows.")
        year_dfs.append(df_year)
        
    if not year_dfs:
        print("Error: No data was successfully processed.")
        return
        
    # Concatenate all years
    df_all = pd.concat(year_dfs, ignore_index=True)
    
    # Sort and clean
    df_all = df_all.sort_values('date').reset_index(drop=True)
    
    # Create output directory
    output_dir = os.path.join("data", "processed")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "climate_data.csv")
    print(f"\nSaving preprocessed dataset to: {output_path}...")
    df_all.to_csv(output_path, index=False)
    
    print("\n--- Final Dataset Summary ---")
    print(f"Total Rows: {len(df_all)}")
    print("\nFirst 10 rows:")
    print(df_all.head(10))
    print("\nLast 10 rows:")
    print(df_all.tail(10))

if __name__ == "__main__":
    main()
