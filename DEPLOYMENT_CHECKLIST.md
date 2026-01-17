# Deployment Checklist

## Before Deploying to Render

### 1. Supabase Setup ✓
- [ ] Create Supabase project (if not already done)
- [ ] Create Storage bucket named `door-images`
- [ ] Set bucket to **public read access**
- [ ] Add `original_image_url` column to database:
  ```sql
  ALTER TABLE door_chalks ADD COLUMN original_image_url TEXT;
  ```
- [ ] Copy `SUPABASE_URL` from Project Settings
- [ ] Copy `SUPABASE_SERVICE_KEY` from Project Settings → API

### 2. Gemini API Setup ✓
- [ ] Get API key from [Google AI Studio](https://aistudio.google.com/apikey)
- [ ] Test API key is valid

### 3. Code Preparation ✓
- [ ] All files created in `backend/` directory
- [ ] `.env.example` documented
- [ ] `requirements.txt` complete
- [ ] `Dockerfile` configured
- [ ] `render.yaml` configured

### 4. Git Repository ✓
- [ ] Commit all backend files
- [ ] Push to GitHub
  ```bash
  git add backend/ render.yaml
  git commit -m "Add Render deployment for door chalk API"
  git push
  ```

## Render Deployment Steps

### 1. Create Blueprint Deployment
- [ ] Go to [Render Dashboard](https://dashboard.render.com/)
- [ ] Click **New** → **Blueprint**
- [ ] Connect your GitHub repository
- [ ] Select repository containing `render.yaml`
- [ ] Click **Apply**

### 2. Configure Environment Variables
For **door-chalk-api** (web service):
- [ ] Add `GEMINI_API_KEY`
- [ ] Add `SUPABASE_URL`
- [ ] Add `SUPABASE_SERVICE_KEY`

For **door-chalk-worker** (worker service):
- [ ] Add `GEMINI_API_KEY`
- [ ] Add `SUPABASE_URL`
- [ ] Add `SUPABASE_SERVICE_KEY`

**Note**: `REDIS_URL` is auto-configured by the Redis addon

### 3. Monitor Deployment
- [ ] Wait for all services to deploy (5-10 minutes)
- [ ] Check **door-chalk-api** logs for errors
- [ ] Check **door-chalk-worker** logs for errors
- [ ] Check **door-chalk-redis** is running

### 4. Test Deployment
- [ ] Get your API URL (e.g., `https://door-chalk-api.onrender.com`)
- [ ] Test health endpoint:
  ```bash
  curl https://door-chalk-api.onrender.com/health
  ```
- [ ] Expected response:
  ```json
  {
    "status": "healthy",
    "redis": "connected",
    "supabase": "configured",
    "gemini": "configured"
  }
  ```

### 5. Test Upload
```bash
curl -X POST https://door-chalk-api.onrender.com/upload \
  -F "file=@path/to/door/image.jpg" \
  -F "semester=Spring 2026"
```

Expected response:
```json
{
  "status": "queued",
  "job_id": "...",
  "record_id": "...",
  "original_image_url": "https://..."
}
```

### 6. Check Processing Status
```bash
curl https://door-chalk-api.onrender.com/status/{job_id}
```

Wait ~30-60 seconds, then check again until status is "completed".

### 7. Verify in Supabase
- [ ] Check Storage bucket `door-images/originals/` has uploaded image
- [ ] Check Storage bucket `door-images/processed/` has processed image
- [ ] Check `door_chalks` table has new record with both URLs

## Troubleshooting

### Services won't start?
- Check environment variables are set correctly
- Check Render logs for specific errors
- Verify Dockerfile builds successfully

### Worker not processing jobs?
- Check Redis connection in worker logs
- Verify `REDIS_URL` is configured
- Check Celery worker is running (not crashed)

### Upload fails?
- Verify Supabase bucket exists and is public
- Check service role key has correct permissions
- Verify FastAPI service is healthy (`/health`)

### Processing fails (fallback to original)?
- Check Gemini API key is valid
- Check API quota/rate limits
- Review worker logs for specific error
- This is expected behavior - system will use original image

## Post-Deployment

### Update Frontend (Next.js)
Once backend is deployed:
1. Add Render API URL to frontend environment variables
2. Create upload component that calls `/upload` endpoint
3. Implement status polling for `/status/{job_id}`
4. Update Supabase queries to show processed images

### Monitoring
- Set up Render notifications for service failures
- Monitor Redis memory usage
- Check Supabase Storage quota
- Monitor Gemini API usage/costs

## Cost Estimates (Render Starter Plan)

- Web Service (FastAPI): $7/month
- Worker Service (Celery): $7/month
- Redis: $10/month
- **Total**: ~$24/month

Free tier available for testing (services sleep after inactivity).
