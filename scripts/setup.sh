#!/bin/bash
# Abba Baba Content Agent Setup Script

echo "🤖 Setting up Abba Baba Content Research Agent..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Make scripts executable
chmod +x content-research-agent.py
chmod +x content-scheduler.py

echo "✅ Setup complete!"
echo ""
echo "🚀 Usage Examples:"
echo "   # Generate content now:"
echo "   ./content-research-agent.py"
echo ""
echo "   # Run automated scheduler:"
echo "   python content-scheduler.py schedule"
echo ""
echo "   # Generate specific content type:"
echo "   python content-scheduler.py generate trend_analysis"
echo ""
echo "📝 Generated posts will be saved to ../_posts/ directory"
echo "🔄 Review and publish as needed"