# LiveAvatar Development Workflow

## Team Structure

- **Senior Dev (Auto)**: Technical guidance, architecture decisions, code review
- **Frontend Agent**: Lovable prompt crafting, response review, frontend development
- **User**: Execution, feedback, project management, coordination

## Development Flow

### 1. Feature Planning Phase
1. User discusses feature requirements with Senior Dev
2. Senior Dev provides technical specifications and architecture
3. User shares requirements with Frontend Agent
4. Frontend Agent crafts detailed Lovable prompt

### 2. Implementation Phase
1. User executes prompt in Lovable.dev
2. User copies Lovable's response/output
3. User pastes response to Frontend Agent
4. Frontend Agent reviews for:
   - ✅ Completeness (all requirements met)
   - ✅ Code quality (TypeScript, error handling)
   - ✅ API integration (correct endpoints, error handling)
   - ✅ Database integration (queries, relationships)
   - ✅ UI/UX (responsive, loading states, user feedback)

### 3. Review & Iteration Phase
1. If issues found → Frontend Agent crafts fix prompt
2. If good → Move to next feature
3. Update `DEVELOPMENT_LOG.md`
4. Commit changes to GitHub

### 4. Testing Phase
1. Test locally (if possible)
2. Test with RunPod API (verify endpoints work)
3. Verify database operations
4. Check UI/UX on different screen sizes
5. Test error scenarios

## Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Active development (optional)
- `feature/*` - Feature branches (optional, can work directly on main for now)

### Commit Message Format
```
feat: Add character upload page
fix: Resolve API polling issue
docs: Update API documentation
refactor: Improve error handling
style: Format code with prettier
```

### Sync Process

**Mac → GitHub:**
```bash
git add .
git commit -m "feat: Add feature description"
git push origin main
```

**GitHub → RunPod:**
```bash
cd /workspace/LiveAvatar
git pull origin main
```

**Lovable → GitHub:**
- If Lovable is connected to GitHub, it auto-syncs
- Or manually export and commit

**GitHub → Mac:**
```bash
git pull origin main
```

## Communication Channels

- **Senior Dev ↔ User**: This chat (technical guidance)
- **Frontend Agent ↔ User**: Frontend agent chat (Lovable prompts)
- **User ↔ Lovable**: Lovable.dev interface (execution)
- **Documentation**: GitHub repo (shared knowledge)

## File Organization

```
live_avatar_artel/
├── backend/              # RunPod backend code
│   ├── api_server.py
│   ├── setup.sh
│   ├── start_server.sh
│   └── README.md
├── frontend/             # Lovable frontend code
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── database/
│   └── ...
├── docs/                  # Documentation
│   ├── API.md
│   ├── WORKFLOW.md
│   └── DEVELOPMENT_LOG.md
├── liveavatar/           # Original LiveAvatar codebase
├── minimal_inference/   # Inference utilities
└── README.md
```

## Development Checklist

### Before Starting a Feature
- [ ] Discuss with Senior Dev
- [ ] Review API documentation
- [ ] Check database schema
- [ ] Plan component structure

### During Development
- [ ] Craft clear Lovable prompt
- [ ] Execute in Lovable
- [ ] Review response
- [ ] Test functionality
- [ ] Update documentation

### After Feature Complete
- [ ] Test with real API
- [ ] Verify database operations
- [ ] Check error handling
- [ ] Update DEVELOPMENT_LOG.md
- [ ] Commit to GitHub

## Troubleshooting

### API Connection Issues
- Verify RunPod URL is correct
- Check server is running
- Test health endpoint first
- Check CORS settings

### Database Issues
- Verify schema matches
- Check Supabase connection
- Review query syntax
- Test with sample data

### Lovable Issues
- Break down into smaller prompts
- Be more specific in requirements
- Review generated code carefully
- Ask for clarification if needed

