#!/usr/bin/env python3
"""
Minimal local test server using Python's built-in http.server
No additional dependencies - uses only standard library + existing Prophet deps
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import os
import traceback
from urllib.parse import urlparse

# Add the api directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../api'))

# We'll import forecast functions directly in the handler

class LocalTestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Route POST requests to the appropriate handler"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/forecast':
            print("🚀 [FORECAST] POST request received")
            
            try:
                # Read request data directly
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                csv_content = data.get('csv_data', '')
                
                if not csv_content:
                    self._send_error(400, "No CSV data provided")
                    return
                
                print("📊 [FORECAST] Starting Prophet forecasting pipeline...")
                
                # Import Prophet functions directly
                from forecast import validate_and_prepare_data, fit_prophet_model, calculate_model_metrics, get_next_full_week
                import pandas as pd
                from io import StringIO
                from datetime import datetime, timedelta
                import numpy as np
                
                # Process the data directly
                df = pd.read_csv(StringIO(csv_content))
                print(f"📄 [DATA] Loaded {len(df)} rows")
                prophet_df = validate_and_prepare_data(df)
                print(f"✅ [DATA] Prepared {len(prophet_df)} valid rows for Prophet")
                
                # Fit model
                print("🤖 [PROPHET] Training model...")
                model = fit_prophet_model(prophet_df)
                print("✅ [PROPHET] Model training completed")
                
                # Calculate metrics
                metrics = calculate_model_metrics(model, prophet_df)
                if metrics:
                    print(f"📊 [METRICS] MAPE: {metrics['mape']*100:.2f}%, R²: {metrics['r2']:.3f}")
                
                # Generate forecast for next full week starting from current date
                from datetime import datetime
                current_date = datetime.now().date()
                last_data_date = prophet_df['ds'].max().date()
                next_monday = get_next_full_week()  # Use current date instead of last data date
                
                print(f"📅 [FORECAST] Current date: {current_date}")
                print(f"📊 [FORECAST] Latest data: {last_data_date}")
                print(f"🔮 [FORECAST] Generating 7-day forecast starting {next_monday.strftime('%Y-%m-%d')}")
                
                future_dates = pd.date_range(start=next_monday, periods=7, freq='D')
                future_df = pd.DataFrame({'ds': future_dates})
                forecast = model.predict(future_df)
                
                # Calculate confidence
                forecast['confidence'] = np.where(
                    forecast['yhat'] > 0,
                    (100 - ((forecast['yhat_upper'] - forecast['yhat_lower']) / forecast['yhat'] * 100)).clip(0, 100),
                    50
                ).round(0)
                
                # Format response
                forecast_result = []
                for _, row in forecast.iterrows():
                    forecast_result.append({
                        'date': row['ds'].strftime('%Y-%m-%d'),
                        'forecast': max(0, round(float(row['yhat']), 0)),
                        'confidence': int(row['confidence'])
                    })
                
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
                
                print(f"📤 [RESPONSE] Sending {len(forecast_result)} forecast days to client")
                self._send_success(response_data)
                
            except Exception as e:
                print(f"❌ [FORECAST] Error in handler: {str(e)}")
                print(f"🔍 [FORECAST] Traceback: {traceback.format_exc()}")
                self._send_error(500, f'Server error: {str(e)}')
                
        else:
            print(f"❌ [SERVER] 404 - Path not found: {parsed_path.path}")
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = json.dumps({'error': 'Not Found'})
            self.wfile.write(response.encode('utf-8'))
    
    def _send_success(self, data):
        """Send successful JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = json.dumps(data)
        self.wfile.write(response.encode('utf-8'))
    
    def _send_error(self, code, message):
        """Send error JSON response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = json.dumps({'error': message})
        self.wfile.write(response.encode('utf-8'))
    
    def do_GET(self):
        """Handle GET requests for health check"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = json.dumps({
                'status': 'healthy',
                'service': 'Prophet Forecasting API (Local)',
                'endpoints': ['POST /api/forecast', 'GET /health']
            })
            self.wfile.write(response.encode('utf-8'))
        else:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = json.dumps({
                'message': 'WFM Prophet Forecasting API (Local Test Server)',
                'endpoints': {
                    'forecast': 'POST /api/forecast',
                    'health': 'GET /health'
                }
            })
            self.wfile.write(response.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"🌐 {self.address_string()} - {format % args}")

def run_server(port=5000):
    """Start the local test server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, LocalTestHandler)
    
    print("🚀 WFM Prophet API Local Test Server")
    print("─" * 50)
    print(f"📍 API Endpoint: http://localhost:{port}/api/forecast")  
    print(f"🏥 Health Check: http://localhost:{port}/health")
    print("💡 Start Next.js on port 3000 for full-stack testing")
    print("⏹️  Press Ctrl+C to stop")
    print("─" * 50)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Local Prophet API test server')
    parser.add_argument('--port', type=int, default=5000, help='Port to run on (default: 5000)')
    args = parser.parse_args()
    
    run_server(args.port)