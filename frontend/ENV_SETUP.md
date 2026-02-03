# Environment Variables Setup Guide

This guide explains how to set up environment variables for the LiveAvatar frontend.

## Required Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://[your-runpod-id]-8000.proxy.runpod.net

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step-by-Step Setup

### 1. Backend API URL

1. Get your RunPod endpoint URL
   - Format: `https://[your-runpod-id]-8000.proxy.runpod.net`
   - Replace `[your-runpod-id]` with your actual RunPod ID

2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://abc123-8000.proxy.runpod.net
   ```

### 2. Supabase Configuration

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Fill in project details
   - Wait for project to be created

2. **Get Project URL**
   - Go to Project Settings
   - Under "API", find "Project URL"
   - Copy the URL

3. **Get Anon Key**
   - In the same "API" section
   - Find "anon public" key
   - Copy the key

4. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. Set Up Database

1. **Open SQL Editor**
   - In Supabase dashboard
   - Go to SQL Editor
   - Click "New Query"

2. **Run Schema**
   - Open `database/schema.sql` from this project
   - Copy all SQL
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Tables**
   - Go to Table Editor
   - You should see: `users`, `characters`, `generations`, `user_settings`

## Example `.env.local` File

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=https://abc123def456-8000.proxy.runpod.net

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

## Security Notes

- **Never commit `.env.local` to Git**
  - It's already in `.gitignore`
  - Contains sensitive credentials

- **Use different keys for development and production**
  - Development: Use test Supabase project
  - Production: Use production Supabase project

- **Environment Variable Prefix**
  - Variables starting with `NEXT_PUBLIC_` are exposed to the browser
  - Only use this prefix for non-sensitive values
  - Never put secrets in `NEXT_PUBLIC_` variables

## Verification

After setting up environment variables:

1. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Check Dashboard**
   - Go to http://localhost:3000
   - API status should show "online" if backend is running
   - If you see errors, check console for missing variables

3. **Test Authentication**
   - Try registering a new account
   - If it works, Supabase is configured correctly

## Troubleshooting

### "Supabase URL and Anon Key are not set"
- Check `.env.local` exists in `frontend` directory
- Verify variable names are correct (case-sensitive)
- Restart development server

### "API is offline"
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify backend is running
- Test API URL in browser: `https://your-url/`

### Database errors
- Verify schema was run in Supabase
- Check tables exist in Table Editor
- Review SQL Editor for errors

### Authentication errors
- Verify Supabase credentials are correct
- Check Supabase project is active (not paused)
- Ensure email confirmation is disabled (for testing) or handle email verification

## Production Setup

For production deployment (e.g., Vercel):

1. **Add Environment Variables in Vercel**
   - Go to Project Settings
   - Navigate to "Environment Variables"
   - Add each variable
   - Use production values

2. **Update API URL**
   - Use production RunPod URL
   - Or your own domain if using custom domain

3. **Use Production Supabase**
   - Create separate Supabase project for production
   - Or use same project with RLS policies

## Next Steps

After environment setup:
1. ✅ Environment variables configured
2. ✅ Database schema applied
3. ✅ Development server running
4. ✅ Ready to use the application!

See [README.md](./README.md) for usage instructions.

