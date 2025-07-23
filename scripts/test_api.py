#!/usr/bin/env python3

import requests
import json

def test_forecast_api():
    """Test the Prophet forecasting API with the complete sample dataset"""
    
    # Read the complete sample CSV
    with open('public/sample-sales-data.csv', 'r') as f:
        csv_data = f.read()
    
    # API endpoint
    url = 'http://localhost:3000/api/forecast'
    
    # Prepare the request
    payload = {
        'csv_data': csv_data
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    print("Testing Prophet API with 3-year sample dataset...")
    print(f"Data size: {len(csv_data)} characters, {len(csv_data.split(chr(10)))} lines")
    
    try:
        # Make the request
        response = requests.post(url, data=json.dumps(payload), headers=headers, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ API call successful!")
            print(f"📊 Generated {len(result['forecast'])} day forecast")
            
            if 'metrics' in result and result['metrics']:
                metrics = result['metrics']
                print(f"📈 Model Performance:")
                print(f"  - MAPE: {metrics.get('mape', 0)*100:.2f}%")
                print(f"  - MAE: ${metrics.get('mae', 0):.0f}")
                print(f"  - RMSE: ${metrics.get('rmse', 0):.0f}")
                print(f"  - R²: {metrics.get('r2', 0):.3f}")
            
            print(f"📅 Forecast Preview:")
            for i, day in enumerate(result['forecast'][:3]):
                print(f"  {day['date']}: ${day['forecast']} (confidence: {day['confidence']}%)")
            
            if 'data_summary' in result:
                summary = result['data_summary']
                print(f"📋 Data Summary:")
                print(f"  - Records: {summary['total_records']}")
                print(f"  - Period: {summary['date_range']['start']} to {summary['date_range']['end']}")
                print(f"  - Avg Daily Sales: ${summary['average_daily_sales']:.0f}")
            
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_forecast_api()