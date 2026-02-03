#!/bin/bash
# File: /workspace/LiveAvatar/start_server.sh
# Purpose: Start the LiveAvatar API server with proper conda activation
# Usage: bash start_server.sh

# Add conda to PATH
export PATH="$HOME/miniconda3/bin:$PATH"

# Source conda.sh to enable conda activate
if [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
else
    echo "❌ Error: conda.sh not found. Run setup.sh first."
    exit 1
fi

# Activate environment
conda activate liveavatar

# Navigate to project directory
cd /workspace/LiveAvatar

# Verify we're in the right environment
if [[ "$CONDA_DEFAULT_ENV" != "liveavatar" ]]; then
    echo "❌ Error: Failed to activate liveavatar environment"
    exit 1
fi

# Check if api_server.py exists
if [ ! -f "api_server.py" ]; then
    echo "❌ Error: api_server.py not found"
    exit 1
fi

echo "🚀 Starting LiveAvatar API server..."
echo "📍 Server will be available at: http://0.0.0.0:8000"
echo "📖 API docs: http://YOUR_RUNPOD_IP:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python api_server.py

