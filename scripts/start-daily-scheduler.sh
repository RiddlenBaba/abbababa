#!/bin/bash
# Abba Baba Daily Content Scheduler Startup Script

# Navigate to scripts directory
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Start the daily scheduler
echo "🚀 Starting Abba Baba Daily Content Scheduler..."
echo "📅 Schedule: 8am, 2pm, 7pm daily"
echo "📍 Working directory: $(pwd)"
echo "🔄 Press Ctrl+C to stop"

# Run the scheduler (this will keep running)
python daily-content-scheduler.py schedule