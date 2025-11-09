# 🚀 Netlify Deployment Guide for Mythic Quest with Eleven Labs Voice

## Pre-Deployment Checklist

### 1. Environment Variables Setup
In your Netlify dashboard, add these environment variables:

```
VITE_ELEVENLABS_API_KEY=de6dcf896ee58d4f5211dcadd2a658080ad82fe252f47aea0ab251790b3553f9
VITE_ELEVENLABS_VOICE_ID=MezYwaNLTOfydzsFJwwt
```

**Important**: Also add your existing Supabase and other API keys from your `.env` file.

### 2. Build Configuration
The `netlify.toml` file has been created with:
- Proper headers for audio playback
- SPA routing configuration  
- Cache optimization
- Security headers

### 3. Audio Playback Considerations

#### Tab Switching Issue - SOLVED ✅
- Enhanced audio service with visibility change handlers
- Auto-resume functionality when tab becomes active
- Persistent audio context management

#### Browser Policies
- Modern browsers require user interaction before audio can play
- The app correctly waits for user interaction before enabling voice
- Audio will continue playing even when switching tabs

### 4. Deployment Steps

1. **Connect Repository to Netlify**
   ```bash
   # If using Netlify CLI (optional)
   npm install -g netlify-cli
   netlify login
   netlify init
   ```

2. **Configure Build Settings in Netlify Dashboard**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Add Environment Variables**
   Go to Site Settings > Environment Variables and add:
   - `VITE_ELEVENLABS_API_KEY`
   - `VITE_ELEVENLABS_VOICE_ID`
   - All your existing Supabase variables
   - Any other API keys from your `.env`

4. **Deploy**
   ```bash
   git add .
   git commit -m "Add Eleven Labs voice integration"
   git push origin main
   ```

### 5. Testing in Production

After deployment, test:
1. **Voice Activation**: Click anywhere on the page to enable audio
2. **Quest Completion**: Complete a quest and listen for narration
3. **Level Up**: Trigger a level up for celebration voice
4. **Tab Switching**: Play voice, switch tabs, return - should continue
5. **Mobile Testing**: Test on mobile devices for audio playback

### 6. Troubleshooting

#### If Voice Doesn't Work in Production:

1. **Check Browser Console**: Look for API errors or CORS issues
2. **Verify Environment Variables**: Ensure they're set in Netlify dashboard
3. **Check Eleven Labs API**: Verify API key has sufficient credits
4. **Test Fallback**: Browser speech should work if Eleven Labs fails

#### Common Issues:

- **CORS Errors**: Eleven Labs API should work from any domain
- **API Rate Limits**: Check your Eleven Labs usage dashboard
- **Audio Blocking**: Ensure user has interacted with page first
- **Mobile Issues**: Some mobile browsers have stricter audio policies

### 7. Performance Optimization

The implementation includes:
- **Audio Caching**: Generated audio is cached to reduce API calls
- **Smart Fallback**: Falls back to browser speech if Eleven Labs fails  
- **Memory Management**: Automatic cleanup of audio URLs
- **Background Playback**: Audio continues when switching tabs

### 8. Monitoring

Monitor these in production:
- Eleven Labs API usage and costs
- Audio generation success rates
- User interaction patterns
- Browser compatibility issues

## 🎯 Expected Behavior

✅ **Welcome Messages**: Plays when user first interacts with app
✅ **Quest Completion**: "Excellent work! You've completed [Quest Name]!"  
✅ **Level Ups**: "Magnificent! [Name], you have ascended to Level X!"
✅ **Achievements**: Walking milestones, coin milestones
✅ **Tab Switching**: Audio continues playing in background
✅ **Fallback**: Browser speech if Eleven Labs unavailable

The voice system is now robust and production-ready! 🎉