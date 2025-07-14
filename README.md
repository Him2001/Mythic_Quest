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
