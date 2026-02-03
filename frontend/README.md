# LiveAvatar Frontend

A modern Next.js frontend application for the LiveAvatar AI video generation platform.

## Features

- 🔐 **Authentication** - User registration and login with Supabase
- 👤 **Character Management** - Upload and manage character images
- 🎬 **Video Generation** - Generate talking avatar videos from images and audio
- 📊 **Generation History** - View and manage all past generations
- ⚙️ **Settings** - Customize default generation parameters
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Database and authentication
- **React Hooks** - State management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database and auth)
- LiveAvatar backend API running on RunPod

### Installation

1. **Clone and navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://[your-runpod-id]-8000.proxy.runpod.net
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to SQL Editor
   - Run the SQL from `database/schema.sql`
   - This creates all necessary tables

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx           # Dashboard
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── characters/        # Character management
│   ├── generate/          # Video generation
│   ├── history/           # Generation history
│   └── settings/          # User settings
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/                    # Utilities
│   ├── api/               # API client functions
│   ├── auth/              # Authentication
│   ├── db/                # Database functions
│   └── supabase/          # Supabase config
├── database/               # Database schema
│   └── schema.sql
└── public/                 # Static assets
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Usage Guide

### 1. Register/Login
- Create an account or sign in
- You'll be redirected to the dashboard

### 2. Upload Characters
- Go to Characters page
- Enter character name
- Upload character image
- Character is saved for future use

### 3. Generate Video
- Go to Generate page
- Select a character (or upload new image)
- Upload audio file (WAV/MP3)
- Enter text prompt
- Adjust settings (optional)
- Click "Generate Video"
- Wait for processing (status updates automatically)
- Video appears when complete

### 4. View History
- Go to History page
- See all your generations
- Filter by status
- Click to view details and download videos

### 5. Configure Settings
- Go to Settings page
- Set default generation parameters
- Save settings
- Defaults are used in Generate page

## API Integration

The frontend communicates with the LiveAvatar FastAPI backend:

- **Health Check**: `GET /`
- **Create Job**: `POST /api/generate`
- **Check Status**: `GET /api/status/{job_id}`
- **Download Video**: `GET /api/video/{job_id}`

See `lib/api/client.ts` for all API functions.

## Database

Uses Supabase (PostgreSQL) with the following tables:

- `users` - User accounts
- `characters` - Character images
- `generations` - Video generation jobs
- `user_settings` - User preferences

See `database/schema.sql` for complete schema.

## Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture

### Adding Features
1. Create components in `components/`
2. Add pages in `app/`
3. Add API functions in `lib/api/`
4. Add database functions in `lib/db/`
5. Update documentation

## Production Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
- Update `NEXT_PUBLIC_API_BASE_URL` with production API URL
- Use production Supabase project credentials

## Troubleshooting

### API Connection Failed
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify backend is running
- Check CORS settings

### Authentication Not Working
- Verify Supabase credentials
- Check Supabase project is active
- Ensure database schema is applied

### File Upload Issues
- Check file size limits (10MB images, 50MB audio)
- Verify file types are supported
- Check browser console for errors

## Documentation

For detailed documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md).

## License

See parent directory LICENSE file.

## Support

For issues or questions:
1. Check documentation
2. Review code comments
3. Check browser console
4. Verify environment variables
