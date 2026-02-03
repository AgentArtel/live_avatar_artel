# LiveAvatar - AI Video Generation Platform

A full-stack application for generating talking avatar videos using AI, with a React/Next.js frontend and FastAPI backend running on RunPod.

## 🏗️ Project Structure

```
live_avatar_artel/
├── backend/              # RunPod backend (FastAPI)
│   ├── api_server.py     # Main API server
│   ├── setup.sh          # Quick setup script
│   ├── start_server.sh   # Server startup script
│   └── README.md         # Backend documentation
├── frontend/             # Lovable frontend (Next.js/React)
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utilities and API clients
│   ├── database/         # Database schema
│   └── ...
├── docs/                 # Project documentation
│   ├── API.md            # API endpoint documentation
│   ├── WORKFLOW.md       # Development workflow
│   └── DEVELOPMENT_LOG.md # Feature tracking
├── liveavatar/           # Original LiveAvatar codebase
├── minimal_inference/    # Inference utilities
└── requirements.txt      # Python dependencies
```

## 🚀 Quick Start

### Backend (RunPod)

1. **Clone repository on RunPod:**
   ```bash
   cd /workspace
   git clone https://github.com/AgentArtel/live_avatar_artel.git LiveAvatar
   cd LiveAvatar
   ```

2. **Run setup:**
   ```bash
   bash backend/setup.sh
   ```

3. **Start server:**
   ```bash
   bash backend/start_server.sh
   ```

4. **Verify:**
   ```bash
   curl http://localhost:8000/
   ```

### Frontend (Lovable)

1. Import project into Lovable.dev
2. Connect to database (Supabase or Lovable built-in)
3. Run database schema: `frontend/database/schema.sql`
4. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-runpod-url`
5. Start development server

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Development Workflow](docs/WORKFLOW.md)** - How we work together
- **[Development Log](docs/DEVELOPMENT_LOG.md)** - Feature tracking
- **[Backend README](backend/README.md)** - Backend setup and deployment

## 🔌 API Endpoints

- `GET /` - Health check
- `POST /api/generate` - Create video generation job
- `GET /api/status/{job_id}` - Check job status
- `GET /api/video/{job_id}` - Download generated video
- `GET /api/characters` - List available characters

See [API.md](docs/API.md) for detailed documentation.

## 🛠️ Tech Stack

### Backend
- Python 3.10
- FastAPI
- PyTorch 2.8.0 (CUDA 12.8)
- LiveAvatar models (14B parameters)

### Frontend
- Next.js 14+
- React
- TypeScript
- Tailwind CSS
- Supabase (database & auth)

## 📋 Development Workflow

1. **Planning**: Discuss features with Senior Dev
2. **Prompting**: Frontend Agent crafts Lovable prompts
3. **Implementation**: Execute in Lovable.dev
4. **Review**: Review and iterate on responses
5. **Testing**: Test with RunPod API
6. **Documentation**: Update logs and docs
7. **Commit**: Push to GitHub

See [WORKFLOW.md](docs/WORKFLOW.md) for details.

## 🔄 Git Workflow

### Sync with RunPod

```bash
# On RunPod
cd /workspace/LiveAvatar
git pull origin main
```

### Sync with Mac

```bash
# On Mac
cd /path/to/project
git pull origin main
```

### Commit Changes

```bash
git add .
git commit -m "feat: Description of changes"
git push origin main
```

## 📝 Environment Variables

### Backend (RunPod)
- `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`
- `ENABLE_FP8=false` (A100 doesn't support fp8e4nv)

### Frontend (Lovable)
- `NEXT_PUBLIC_API_URL` - RunPod API URL
- Supabase credentials (if using Supabase)

## 🐛 Troubleshooting

### Backend Issues
- **FP8 Error**: Disabled for A100 compatibility
- **Memory Issues**: Enable all optimizations (T5_CPU, KV_Offload, Model_Offload)
- **Port Issues**: Ensure port 8000 is exposed in RunPod HTTP services

### Frontend Issues
- **API Connection**: Verify RunPod URL is correct
- **CORS Errors**: Backend has CORS enabled for all origins
- **Database**: Ensure schema is imported correctly

## 📞 Support

- **Backend Issues**: Check RunPod logs
- **Frontend Issues**: Review Lovable output
- **API Issues**: Test with `curl` first

## 📄 License

See [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- Original LiveAvatar project by Alibaba-Quark
- RunPod for GPU infrastructure
- Lovable.dev for frontend development
