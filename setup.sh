#!/bin/bash
# File: /workspace/LiveAvatar/setup.sh
# Purpose: Quick setup script for LiveAvatar after pod restart
# Usage: bash setup.sh

set -e  # Exit on any error

echo "🚀 LiveAvatar Setup Script"
echo "=========================="

# Add conda to PATH
export PATH="$HOME/miniconda3/bin:$PATH"

# Source conda.sh to enable conda activate
if [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
fi

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "📦 Installing Miniconda..."
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /tmp/miniconda.sh
    bash /tmp/miniconda.sh -b -p $HOME/miniconda3
    export PATH="$HOME/miniconda3/bin:$PATH"
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
    conda init bash
    source ~/.bashrc 2>/dev/null || true
    conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main 2>/dev/null || true
    conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/r 2>/dev/null || true
    echo "✅ Miniconda installed"
else
    echo "✅ Miniconda already installed"
    # Ensure conda.sh is sourced
    if [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
        source "$HOME/miniconda3/etc/profile.d/conda.sh"
    fi
fi

# Ensure conda is in PATH
export PATH="$HOME/miniconda3/bin:$PATH"

# Check if environment exists
if conda env list | grep -q "^liveavatar "; then
    echo "✅ Conda environment 'liveavatar' exists"
    conda activate liveavatar
else
    echo "📦 Creating conda environment 'liveavatar'..."
    conda create -n liveavatar python=3.10 -y
    conda activate liveavatar
    echo "✅ Environment created"
fi

# Verify we're in the right environment
if [[ "$CONDA_DEFAULT_ENV" != "liveavatar" ]]; then
    echo "⚠️ Activating liveavatar environment..."
    conda activate liveavatar
fi

# Check if PyTorch is installed
if python -c "import torch; print(torch.__version__)" 2>/dev/null | grep -q "2.8.0"; then
    echo "✅ PyTorch 2.8.0 already installed"
else
    echo "🔥 Installing PyTorch 2.8.0 with CUDA 12.8..."
    pip install torch==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128
    echo "✅ PyTorch installed"
fi

# Navigate to project directory
cd /workspace/LiveAvatar

# Check if requirements are installed (quick check)
if python -c "import fastapi, uvicorn, gradio" 2>/dev/null; then
    echo "✅ Core dependencies appear to be installed"
    echo "💡 If you encounter import errors, run: pip install -r requirements.txt"
else
    echo "📚 Installing project dependencies..."
    pip install -r requirements.txt
    echo "✅ Project dependencies installed"
fi

# Install FastAPI dependencies (always check/install)
echo "🌐 Installing FastAPI dependencies..."
pip install fastapi uvicorn[standard] python-multipart hf_transfer
echo "✅ FastAPI dependencies installed"

# Verify models exist
echo ""
echo "📁 Checking models..."
if [ -d "ckpt/Wan2.2-S2V-14B" ] && [ -d "ckpt/LiveAvatar" ]; then
    BASE_SIZE=$(du -sh ckpt/Wan2.2-S2V-14B/ 2>/dev/null | cut -f1)
    LORA_SIZE=$(du -sh ckpt/LiveAvatar/ 2>/dev/null | cut -f1)
    echo "✅ Base model found: $BASE_SIZE"
    echo "✅ LoRA model found: $LORA_SIZE"
else
    echo "⚠️  Models not found! You may need to download them:"
    echo "   hf download Wan-AI/Wan2.2-S2V-14B --local-dir ./ckpt/Wan2.2-S2V-14B"
    echo "   hf download Quark-Vision/Live-Avatar --local-dir ./ckpt/LiveAvatar"
fi

# Verify api_server.py exists
if [ -f "api_server.py" ]; then
    echo "✅ api_server.py found"
else
    echo "⚠️  api_server.py not found!"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   source ~/miniconda3/etc/profile.d/conda.sh"
echo "   conda activate liveavatar"
echo "   python api_server.py"
echo ""
echo "   OR use the start script:"
echo "   bash start_server.sh"
echo ""

