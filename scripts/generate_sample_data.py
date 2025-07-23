import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Load the real sales data to get statistical properties
real_data_df = pd.read_csv('temp/weather-sales-data.csv')
real_data_df['Date'] = pd.to_datetime(real_data_df['Date'], format='%m/%d/%y', errors='coerce')
real_data_df.dropna(subset=['Date', 'DailyTotal'], inplace=True)

# Get statistical properties from real data
mean_demand = real_data_df['DailyTotal'].mean()
std_demand = real_data_df['DailyTotal'].std()
min_demand = real_data_df['DailyTotal'].min()
max_demand = real_data_df['DailyTotal'].max()

print(f"Real data stats - Mean: {mean_demand:.0f}, Std: {std_demand:.0f}, Min: {min_demand:.0f}, Max: {max_demand:.0f}")

# Generate 3 years of realistic synthetic sales data
np.random.seed(42)  # For reproducible results
start_date = datetime(2022, 1, 1)
periods = 365 * 3  # 3 years
dates = pd.date_range(start_date, periods=periods)

# Base demand with slight upward trend over 3 years
base_demand = np.linspace(mean_demand * 0.95, mean_demand * 1.15, periods)

# Seasonality components (more realistic patterns)
days_array = np.arange(periods)

# Weekly seasonality (stronger on weekends)
weekly_seasonality = std_demand * 0.25 * np.sin(2 * np.pi * days_array / 7)
# Weekend boost
weekend_boost = np.where(pd.Series(dates).dt.dayofweek >= 5, std_demand * 0.15, 0)

# Monthly seasonality (end of month effects)
monthly_seasonality = std_demand * 0.12 * np.sin(2 * np.pi * days_array / 30.44)

# Yearly seasonality (holiday seasons)
yearly_seasonality = std_demand * 0.35 * np.sin(2 * np.pi * days_array / 365.25)

# Holiday spikes (Christmas, Easter, etc.)
holiday_spikes = np.zeros(periods)
for year in [2022, 2023, 2024]:
    # Christmas period
    christmas_start = (datetime(year, 12, 20) - start_date).days
    christmas_end = (datetime(year, 12, 31) - start_date).days
    if 0 <= christmas_start < periods:
        for day in range(max(0, christmas_start), min(periods, christmas_end + 1)):
            holiday_spikes[day] = mean_demand * 0.4
    
    # Easter period (approximate)
    easter_start = (datetime(year, 4, 10) - start_date).days
    easter_end = (datetime(year, 4, 17) - start_date).days
    if 0 <= easter_start < periods:
        for day in range(max(0, easter_start), min(periods, easter_end + 1)):
            holiday_spikes[day] = mean_demand * 0.25

# Random events/promotions (15-20 random spikes per year)
event_spikes = np.zeros(periods)
events_per_year = 18
total_events = events_per_year * 3
event_indices = np.random.choice(np.arange(periods), total_events, replace=False)
event_spikes[event_indices] = np.random.uniform(mean_demand * 0.3, mean_demand * 0.8, total_events)

# Noise
noise = np.random.normal(0, std_demand * 0.12, periods)

# Occasional outliers (both positive and negative)
outliers = np.zeros(periods)
outlier_indices = np.random.choice(np.arange(periods), 25, replace=False)
outliers[outlier_indices] = np.random.uniform(-mean_demand * 0.3, mean_demand * 0.6, 25)

# Combine all components
demand = (base_demand + weekly_seasonality + weekend_boost + monthly_seasonality + 
          yearly_seasonality + holiday_spikes + event_spikes + noise + outliers)

# Ensure demand is non-negative and within realistic bounds
demand = np.maximum(50, demand)  # Minimum sales of 50
demand = np.minimum(demand, max_demand * 1.5)  # Cap at 1.5x historical max

# Create DataFrame
df = pd.DataFrame({
    'date': dates,
    'sales': demand.round(0).astype(int)
})

# Save to CSV
df.to_csv('sample-sales-data.csv', index=False)

print(f"Generated {len(df)} days of data from {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
print(f"Generated data stats - Mean: {df['sales'].mean():.0f}, Std: {df['sales'].std():.0f}, Min: {df['sales'].min():.0f}, Max: {df['sales'].max():.0f}")
print("Sample data saved as 'sample-sales-data.csv'")

# Show first few rows
print("\nFirst 10 rows:")
print(df.head(10).to_string(index=False))