#!/bin/bash
# Setup development environment

echo "🔧 Setting up development environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install Python dependencies
echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install -r api/requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd web
pnpm install
cd ..

# Copy environment file if it doesn't exist
if [ ! -f "web/.env.local" ]; then
    echo "⚙️ Creating environment file..."
    cp web/.env.example web/.env.local
    echo "✅ Created web/.env.local - please update with your credentials"
fi

echo "🎉 Setup complete!"
echo ""
echo "To start the application, run these commands in separate terminals:"
echo "  Terminal 1: ./scripts/start-api.sh"
echo "  Terminal 2: ./scripts/start-web.sh"