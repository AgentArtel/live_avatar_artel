"""
FastAPI Server for LiveAvatar API
Deploy this on RunPod to serve requests from Lovable frontend
"""
import os
import sys
import uuid
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime
import shutil

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import torch
import torch.distributed as dist

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from minimal_inference.gradio_app import initialize_pipeline, _run_inference_computation
from liveavatar.utils.args_config import parse_args_for_training_config
from liveavatar.models.wan.wan_2_2.utils.utils import str2bool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="LiveAvatar API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline_initialized = False
pipeline_args = None
pipeline_settings = None

jobs = {}
output_dir = Path("/workspace/LiveAvatar/outputs")
output_dir.mkdir(exist_ok=True)


class GenerationRequest(BaseModel):
    prompt: str
    character_id: Optional[str] = None
    size: str = "704*384"
    sample_steps: int = 4
    sample_guide_scale: float = 0.0
    infer_frames: int = 48
    base_seed: int = 420
    sample_solver: str = "euler"


class GenerationResponse(BaseModel):
    job_id: str
    status: str
    message: str


class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: Optional[float] = None
    video_url: Optional[str] = None
    error: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None


@app.on_event("startup")
async def startup_event():
    """Initialize the pipeline when server starts"""
    global pipeline_initialized, pipeline_args, pipeline_settings
    
    logger.info("Initializing LiveAvatar pipeline...")
    
    # Set PyTorch CUDA memory allocation config to reduce fragmentation
    os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
    
    # Clear any existing GPU memory before initialization
    if torch.cuda.is_available():
        logger.info("Clearing GPU memory before initialization...")
        torch.cuda.empty_cache()
        import gc
        gc.collect()
        torch.cuda.empty_cache()
        logger.info(f"GPU memory after cleanup: {torch.cuda.memory_allocated() / 1024**3:.2f} GB allocated")
    
    os.environ["RANK"] = "0"
    os.environ["WORLD_SIZE"] = "1"
    os.environ["LOCAL_RANK"] = "0"
    
    if not dist.is_initialized():
        dist.init_process_group(
            backend="gloo",
            init_method="tcp://localhost:29500",
            rank=0,
            world_size=1
        )
    
    import argparse
    parser = argparse.ArgumentParser()
    
    # Required arguments for pipeline initialization
    parser.add_argument("--task", type=str, default="s2v-14B")
    parser.add_argument("--size", type=str, default="704*384")
    parser.add_argument("--base_seed", type=int, default=420)
    parser.add_argument("--training_config", type=str, default="liveavatar/configs/s2v_causal_sft.yaml")
    parser.add_argument("--offload_model", type=str2bool, default=True)
    parser.add_argument("--convert_model_dtype", action="store_true", default=False)
    parser.add_argument("--infer_frames", type=int, default=48)
    parser.add_argument("--load_lora", action="store_true", default=True)
    parser.add_argument("--lora_path_dmd", type=str, default="Quark-Vision/Live-Avatar")
    parser.add_argument("--sample_steps", type=int, default=4)
    parser.add_argument("--sample_guide_scale", type=float, default=0.0)
    parser.add_argument("--num_clip", type=int, default=100)
    parser.add_argument("--num_gpus_dit", type=int, default=1)
    parser.add_argument("--sample_solver", type=str, default="euler")
    parser.add_argument("--single_gpu", action="store_true", default=True)
    parser.add_argument("--ckpt_dir", type=str, default="/workspace/LiveAvatar/ckpt/Wan2.2-S2V-14B/")
    parser.add_argument("--fp8", action="store_true", default=False)
    
    # Missing arguments that are required
    parser.add_argument("--ulysses_size", type=int, default=1)
    parser.add_argument("--t5_fsdp", action="store_true", default=False)
    parser.add_argument("--t5_cpu", action="store_true", default=False)
    parser.add_argument("--dit_fsdp", action="store_true", default=False)
    parser.add_argument("--save_dir", type=str, default="./output/gradio/")
    parser.add_argument("--sample_shift", type=float, default=None)
    parser.add_argument("--frame_num", type=int, default=None)
    parser.add_argument("--lora_path", type=str, default=None)
    parser.add_argument("--using_merged_ckpt", action="store_true", default=False)
    parser.add_argument("--enable_vae_parallel", action="store_true", default=False)
    parser.add_argument("--offload_kv_cache", action="store_true", default=False)
    parser.add_argument("--enable_tts", action="store_true", default=False)
    parser.add_argument("--pose_video", type=str, default=None)
    parser.add_argument("--start_from_ref", action="store_true", default=False)
    parser.add_argument("--drop_motion_noisy", action="store_true", default=False)
    parser.add_argument("--server_port", type=int, default=7860)
    parser.add_argument("--server_name", type=str, default="0.0.0.0")
    
    args = parser.parse_args([])
    
    # Ensure single GPU settings
    args.single_gpu = True
    args.enable_vae_parallel = False
    args.ulysses_size = 1
    args.t5_fsdp = False
    args.dit_fsdp = False
    
    training_settings = parse_args_for_training_config(args.training_config)
    
    try:
        initialize_pipeline(args, training_settings)
        pipeline_initialized = True
        pipeline_args = args
        pipeline_settings = training_settings
        logger.info("✅ Pipeline initialized successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to initialize pipeline: {e}")
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "pipeline_initialized": pipeline_initialized,
        "gpu_available": torch.cuda.is_available()
    }


