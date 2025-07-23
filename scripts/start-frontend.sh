#!/bin/bash
# Start Next.js frontend server

echo "🚀 Starting Next.js frontend server..."

# Check if node_modules exists in frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    pnpm install
    cd ..
fi

# Navigate to frontend directory and start server
cd frontend
pnpm run dev