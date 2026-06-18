#!/bin/bash
# One-command startup for Smart City Traffic Navigation System

cd "$(dirname "$0")"

# Stop any old copies of this app still running
pkill -f "python app.py" 2>/dev/null
sleep 1

# Activate virtual environment
source venv/bin/activate

# Start the server (opens on port 8080 by default)
python app.py
