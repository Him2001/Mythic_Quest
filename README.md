# Mythic Quest - Wellness Adventure App

A gamified wellness application that transforms your health journey into an epic fantasy adventure.

## Features

- **User Authentication**: Email/password and OAuth (Google, Facebook, GitHub)
- **Quest System**: Gamified wellness challenges with XP and coin rewards
- **Social Features**: Share posts, follow friends, messaging system
- **Live Adventure Map**: Real-world location-based quests with GPS tracking
- **Marketplace**: Purchase wellness items with earned coins
- **Admin Dashboard**: Complete user management and analytics
- **Responsive Design**: Works on desktop and mobile devices

## OAuth Setup

To enable OAuth authentication, you need to set up OAuth applications with the providers:

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs:
   - `http://localhost:5173/auth/callback/google` (development)
   - `https://yourdomain.com/auth/callback/google` (production)
6. Copy Client ID and Client Secret to your `.env` file

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Set Valid OAuth Redirect URIs:
   - `http://localhost:5173/auth/callback/facebook` (development)
   - `https://yourdomain.com/auth/callback/facebook` (production)
5. Copy App ID and App Secret to your `.env` file

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:5173/auth/callback/github` (development)
   - `https://yourdomain.com/auth/callback/github` (production)
4. Copy Client ID and Client Secret to your `.env` file

## Environment Variables

Create a `.env` file in the root directory:

```env
# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_FACEBOOK_APP_SECRET=your-facebook-app-secret
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CLIENT_SECRET=your-github-client-secret

# OpenAI (optional, for AI features)
VITE_OPENAI_API_KEY=your-openai-api-key
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file with OAuth credentials
4. Start the development server: `npm run dev`
5. Open http://localhost:5173

## Admin Access

- **Username**: admin123
- **Password**: admin123

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Maps**: Leaflet, OpenStreetMap
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Authentication**: OAuth 2.0 (Google, Facebook, GitHub)

## Security Notes

- OAuth client secrets should be handled server-side in production
- This demo includes client-side OAuth for simplicity
- Implement proper CSRF protection in production
- Use HTTPS in production environments

## License

MIT License