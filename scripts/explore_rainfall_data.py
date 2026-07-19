import os
import xarray as xr
import matplotlib.pyplot as plt

def main():
    # Path to NetCDF file relative to workspace root
    file_path = os.path.join("data", "raw", "rainfall", "RF25_ind2025_rfp25.nc")
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    print("Loading NetCDF dataset...")
    try:
        # Load dataset
        ds = xr.open_dataset(file_path)
    except Exception as e:
        print(f"Failed to open NetCDF file: {e}")
        print("Note: You may need to install 'netcdf4', 'h5netcdf', or 'scipy' for xarray to read .nc files.")
        return

    print("\n--- Basic Dataset Info ---")
    print(ds)
    
    print("\n--- Dimensions ---")
    for dim, size in ds.sizes.items():
        print(f"Dimension '{dim}': size {size}")

    print("\n--- Variables ---")
    for var in ds.data_vars:
        long_name = ds[var].attrs.get('long_name', var)
        print(f"Variable '{var}': {long_name} ({ds[var].dtype})")

    # Find time coordinate case-insensitively
    time_coord = None
    for coord in ds.coords:
        if coord.lower() == 'time':
            time_coord = coord
            break

    if time_coord:
        times = ds.coords[time_coord].values
        print(f"\nDate Range: {times[0]} to {times[-1]}")
        print(f"Total time steps: {len(times)}")
    else:
        print("\nCoordinate 'time' or 'TIME' not found in dataset.")

    # Identify the main rainfall variable (commonly 'rainfall' or 'rf')
    rain_var = None
    for var in ds.data_vars:
        if 'rain' in var.lower() or var.lower() == 'rf':
            rain_var = var
            break

    if not rain_var:
        if ds.data_vars:
            rain_var = list(ds.data_vars.keys())[0]

    if not rain_var:
        print("Error: No data variables found in dataset.")
        return

    print(f"\nPlotting rainfall map using variable: '{rain_var}'...")
    
    try:
        # Select first time step slice along the time dimension
        if time_coord:
            day_data = ds[rain_var].isel({time_coord: 0})
            # Convert numpy datetime to string
            date_val = ds.coords[time_coord].values[0]
            if hasattr(date_val, 'astype'):
                date_str = str(date_val.astype('datetime64[D]'))
            else:
                date_str = str(date_val)[:10]
        else:
            if len(ds[rain_var].dims) > 2:
                first_dim = ds[rain_var].dims[0]
                day_data = ds[rain_var].isel({first_dim: 0})
                date_str = "First Step"
            else:
                day_data = ds[rain_var]
                date_str = "Static Map"
            
        plt.figure(figsize=(10, 8))
        day_data.plot(cmap='Blues', robust=True)
        plt.title(f"Rainfall map - {date_str} ({rain_var})")
        plt.xlabel("Longitude")
        plt.ylabel("Latitude")
        
        # Save plot to scripts folder for preview
        output_plot_path = os.path.join("scripts", "rainfall_explore_plot.png")
        plt.savefig(output_plot_path, dpi=150, bbox_inches='tight')
        print(f"Success! Plot saved to: {output_plot_path}")
        
    except Exception as e:
        print(f"Failed to plot rainfall map: {e}")
        print("Note: You may need to install 'matplotlib' to generate plots.")

if __name__ == "__main__":
    main()
