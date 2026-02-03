# Git Setup Guide

## ✅ Setup Complete!

Your workspace is now linked to: `https://github.com/AgentArtel/live_avatar_artel.git`

## Current Status

- ✅ Git repository initialized
- ✅ Remote configured to your GitHub repo
- ✅ Folder structure organized (backend/, frontend/, docs/)
- ✅ .gitignore updated for frontend files
- ✅ Documentation created
- ✅ Files staged and ready to commit

## Next Steps

### 1. Review Changes

```bash
git status
```

### 2. Commit Changes

```bash
git commit -m "feat: Add frontend structure, documentation, and project organization

- Add frontend Next.js application
- Add database schema
- Add API documentation
- Add development workflow docs
- Organize project structure (backend/, frontend/, docs/)
- Update .gitignore for frontend files"
```

### 3. Push to GitHub

```bash
git push origin main
```

**Note**: If this is the first push to your repo, you might need to:

```bash
git push -u origin main
```

### 4. Verify on GitHub

Visit: https://github.com/AgentArtel/live_avatar_artel

You should see all the files there!

## Syncing with RunPod

After pushing to GitHub, on RunPod:

```bash
cd /workspace/LiveAvatar
git pull origin main
```

This will sync:
- Backend files (api_server.py, setup.sh, etc.)
- Frontend code
- Documentation
- All project files

## Daily Workflow

### Making Changes

1. **Make changes** (edit files)
2. **Stage changes**: `git add .`
3. **Commit**: `git commit -m "description"`
4. **Push**: `git push origin main`

### Syncing from RunPod

If you make changes on RunPod:

```bash
# On RunPod
git add .
git commit -m "feat: Add backend feature"
git push origin main

# On Mac
git pull origin main
```

### Syncing from Mac

If you make changes on Mac:

```bash
# On Mac
git add .
git commit -m "feat: Add frontend feature"
git push origin main

# On RunPod
git pull origin main
```

## Branch Strategy (Optional)

For now, we're working directly on `main`. Later, you can create branches:

```bash
# Create feature branch
git checkout -b feature/character-upload

# Make changes, commit
git add .
git commit -m "feat: Add character upload"

# Push branch
git push origin feature/character-upload

# Merge to main (on GitHub or locally)
git checkout main
git merge feature/character-upload
git push origin main
```

## Troubleshooting

### "Permission denied" when pushing
- Check GitHub authentication
- Use Personal Access Token if needed
- Or use SSH keys

### "Repository not found"
- Verify repo exists: https://github.com/AgentArtel/live_avatar_artel
- Check you have access
- Verify remote URL: `git remote -v`

### Merge conflicts
- Pull latest: `git pull origin main`
- Resolve conflicts
- Commit: `git add . && git commit -m "fix: Resolve merge conflicts"`
- Push: `git push origin main`

## File Organization

```
live_avatar_artel/
├── backend/          # Backend code (from RunPod)
├── frontend/         # Frontend code (from Lovable)
├── docs/             # Documentation
├── liveavatar/       # Original codebase
└── minimal_inference/ # Inference utilities
```

## What Gets Committed

✅ **Committed:**
- Source code (Python, TypeScript, etc.)
- Configuration files
- Documentation
- Database schema

❌ **Ignored (not committed):**
- `node_modules/` (frontend dependencies)
- `.next/` (Next.js build)
- `ckpt/` (model files - too large)
- `outputs/` (generated videos)
- `.env` files (secrets)
- `__pycache__/` (Python cache)

## Quick Reference

```bash
# Check status
git status

# See what changed
git diff

# Stage all changes
git add .

# Commit
git commit -m "feat: Description"

# Push to GitHub
git push origin main

# Pull from GitHub
git pull origin main

# View commit history
git log --oneline -10
```

