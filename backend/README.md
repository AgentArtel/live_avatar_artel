# Backend (RunPod)

This directory contains the backend code that runs on RunPod.

## Files (to be synced from RunPod)

- `api_server.py` - FastAPI server for LiveAvatar API
- `setup.sh` - Quick setup script for pod restarts
- `start_server.sh` - Server startup script
- `requirements.txt` - Python dependencies (already in root)

## Setup on RunPod

After cloning this repo on RunPod:

```bash
cd /workspace/LiveAvatar
bash backend/setup.sh
bash backend/start_server.sh
```

## API Endpoints

See `docs/API.md` for full API documentation.

## Deployment

The backend runs on RunPod and serves the API at:
- Health: `GET /`
- Generate: `POST /api/generate`
- Status: `GET /api/status/{job_id}`
- Video: `GET /api/video/{job_id}`
- Characters: `GET /api/characters`

