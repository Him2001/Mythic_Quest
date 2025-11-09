# Facial Recognition Deployment Guide

This guide helps you deploy the facial recognition backend and frontend with proper configuration.

## 🚀 Backend Deployment (Render)

### 1. Prerequisites
- Render account
- Dropbox links for ONNX model files
- Face database JSON

### 2. Render Configuration

**Service Type:** Web Service

**Build Command:**
```bash
pip install -r facial_reco/requirements.txt
```

**Start Command:** (Set automatically via Procfile)
```bash
gunicorn api_server:app --workers 2 --threads 2 --timeout 120 --bind 0.0.0.0:$PORT --log-level info
```

**Environment Variables:**
```
W600K_URL=<your_dropbox_direct_download_link_for_w600k_r50.onnx>
SCRFD_URL=<your_dropbox_direct_download_link_for_scrfd_10g_bnkps.onnx>
FACE_DB_JSON=<your_face_database_json_string>
PORT=5000
```

**Important Notes:**
- ✅ Ensure Dropbox links end with `?dl=1` (not `?dl=0`)
- ✅ Use at least **512MB RAM** instance (facial recognition is memory-intensive)
- ✅ Set Health Check Path to `/health`
- ✅ Enable Auto-Deploy from your Git repository

### 3. Verify Deployment

After deployment, test the health endpoint:
```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Facial recognition API is running"
}
```

### 4. Check Render Logs

Look for these success indicators:
```
✅ w600k_r50.onnx already exists
  Size: 166.31 MB
✅ scrfd_10g_bnkps.onnx already exists
  Size: 16.14 MB
✅ Loaded face database from environment (X users)
```

---

## 🌐 Frontend Deployment (Netlify)

### 1. Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables, add:

```
VITE_FACE_RECOGNITION_API_URL=https://your-backend.onrender.com
```

**Important:** Replace `your-backend.onrender.com` with your actual Render URL.

### 2. Build Settings

Already configured in `netlify.toml`:
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 18

### 3. Redeploy

After adding the environment variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

---

## 🧪 Testing CORS

### Test from Browser Console

On your deployed Netlify site, open DevTools Console and run:

```javascript
fetch('https://your-backend.onrender.com/health', {
  method: 'GET',
  mode: 'cors'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Expected output:
```json
{
  "status": "ok",
  "message": "Facial recognition API is running"
}
```

### Test Recognition Endpoint

```javascript
// First, capture a frame from your camera
// Then test the recognize endpoint:
fetch('https://your-backend.onrender.com/recognize', {
  method: 'POST',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,...', // your base64 image
    threshold: 0.45
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 🔧 Troubleshooting

### CORS Errors

**Symptom:** `No 'Access-Control-Allow-Origin' header is present`

**Solutions:**
1. ✅ Verify backend is running (check health endpoint)
2. ✅ Check Render logs for startup errors
3. ✅ Ensure you're using the correct backend URL
4. ✅ Verify CORS is enabled in `api_server.py`

### 502 Bad Gateway

**Symptom:** Backend returns 502 error

**Common Causes:**
1. **Out of Memory:** Upgrade Render instance to 512MB+ RAM
2. **Startup Timeout:** Models take time to download/load
3. **Missing Models:** Check logs for model download errors

**Solutions:**
1. Check Render logs for memory errors
2. Verify model files are downloading correctly
3. Increase instance size if needed
4. Ensure Dropbox links are accessible

### Health Check Fails

**Symptom:** Health endpoint returns error or timeout

**Solutions:**
1. Check if service is sleeping (free Render instances sleep after 15 min inactivity)
2. Verify environment variables are set correctly
3. Check build logs for errors
4. Ensure `gunicorn` is installed in requirements.txt

### Recognition Always Fails

**Symptom:** API responds but always returns `success: false`

**Solutions:**
1. Verify `FACE_DB_JSON` environment variable is set correctly
2. Check that face database contains valid embeddings
3. Test locally first to ensure models work
4. Verify image is being captured and encoded correctly

---

## 📊 Monitoring

### Check Service Health
```bash
curl https://your-backend.onrender.com/health
```

### View Real-time Logs
1. Go to Render Dashboard
2. Select your service
3. Click **Logs** tab
4. Watch for errors or warnings

### Performance Metrics
- **Cold Start:** First request after sleep takes 10-30 seconds
- **Warm Response:** Subsequent requests ~1-3 seconds
- **Memory Usage:** ~200-400MB for recognition

---

## 🎯 Production Checklist

### Backend (Render)
- [ ] Environment variables set (W600K_URL, SCRFD_URL, FACE_DB_JSON)
- [ ] Health check endpoint configured
- [ ] Instance size ≥ 512MB RAM
- [ ] Models downloading successfully
- [ ] Face database loading correctly
- [ ] CORS configured properly
- [ ] Using Gunicorn (not Flask dev server)

### Frontend (Netlify)
- [ ] VITE_FACE_RECOGNITION_API_URL set
- [ ] Pointing to correct backend URL
- [ ] Build succeeding without errors
- [ ] Can access deployed site
- [ ] Camera permissions working

### Integration
- [ ] Health check passes from frontend
- [ ] CORS working (no console errors)
- [ ] Recognition requests succeeding
- [ ] Error messages displaying correctly
- [ ] Loading states working

---

## 📝 Notes

- **Free Tier Limitations:** Render free tier services sleep after 15 minutes of inactivity
- **Cold Starts:** First request after sleep takes longer (10-30s)
- **Model Size:** ONNX models are large (~180MB total), ensure sufficient disk space
- **Rate Limiting:** Consider adding rate limiting for production use
- **Security:** In production, consider implementing authentication/API keys

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Logs:** Always check Render logs first
2. **Verify URLs:** Ensure all URLs are correct and accessible
3. **Test Locally:** Verify everything works locally before debugging deployment
4. **Environment Variables:** Double-check all env vars are set correctly
5. **Network Tab:** Use browser DevTools Network tab to inspect requests/responses
