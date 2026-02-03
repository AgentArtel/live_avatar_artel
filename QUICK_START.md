# LiveAvatar Quick Start Guide

## After Pod Restart

### 1. Run Setup Script
```bash
cd /workspace/LiveAvatar
bash setup.sh
```

This script will:
- ✅ Check/install Miniconda
- ✅ Create/activate conda environment
- ✅ Install PyTorch 2.8.0 with CUDA 12.8
- ✅ Install project dependencies
- ✅ Install FastAPI dependencies
- ✅ Verify models and code exist

**Time:** ~10-15 minutes (models already persist on volume disk)

### 2. Start Server

**Option A: Use the start script (Recommended)**
```bash
cd /workspace/LiveAvatar
bash start_server.sh
```

**Option B: Manual start**
```bash
source ~/miniconda3/etc/profile.d/conda.sh
conda activate liveavatar
cd /workspace/LiveAvatar
python api_server.py
```

The `start_server.sh` script automatically handles conda activation and environment verification.

### 3. Verify Server is Running
In a new terminal or via RunPod web terminal:
```bash
curl http://localhost:8000/
```

**Expected response:**
```json
{
  "status": "online",
  "pipeline_initialized": true,
  "gpu_available": true
}
```

### 4. Access API Documentation
Once the server is running and port 8000 is exposed via HTTP Service:
- **Interactive docs:** `https://YOUR_RUNPOD_URL/docs`
- **Alternative docs:** `https://YOUR_RUNPOD_URL/redoc`

## What Persists (on Volume Disk)

These are saved and persist across pod restarts:

- ✅ **Models:** `ckpt/Wan2.2-S2V-14B/` (~46GB)
- ✅ **LoRA:** `ckpt/LiveAvatar/` (~1.3GB)
- ✅ **Code:** All files in `/workspace/LiveAvatar/`
- ✅ **Generated outputs:** `outputs/`
- ✅ **Setup script:** `setup.sh`

## What Needs Reinstallation

These are recreated by `setup.sh` after restart:

- ❌ Conda environment (recreated automatically)
- ❌ Python packages (reinstalled automatically)
- ⏱️ Takes ~10-15 minutes after restart

## API Endpoints

### Health Check
```bash
GET /
```
Returns server status and pipeline initialization state.

### Generate Video
```bash
POST /api/generate
```
Creates a new video generation job. Requires:
- `image` (file upload)
- `audio` (file upload)
- `prompt` (text)
- Optional: `size`, `sample_steps`, `infer_frames`, etc.

Returns: `job_id` for status checking.

### Check Job Status
```bash
GET /api/status/{job_id}
```
Returns job status: `pending`, `processing`, `completed`, or `failed`.

### Download Video
```bash
GET /api/video/{job_id}
```
Downloads the generated video file.

### List Characters
```bash
GET /api/characters
```
Returns available character configurations.

## Troubleshooting

### "conda: command not found"
```bash
export PATH="$HOME/miniconda3/bin:$PATH"
source "$HOME/miniconda3/etc/profile.d/conda.sh"
```

### "CondaError: Run 'conda init'"
The setup script handles this automatically. If you see this error manually:
```bash
conda init bash
source ~/.bashrc
```

### Models Missing
If models weren't downloaded or got deleted:
```bash
# Base model (~46GB, takes 15-20 minutes)
hf download Wan-AI/Wan2.2-S2V-14B --local-dir ./ckpt/Wan2.2-S2V-14B

# LoRA model (~1.3GB, takes 1-2 minutes)
hf download Quark-Vision/Live-Avatar --local-dir ./ckpt/LiveAvatar
```

### Port 8000 Not Accessible
1. Go to RunPod dashboard
2. Open your pod
3. Click "Edit Pod"
4. In "Expose HTTP ports", add: `8888, 8000`
5. Click "Save" (pod will restart)
6. After restart, go to "Connect" tab
7. Find the URL for port 8000
8. Use that URL in your frontend

### Server Won't Start
Check the logs for errors:
```bash
python api_server.py
```

Common issues:
- **CUDA out of memory:** Model too large for GPU (shouldn't happen with A100 40GB)
- **Missing dependencies:** Run `bash setup.sh` again
- **Port already in use:** Kill existing process: `pkill -f api_server.py`

### Pipeline Initialization Fails
- Check GPU availability: `nvidia-smi`
- Verify models exist: `ls -lh ckpt/Wan2.2-S2V-14B/`
- Check logs for specific error messages

## Testing the API

### Using the Test Script
1. Update `test_api.py` with your RunPod URL:
   ```python
   RUNPOD_URL = "https://YOUR_RUNPOD_URL-8000.proxy.runpod.net"
   ```

2. Run tests:
   ```bash
   # Basic tests
   python test_api.py
   
   # Full test with video generation
   python test_api.py examples/boy.jpg examples/boy.wav "A boy speaking"
   ```

### Using curl
```bash
# Health check
curl https://YOUR_RUNPOD_URL/

# Generate video
curl -X POST "https://YOUR_RUNPOD_URL/api/generate" \
  -F "prompt=test" \
  -F "image=@examples/boy.jpg" \
  -F "audio=@examples/boy.wav"

# Check status (replace JOB_ID)
curl https://YOUR_RUNPOD_URL/api/status/JOB_ID

# Download video (replace JOB_ID)
curl https://YOUR_RUNPOD_URL/api/video/JOB_ID --output video.mp4
```

## Integration with Lovable Frontend

In your Lovable frontend code:

```javascript
const API_BASE_URL = "https://YOUR_RUNPOD_URL-8000.proxy.runpod.net";

// Health check
const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/`);
  return await response.json();
};

// Generate video
const generateVideo = async (imageFile, audioFile, prompt) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('audio', audioFile);
  formData.append('prompt', prompt);
  formData.append('size', '704*384');
  formData.append('sample_steps', '4');
  formData.append('infer_frames', '48');

  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Poll for status
const checkStatus = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
  return await response.json();
};

// Download video
const downloadVideo = (jobId) => {
  return `${API_BASE_URL}/api/video/${jobId}`;
};
```

## Time Estimates

- **First setup:** ~30-45 minutes (downloads models)
- **After restart:** ~10-15 minutes (reinstall packages, models already there)
- **Video generation:** ~2-5 minutes per video (depends on length and settings)

## Next Steps

1. ✅ Run `setup.sh` after pod restart
2. ✅ Start server with `bash start_server.sh` (or `python api_server.py`)
3. ✅ Get your RunPod HTTP Service URL
4. ✅ Test API endpoints
5. ✅ Integrate with Lovable frontend

For more details, see `API_TESTING_GUIDE.md` and `test_api.py`.

