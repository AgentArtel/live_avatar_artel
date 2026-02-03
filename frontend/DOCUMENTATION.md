# LiveAvatar Frontend Documentation

This document provides comprehensive documentation for the LiveAvatar frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Database Schema](#database-schema)
5. [API Integration](#api-integration)
6. [Components](#components)
7. [Pages](#pages)
8. [Authentication](#authentication)
9. [Development Guide](#development-guide)

## Overview

LiveAvatar Frontend is a Next.js/React application that provides a user interface for generating AI-powered talking avatar videos. It connects to a FastAPI backend running on RunPod and uses Supabase for authentication and database management.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks

### Project Structure
```
frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── characters/        # Character management
│   ├── generate/          # Video generation
│   ├── history/           # Generation history
│   └── settings/          # User settings
├── components/             # Reusable components
│   ├── ui/                # UI components
│   └── layout/            # Layout components
├── lib/                    # Utilities and configurations
│   ├── api/               # API client functions
│   ├── auth/              # Authentication context
│   ├── db/                # Database functions
│   └── supabase/          # Supabase configuration
└── database/               # Database schema
    └── schema.sql
```

## Features

### 1. Authentication & User Management

**What it does**: Users can register, login, and manage their accounts.

**How it works**:
- Uses Supabase Auth for authentication
- Auth context provides user state throughout the app
- Protected routes redirect to login if not authenticated

**Components**:
- `lib/auth/context.tsx` - AuthProvider and useAuth hook
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page

**Database**:
- `users` table stores user information

**User Flow**:
1. User visits app
2. If not logged in, redirected to `/login`
3. User can register new account or login
4. After login, redirected to dashboard

---

### 2. Character Management

**What it does**: Users can upload, view, and delete character images.

**How it works**:
- Users upload character images
- Images are stored (in production, use Supabase Storage or S3)
- Characters can be selected for video generation

**Components**:
- `app/characters/page.tsx` - Character management page
- `components/ui/FileUpload.tsx` - File upload component

**Database**:
- `characters` table stores character metadata
- Fields: id, user_id, name, image_url, lora_path, timestamps

**API Integration**:
- No direct API calls (database only)

**User Flow**:
1. Navigate to Characters page
2. Enter character name
3. Upload character image
4. Character appears in list
5. Can select character for generation or delete

---

### 3. Video Generation

**What it does**: Main feature - generate talking avatar videos from images and audio.

**How it works**:
1. User selects character (or uploads new image)
2. User uploads audio file
3. User enters text prompt
4. User configures generation settings
5. Form submitted to backend API
6. Job created, status polled every 5 seconds
7. When complete, video displayed

**Components**:
- `app/generate/page.tsx` - Main generation interface
- `components/ui/FileUpload.tsx` - For image and audio uploads
- `components/ui/VideoPlayer.tsx` - Video display
- `components/ui/StatusBadge.tsx` - Status indicator
- `components/ui/LoadingSpinner.tsx` - Loading states

**API Integration**:
- `POST /api/generate` - Create generation job
- `GET /api/status/{job_id}` - Check job status
- `GET /api/video/{job_id}` - Download video

**Database**:
- `generations` table tracks all jobs
- Updates status as polling progresses
- Stores video URL when complete

**User Flow**:
1. Navigate to Generate page
2. Select character or upload image
3. Upload audio file
4. Enter prompt
5. Adjust settings (optional)
6. Click "Generate Video"
7. Watch status update in real-time
8. Video appears when complete

---

### 4. Generation History

**What it does**: View all past video generations with filtering and details.

**How it works**:
- Lists all user's generations from database
- Filter by status (pending, processing, completed, failed)
- Click generation to see details
- View/download completed videos

**Components**:
- `app/history/page.tsx` - History page
- `components/ui/StatusBadge.tsx` - Status display
- `components/ui/VideoPlayer.tsx` - Video playback

**Database**:
- Queries `generations` table filtered by user_id
- Optional status filter

**User Flow**:
1. Navigate to History page
2. See list of all generations
3. Filter by status if needed
4. Click generation to see details
5. View/download video if completed

---

### 5. Settings

**What it does**: Configure default generation parameters.

**How it works**:
- User sets preferred default values
- Settings saved to database
- Used as defaults in Generate page

**Components**:
- `app/settings/page.tsx` - Settings page

**Database**:
- `user_settings` table stores preferences
- Fields: default_size, default_sample_steps, default_infer_frames, default_sample_solver

**User Flow**:
1. Navigate to Settings page
2. Adjust default parameters
3. Click "Save Settings"
4. Settings used as defaults in Generate page

---

## Database Schema

See `database/schema.sql` for complete schema. Key tables:

### users
- Stores user account information
- Linked to Supabase Auth users

### characters
- User-uploaded character images
- Foreign key to users

### generations
- Tracks all video generation jobs
- Stores job_id from API, status, video_url
- Foreign keys to users and characters

### user_settings
- User preferences for generation
- One record per user

---

## API Integration

### Base URL
Set in `NEXT_PUBLIC_API_BASE_URL` environment variable.

### Endpoints Used

1. **GET /** - Health check
   - Used in dashboard to verify API status

2. **POST /api/generate** - Create generation job
   - Sends FormData with image, audio, prompt, and settings
   - Returns job_id

3. **GET /api/status/{job_id}** - Check job status
   - Polled every 5 seconds during generation
   - Returns current status and video_url when complete

4. **GET /api/video/{job_id}** - Download video
   - Returns MP4 file
   - Used by VideoPlayer component

5. **GET /api/characters** - List available characters
   - Currently not used (we use database instead)

### API Client
All API functions in `lib/api/client.ts`:
- `checkHealth()` - Health check
- `createGeneration()` - Create job
- `getJobStatus()` - Check status
- `pollJobStatus()` - Poll until complete
- `getVideo()` - Download video
- `getCharacters()` - List characters

---

## Components

### UI Components (`components/ui/`)

#### FileUpload
- Drag-and-drop file upload
- Image/audio preview
- File validation (size, type)
- Used for character images and audio files

#### VideoPlayer
- HTML5 video player
- Download button
- Loading and error states

#### LoadingSpinner
- Animated spinner
- Configurable size
- Optional text

#### StatusBadge
- Color-coded status display
- Used for generation status

### Layout Components (`components/layout/`)

#### Navigation
- Main navigation bar
- Shows different links based on auth status
- User email and sign out button

---

## Pages

### Dashboard (`app/page.tsx`)
- Welcome page after login
- API status check
- Quick action cards
- Getting started guide

### Login (`app/login/page.tsx`)
- Email/password login form
- Link to registration
- Redirects to dashboard on success

### Register (`app/register/page.tsx`)
- Registration form
- Name, email, password fields
- Password confirmation
- Creates user in database

### Characters (`app/characters/page.tsx`)
- List of user's characters
- Upload new character form
- Delete characters
- Character grid display

### Generate (`app/generate/page.tsx`)
- Main generation interface
- Character selection/upload
- Audio upload
- Prompt input
- Settings configuration
- Status display
- Video player

### History (`app/history/page.tsx`)
- List of all generations
- Status filtering
- Generation details view
- Video playback

### Settings (`app/settings/page.tsx`)
- Default parameters configuration
- Save settings
- Form validation

---

## Authentication

### Implementation
- Uses Supabase Auth
- AuthProvider wraps entire app
- useAuth hook provides user state
- Protected routes check authentication

### User Creation
When user registers:
1. Supabase Auth creates auth user
2. Frontend creates record in `users` table
3. Default settings created in `user_settings`

### Session Management
- Supabase handles session persistence
- Auto-refresh tokens
- Session stored in cookies

---

## Development Guide

### Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://[your-runpod-id]-8000.proxy.runpod.net
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   - Create Supabase project
   - Run `database/schema.sql` in Supabase SQL editor
   - Enable Row Level Security (RLS) policies as needed

4. **Run Development Server**
   ```bash
   npm run dev
   ```

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (required)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (required)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (required)

### File Upload Storage

**Current Implementation**: Uses data URLs (not production-ready)

**Production Recommendation**:
1. Use Supabase Storage for images
2. Upload files to storage bucket
3. Store public URL in database
4. Update `createCharacter` to upload to storage

### Error Handling

- All API calls wrapped in try-catch
- Error messages displayed to users
- Console logging for debugging
- Network errors handled gracefully

### Performance Considerations

- Image previews use FileReader (client-side)
- Status polling every 5 seconds (configurable)
- Lazy loading for video players
- Database indexes on foreign keys

### Security

- Input validation on all forms
- File type and size validation
- HTTPS required for API calls
- Supabase RLS for database security
- Environment variables for sensitive data

---

## Future Improvements

1. **File Storage**: Integrate Supabase Storage or S3
2. **Real-time Updates**: Use WebSockets for status updates
3. **Image Optimization**: Compress images before upload
4. **Video Thumbnails**: Generate thumbnails for history
5. **Batch Generation**: Generate multiple videos at once
6. **Character Templates**: Pre-made character options
7. **TTS Integration**: Text-to-speech for prompts
8. **Video Editing**: Basic editing features
9. **Sharing**: Share videos with others
10. **Analytics**: Track usage and performance

---

## Troubleshooting

### API Connection Issues
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify backend is running
- Check CORS settings on backend

### Authentication Issues
- Verify Supabase credentials
- Check Supabase project is active
- Ensure RLS policies allow access

### Database Errors
- Verify schema is applied
- Check foreign key constraints
- Ensure user exists in users table

### File Upload Issues
- Check file size limits
- Verify file types are accepted
- Check browser console for errors

---

## Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check browser console for errors
4. Verify environment variables
5. Test API endpoints directly

