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
cd frontend
pnpm install
cd ..

# Copy environment file if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
    echo "⚙️ Creating environment file..."
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local - please update with your credentials"
fi

echo "🎉 Setup complete! You can now run:"
echo "  ./scripts/start-api.sh     (in Terminal 1)"
echo "  ./scripts/start-frontend.sh (in Terminal 2)"