# Prompt for Frontend Agent Chat

Copy and paste this into your frontend agent chat:

---

## Project Update & Next Steps

Hi! I'm updating you on the current project status. You've already built a great Next.js frontend with authentication, character management, video generation, and more. Here's what's changed and what we need next:

### ✅ What's Done

1. **Git Repository**: Project is now synced with GitHub (`AgentArtel/live_avatar_artel`)
2. **Backend Files**: The RunPod backend files are now in the repo:
   - `api_server.py` - FastAPI server (fully implemented)
   - `setup.sh` and `start_server.sh` - Deployment scripts
3. **Documentation**: Complete API docs, workflow guides, and development logs added
4. **Your Frontend**: All your code is committed and pushed to GitHub

### 🎯 What We Need Next

The backend API is ready and running on RunPod. Your API client (`lib/api/client.ts`) looks correct and matches the backend endpoints. Now we need to:

**Priority 1: API Connection Testing**

Create a test page at `app/test-api/page.tsx` that:
- Tests the health check endpoint (`checkHealth()`)
- Tests the characters endpoint (`getCharacters()`)
- Shows the API base URL being used (from `NEXT_PUBLIC_API_BASE_URL`)
- Displays results clearly with success/error states
- Has individual buttons to test each endpoint

**Why**: We need to verify the frontend can actually connect to the RunPod API before testing the full generation flow.

**Priority 2: Environment Variable Validation**

Create `lib/utils/env.ts` to:
- Validate required environment variables at app startup
- Check: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Show clear error message if any are missing
- Add this check to `app/layout.tsx` or create a startup component

**Priority 3: Error Handling Improvements**

Create `lib/utils/errorHandler.ts` with:
- Centralized error handling
- User-friendly error messages (not raw error objects)
- Specific handling for: network errors, API errors (4xx/5xx), file upload errors, auth errors
- Better error display throughout the app

### 📋 Reference Files

- **API Documentation**: `docs/API.md` - Complete endpoint documentation
- **Backend Server**: `api_server.py` - See actual implementation
- **Your API Client**: `frontend/lib/api/client.ts` - Already matches backend!

### 🔍 API Endpoints (for reference)

- `GET /` - Health check
- `POST /api/generate` - Create generation (multipart/form-data: prompt, image, audio)
- `GET /api/status/{job_id}` - Check status
- `GET /api/video/{job_id}` - Download video
- `GET /api/characters` - List characters

### 💡 Prompt Style

When crafting Lovable prompts, be specific:
- ✅ "Create a test page at `app/test-api/page.tsx` that tests the health check endpoint..."
- ❌ "Test the API"

### 🎯 Current Focus

**Primary Goal**: Verify API connectivity works before building new features.

**Secondary Goal**: Improve error handling and user feedback.

Please start with Priority 1 (API Connection Testing). Once we verify the connection works, we can test the full generation flow.

---

**Full details are in `docs/FRONTEND_AGENT_UPDATE.md` if you need more context.**