@app.post("/api/generate", response_model=GenerationResponse)
async def create_generation(
    request: GenerationRequest,
    image: UploadFile = File(...),
    audio: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Create a new video generation job
    Returns a job_id that can be used to check status
    """
    if not pipeline_initialized:
        raise HTTPException(status_code=503, detail="Pipeline not initialized")
    
    job_id = str(uuid.uuid4())
    temp_dir = output_dir / job_id
    temp_dir.mkdir(exist_ok=True)
    
    image_path = temp_dir / "image.jpg"
    audio_path = temp_dir / "audio.wav"
    
    try:
        with open(image_path, "wb") as f:
            shutil.copyfileobj(image.file, f)
        with open(audio_path, "wb") as f:
            shutil.copyfileobj(audio.file, f)
        
        jobs[job_id] = {
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "image_path": str(image_path),
            "audio_path": str(audio_path),
            "request": request.dict()
        }
        
        background_tasks.add_task(
            process_generation,
            job_id,
            request,
            str(image_path),
            str(audio_path)
        )
        
        return GenerationResponse(
            job_id=job_id,
            status="pending",
            message="Generation job created successfully"
        )
    
    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_generation(
    job_id: str,
    request: GenerationRequest,
    image_path: str,
    audio_path: str
):
    """Background task to process video generation"""
    try:
        jobs[job_id]["status"] = "processing"
        
        video_path = _run_inference_computation(
            prompt=request.prompt,
            image_path=image_path,
            audio_path=audio_path,
            num_clip=100,
            sample_steps=request.sample_steps,
            sample_guide_scale=request.sample_guide_scale,
            infer_frames=request.infer_frames,
            size=request.size,
            base_seed=request.base_seed,
            sample_solver=request.sample_solver
        )
        
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["video_path"] = video_path
        jobs[job_id]["video_url"] = f"/api/video/{job_id}"
        jobs[job_id]["completed_at"] = datetime.now().isoformat()
        
        logger.info(f"✅ Generation {job_id} completed: {video_path}")
    
    except Exception as e:
        logger.error(f"❌ Generation {job_id} failed: {e}")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["completed_at"] = datetime.now().isoformat()


@app.get("/api/status/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Get the status of a generation job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    return JobStatus(
        job_id=job_id,
        status=job["status"],
        video_url=job.get("video_url"),
        error=job.get("error"),
        created_at=job["created_at"],
        completed_at=job.get("completed_at")
    )


@app.get("/api/video/{job_id}")
async def get_video(job_id: str):
    """Download the generated video"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Video not ready yet")
    
    video_path = job.get("video_path")
    if not video_path or not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"generation_{job_id}.mp4"
    )


@app.get("/api/characters")
async def list_characters():
    """List available characters (from database)"""
    return {
        "characters": [
            {
                "id": "default",
                "name": "Default Character",
                "image_url": None,
                "lora_path": "Quark-Vision/Live-Avatar"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

