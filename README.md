# mooV

A modern, offline-first Progressive Web App for tracking movies you've watched, rating them, and sharing your cinema experiences with others.

## Overview

**mooV** is a movie tracking application that allows users to log movies they've watched, write reviews, rate films, and track their theater experiences. The app focuses on creating a social experience around movie watching while maintaining privacy controls and offline functionality.

### Key Features

- **Watch Log Tracking**: Log movies with watch dates, ratings, and reviews
- **Theater Experience**: Track where you watched movies (theater name, city, format like IMAX, Dolby, 70mm)
- **Social Features**: Follow other users, view activity feeds, and share your movie experiences
- **Privacy Controls**: Granular privacy settings for profiles and individual watch logs (public, friends-only, private)
- **Offline First**: Full PWA support with service worker caching for offline access
- **Rich Movie Data**: Integration with TMDB API for comprehensive movie information, posters, and metadata

## Technology Stack

### Frontend
- **React 19**: Latest React with improved performance and concurrent features
- **TypeScript**: Type-safe development with full type coverage
- **Vite 6**: Lightning-fast build tool with HMR (Hot Module Replacement)
- **React Router 7**: File-based routing with loaders and actions for data fetching
- **TailwindCSS 4**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: High-quality, accessible component library built on Base UI
- **Lucide React**: Beautiful, consistent icon system

### Backend & Database
- **Convex**: Real-time backend platform with TypeScript-native API
  - Serverless functions with automatic scaling
  - Real-time subscriptions for live updates
  - Built-in file storage for profile images
  - Schema-based database with type safety

### Authentication
- **Clerk**: Complete authentication solution
  - Social login providers
  - User management
  - Session handling
  - Profile management

### PWA & Offline Support
- **Vite PWA Plugin**: Service worker generation and management
- **Workbox**: Runtime caching strategies for assets and API responses
  - TMDB API responses cached for 24 hours
  - Movie images cached for 30 days
  - Offline fallback page

### External APIs
- **TMDB (The Movie Database)**: Movie metadata, posters, cast information, and search

## Project Structure

```
mooV-spa/
├── src/
│   ├── routes/              # Route components with loaders/actions
│   │   ├── home.tsx         # Home feed
│   │   ├── profile.tsx      # User profiles
│   │   ├── activity.tsx     # Activity feed
│   │   ├── entity.tsx       # Movie detail page
│   │   ├── search.tsx       # Movie search
│   │   ├── auth.tsx         # Authentication flow
│   │   └── layout.tsx       # Main app layout with navigation
│   ├── components/
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── watch-logs-sheet.tsx
│   │   └── bottom-nav.tsx
│   ├── lib/
│   │   └── utils.ts         # Utility functions and middleware
│   ├── types/
│   │   └── db.ts            # TypeScript types for database entities
│   ├── router.tsx           # Route configuration
│   ├── App.tsx              # Root component
│   └── main.tsx             # Application entry point
├── convex/
│   ├── schema.ts            # Database schema definitions
│   ├── users.ts             # User-related mutations and queries
│   ├── movies.ts            # Movie data management
│   ├── watchLogs.ts         # Watch log operations
│   └── _generated/          # Auto-generated Convex types
├── public/
│   ├── icons/               # PWA icons
│   └── offline.html         # Offline fallback page
├── vite.config.ts           # Vite configuration with PWA setup
├── tailwind.config.js       # TailwindCSS configuration
└── convex.json              # Convex project configuration
```

## Database Schema

### Users Table
- Clerk integration for authentication
- Username, email, display name, bio
- Profile image (stored in Convex storage)
- Privacy settings (public, friends_only, private)

### Movies Table
- TMDB integration with movie metadata
- Title, release date, runtime, overview
- Poster and backdrop images
- Vote average, genres, cast information
- Periodic sync with TMDB for fresh data

### Watch Logs Table
- User and movie references
- Watch date, rating (1-10), review text
- Rewatch tracking
- Theater experience fields:
  - Theater name and city
  - Format (standard, IMAX, Dolby, 3D, 70mm, 35mm)
- Visibility settings per log

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Convex account (free tier available)
- Clerk account for authentication
- TMDB API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mooV-spa
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
VITE_CONVEX_URL=<your-convex-url>
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-key>
VITE_TMDB_API_KEY=<your-tmdb-api-key>
```

4. Initialize Convex
```bash
npx convex dev
```

5. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start Vite development server with HMR
- `npm run build` - Type-check with TypeScript and build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npx convex dev` - Start Convex backend in development mode
- `npx convex deploy` - Deploy Convex functions to production

## Key Concepts for Development

### React Router 7 Pattern

Routes use loaders for data fetching and actions for mutations:

```typescript
// Route component with loader
export default function MyRoute() {
  const data = useLoaderData();
  return <div>{data.content}</div>;
}

// Loader runs on navigation
MyRoute.loader = async ({ params }) => {
  return { content: await fetchData(params.id) };
};

// Action handles form submissions
MyRoute.action = async ({ request }) => {
  const formData = await request.formData();
  return await submitData(formData);
};
```

### Convex Integration

Use Convex hooks for real-time data:

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Query data (auto-updates on changes)
const watchLogs = useQuery(api.watchLogs.getUserLogs, { userId });

// Mutations for updates
const addLog = useMutation(api.watchLogs.create);
await addLog({ movieId, rating, reviewText });
```

### Adding New Features

1. **Database Changes**: Update `convex/schema.ts` and add corresponding functions
2. **Types**: Define TypeScript types in `src/types/`
3. **Components**: Create reusable components in `src/components/ui/`
4. **Routes**: Add new routes in `src/routes/` and register in `router.tsx`
5. **Styling**: Use Tailwind utility classes and shadcn/ui components

### PWA Caching Strategy

The app uses different caching strategies:
- **CacheFirst** for TMDB API and images (faster subsequent loads)
- **NetworkFirst** for user-generated content (fresh data priority)
- Automatic cache invalidation based on age

Modify caching in `vite.config.ts` under the `VitePWA` plugin configuration.

## Contributing

When contributing to this project:

1. Follow the existing code structure and patterns
2. Use TypeScript strictly - no `any` types without justification
3. Test offline functionality for any user-facing features
4. Ensure components are accessible (use shadcn/ui patterns)
5. Update this README for significant architectural changes
6. Run `npm run lint` before committing

## Architecture Decisions

- **Convex over traditional REST**: Real-time updates, type safety, and serverless scaling
- **React Router 7**: Modern data fetching patterns with loaders/actions
- **PWA-first**: Mobile app-like experience without app store friction
- **shadcn/ui**: Copy-paste components for full customization vs. npm packages
- **Clerk**: Robust auth without building custom solutions

## Future Considerations

- **Testing**: Add Vitest for unit tests and Playwright for E2E
- **Internationalization**: i18n support for multiple languages
- **Push Notifications**: Notify users of friend activity
- **Social Features**: Friend requests, comments on reviews
- **Lists**: Custom movie lists and collections
- **Stats Dashboard**: Viewing statistics and insights
