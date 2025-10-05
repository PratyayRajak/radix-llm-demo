#!/bin/bash

# AI Scrypto Compliance Engineer - Demo Runner
# This script runs the complete demo

echo "🚀 AI Scrypto Compliance Engineer - Demo Mode"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  IMPORTANT: Please add your OPENAI_API_KEY to .env.local"
    echo "   Get your key from: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press Enter after adding your API key to continue..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "🌐 Starting development server..."
echo "   The dashboard will open at http://localhost:3000"
echo ""
echo "💡 Demo Instructions:"
echo "   1. Click any demo prompt button to load an example"
echo "   2. Click 'Generate & Test' to run the AI"
echo "   3. Watch real-time progress with retry logic"
echo "   4. Check Results tab for test history"
echo "   5. View Metrics tab for success statistics"
echo ""
echo "🎯 Success Signals:"
echo "   ✓ AI generates Scrypto code"
echo "   ✓ Code is extracted and written to files"
echo "   ✓ Tests run automatically"
echo "   ✓ Failed tests trigger AI retry with error feedback"
echo "   ✓ Results logged to JSON"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=============================================="
echo ""

# Start the dev server
npm run dev