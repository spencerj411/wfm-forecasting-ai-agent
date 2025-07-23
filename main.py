from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import pandas as pd
from prophet import Prophet
import numpy as np
from io import StringIO
import traceback
from datetime import datetime, timedelta
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def calculate_bias(y_true, y_pred):
    """Calculate bias (mean prediction error)"""
    return np.mean(y_pred - y_true)

def get_next_full_week(reference_date=None):
    """Get the start of next full week (Monday) from current date or reference date"""
    if reference_date is None:
        reference_date = datetime.now().date()
    else:
        # Convert pandas Timestamp to date if needed
        if hasattr(reference_date, 'date'):
            reference_date = reference_date.date()
        elif isinstance(reference_date, datetime):
            reference_date = reference_date.date()
    
    # Calculate days until next Monday
    days_until_monday = (7 - reference_date.weekday()) % 7
    if days_until_monday == 0:
        days_until_monday = 7
    return reference_date + timedelta(days=days_until_monday)

def validate_and_prepare_data(df):
    """Validate and prepare data for Prophet"""
    # Find date and sales columns
    date_col = next((col for col in df.columns if 'date' in col.lower()), None)
    sales_col = next((col for col in df.columns if any(term in col.lower() for term in ['sales', 'revenue', 'total'])), None)
    
    if not date_col or not sales_col:
        raise ValueError("CSV must contain 'date' and 'sales' columns")
    
    # Prepare data for Prophet
    prophet_df = pd.DataFrame({
        'ds': pd.to_datetime(df[date_col], errors='coerce'),
        'y': pd.to_numeric(df[sales_col], errors='coerce')
    })
    
    # Remove invalid data and sort
    prophet_df = prophet_df.dropna().sort_values('ds').reset_index(drop=True)
    
    if len(prophet_df) < 2:
        raise ValueError("Need at least 2 valid data points")
    
    # Ensure non-negative values
    prophet_df['y'] = prophet_df['y'].clip(lower=0)
    
    return prophet_df

def fit_prophet_model(df):
    """Fit Prophet model with validation"""
    logger.info(f"🔧 [PROPHET] Data points: {len(df)}, Date range: {df['ds'].min()} to {df['ds'].max()}")
    
    # For small datasets, use minimal seasonality to speed up training
    if len(df) < 30:
        logger.info("📉 [PROPHET] Small dataset detected, using minimal seasonality for faster training")
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            seasonality_mode='additive',
            interval_width=0.8,
            n_changepoints=min(3, len(df)//2)  # Reduce changepoints for small datasets
        )
    else:
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            interval_width=0.8
        )
    
    try:
        logger.info("⚡ [PROPHET] Starting model fit with optimized settings...")
        model.fit(df)
        logger.info("✅ [PROPHET] Model fit completed successfully")
        return model
    except Exception as e:
        logger.warning(f"⚠️ [PROPHET] Multiplicative seasonality failed: {e}")
        # Fallback to minimal additive model
        logger.info("🔄 [PROPHET] Trying fallback additive model...")
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            seasonality_mode='additive',
            interval_width=0.8,
            n_changepoints=1
        )
        model.fit(df)
        logger.info("✅ [PROPHET] Fallback model fit completed")
        return model

def calculate_model_metrics(model, train_df):
    """Calculate model performance metrics without sklearn"""
    try:
        # Generate predictions for training data
        train_forecast = model.predict(train_df[['ds']])
        y_true = train_df['y'].values
        y_pred = train_forecast['yhat'].values
        
        # Calculate metrics manually
        def mean_absolute_percentage_error(y_true, y_pred):
            return np.mean(np.abs((y_true - y_pred) / y_true))
        
        def mean_absolute_error(y_true, y_pred):
            return np.mean(np.abs(y_true - y_pred))
        
        def r2_score(y_true, y_pred):
            ss_res = np.sum((y_true - y_pred) ** 2)
            ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
            return 1 - (ss_res / ss_tot)
        
        mape = mean_absolute_percentage_error(y_true, y_pred)
        bias = calculate_bias(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
        r2 = r2_score(y_true, y_pred)
        
        return {
            'mape': float(mape),
            'bias': float(bias),
            'mae': float(mae),
            'rmse': float(rmse),
            'r2': float(r2)
        }
    except Exception as e:
        logger.error(f"Warning: Could not calculate metrics: {e}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Prophet Forecasting API (Railway)',
        'endpoints': ['POST /forecast', 'GET /health']
    })

@app.route('/forecast', methods=['POST'])
def forecast():
    """Main forecasting endpoint"""
    try:
        logger.info("🚀 Forecast API: POST request received")
        
        data = request.get_json()
        if not data or 'csv_data' not in data:
            return jsonify({'error': 'No CSV data provided'}), 400
        
        csv_content = data['csv_data']
        
        # Parse and validate CSV
        logger.info(f"📄 [DATA] Parsing CSV content ({len(csv_content)} chars)")
        df = pd.read_csv(StringIO(csv_content))
        logger.info(f"📊 [DATA] Loaded {len(df)} rows, validating...")
        prophet_df = validate_and_prepare_data(df)
        logger.info(f"✅ [DATA] Prepared {len(prophet_df)} valid rows for Prophet")
        
        # Fit Prophet model
        logger.info("🤖 [PROPHET] Training model...")
        model = fit_prophet_model(prophet_df)
        logger.info("✅ [PROPHET] Model training completed")
        
        # Calculate model performance metrics
        logger.info("📈 [METRICS] Calculating model performance...")
        metrics = calculate_model_metrics(model, prophet_df)
        if metrics:
            logger.info(f"📊 [METRICS] MAPE: {metrics['mape']*100:.2f}%, R²: {metrics['r2']:.3f}")
        
        # Generate forecast for next full week starting from current date
        current_date = datetime.now().date()
        last_data_date = prophet_df['ds'].max().date()
        next_monday = get_next_full_week()  # Use current date instead of last data date
        
        logger.info(f"📅 [FORECAST] Current date: {current_date}")
        logger.info(f"📊 [FORECAST] Latest data: {last_data_date}")
        logger.info(f"🔮 [FORECAST] Generating 7-day forecast starting {next_monday.strftime('%Y-%m-%d')}")
        
        # Create future dataframe for next full week (Monday to Sunday) from current date
        future_dates = pd.date_range(start=next_monday, periods=7, freq='D')
        future_df = pd.DataFrame({'ds': future_dates})
        
        forecast = model.predict(future_df)
        logger.info("✅ [FORECAST] Prediction completed")
        
        # Calculate confidence as inverse of prediction interval width
        forecast['confidence'] = np.where(
            forecast['yhat'] > 0,
            (100 - ((forecast['yhat_upper'] - forecast['yhat_lower']) / forecast['yhat'] * 100)).clip(0, 100),
            50  # Default confidence for zero/negative predictions
        ).round(0)
        
        # Format forecast response
        forecast_result = []
        for _, row in forecast.iterrows():
            forecast_result.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'forecast': max(0, round(float(row['yhat']), 0)),
                'confidence': int(row['confidence'])
            })
        
        # Prepare response
        response_data = {
            'forecast': forecast_result,
            'metrics': metrics,
            'data_summary': {
                'total_records': len(prophet_df),
                'date_range': {
                    'start': prophet_df['ds'].min().strftime('%Y-%m-%d'),
                    'end': prophet_df['ds'].max().strftime('%Y-%m-%d')
                },
                'average_daily_sales': float(prophet_df['y'].mean())
            }
        }
        
        logger.info(f"📤 [RESPONSE] Sending {len(forecast_result)} forecast days to client")
        return jsonify(response_data)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Forecasting failed: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)