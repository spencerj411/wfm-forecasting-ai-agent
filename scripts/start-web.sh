#!/bin/bash
# Start Next.js web application (includes frontend + API routes)

echo "🚀 Starting Next.js web application..."

# Check if node_modules exists in web
if [ ! -d "web/node_modules" ]; then
    echo "📦 Installing web dependencies..."
    cd web
    pnpm install
    cd ..
fi

# Navigate to web directory and start server
cd web
pnpm run dev