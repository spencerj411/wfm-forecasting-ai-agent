#!/bin/bash
# Start Flask API server

echo "🚀 Starting Flask API server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Navigate to API directory and start server
cd api
PORT=8000 python main.py