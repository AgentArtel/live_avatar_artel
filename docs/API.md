# LiveAvatar API Documentation

## Base URL

```
https://[your-runpod-id]-8000.proxy.runpod.net
```

## Endpoints

### Health Check

**GET /** 

Check if the server is running and pipeline is initialized.

**Response:**
```json
{
  "status": "online",
  "pipeline_initialized": true,
  "gpu_available": true
}
```

---

### Create Video Generation

**POST /api/generate**

Create a new video generation job.

**Request (multipart/form-data):**
- `prompt` (string, required) - Text description for the video
- `image` (file, required) - Character image (JPG/PNG)
- `audio` (file, required) - Audio file (WAV/MP3)
- `size` (string, optional) - Video size, default: "704*384"
- `sample_steps` (int, optional) - Sampling steps, default: 4
- `infer_frames` (int, optional) - Number of frames, default: 48
- `base_seed` (int, optional) - Random seed
- `sample_solver` (string, optional) - Solver type, default: "euler"

**Response:**
```json
{
  "job_id": "abc-123-def-456",
  "status": "pending",
  "message": "Generation job created successfully"
}
```

**Example:**
```bash
curl -X POST "https://your-url/api/generate" \
  -F "prompt=a person speaking naturally" \
  -F "image=@character.jpg" \
  -F "audio=@audio.wav"
```

---

### Check Job Status

**GET /api/status/{job_id}**

Get the current status of a generation job.

**Response:**
```json
{
  "job_id": "abc-123-def-456",
  "status": "pending|processing|completed|failed",
  "progress": null,
  "video_url": "/api/video/abc-123-def-456",
  "error": null,
  "created_at": "2026-02-03T20:00:00",
  "completed_at": "2026-02-03T20:05:00"
}
```

**Status Values:**
- `pending` - Job created, waiting to start
- `processing` - Currently generating video
- `completed` - Video ready for download
- `failed` - Generation failed (check `error` field)

---

### Download Video

**GET /api/video/{job_id}**

Download the generated video file.

**Response:**
- Content-Type: `video/mp4`
- File: MP4 video file

**Example:**
```bash
curl "https://your-url/api/video/abc-123-def-456" --output video.mp4
```

---

### List Characters

**GET /api/characters**

Get list of available characters.

**Response:**
```json
{
  "characters": [
    {
      "id": "default",
      "name": "Default Character",
      "image_url": null,
      "lora_path": "Quark-Vision/Live-Avatar"
    }
  ]
}
```

---

## Error Responses

All endpoints may return errors in this format:

```json
{
  "detail": "Error message here"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (job_id doesn't exist)
- `503` - Service Unavailable (pipeline not initialized)

---

## Rate Limiting

Currently no rate limiting is implemented. Be mindful of GPU resources.

---

## File Size Limits

- Image: Recommended max 10MB
- Audio: Recommended max 50MB

---

## Polling Strategy

For checking job status, poll every 5 seconds:

```typescript
async function pollJobStatus(jobId: string) {
  const maxAttempts = 120; // 10 minutes max
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const status = await fetch(`${API_URL}/api/status/${jobId}`);
    const data = await status.json();
    
    if (data.status === 'completed' || data.status === 'failed') {
      return data;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }
  
  throw new Error('Job timeout');
}
```

