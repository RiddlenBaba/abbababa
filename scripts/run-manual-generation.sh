#!/bin/bash
# Quick manual content generation script

cd "$(dirname "$0")"
source venv/bin/activate

echo "🤖 Abba Baba Manual Content Generator"
echo "Choose content type:"
echo "1) Trend Analysis (default)"
echo "2) Tool Spotlight"
echo "3) Innovation Deep Dive"
echo ""

read -p "Enter choice (1-3) or press Enter for default: " choice

case $choice in
    2)
        content_type="tool_spotlight"
        ;;
    3)
        content_type="innovation_deep_dive"
        ;;
    *)
        content_type="trend_analysis"
        ;;
esac

echo "📝 Generating $content_type content..."
python daily-content-scheduler.py generate $content_type