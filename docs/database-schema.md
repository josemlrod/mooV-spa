# MooV Database Schema (Convex)

## Overview
This document defines the database schema for MooV, a theater-first movie tracking and social app. We're using Convex as our database, which is a document-based (NoSQL) database with strong TypeScript integration.

## MVP Tables

### 1. `users`
Stores user profile information (supplements Clerk authentication)

**Schema:**
```typescript
{
  _id: Id<"users">,
  _creationTime: number,
  
  // Auth
  clerkUserId: string,        // Links to Clerk auth (unique, indexed)
  
  // Profile
  username: string | null,     // Custom username (unique if set)
  displayName: string | null,
  bio: string | null,
  profileImageUrl: string | null,
  
  // Settings
  privacySetting: "public" | "friends_only" | "private", // Default: "public"
  
  // Metadata
  updatedAt: number,
}
```

**Indexes:**
- `by_clerk_user_id` on `clerkUserId` (unique)
- `by_username` on `username` (sparse, for username lookups)

**Notes:**
- `clerkUserId` is the source of truth for authentication
- Username is optional (users can be identified by display name initially)
- Privacy setting will be inherited by watch logs by default

---

### 2. `movies`
Caches movie data from TMDB to reduce API calls and improve performance

**Schema:**
```typescript
{
  _id: Id<"movies">,
  _creationTime: number,
  
  // TMDB Data
  tmdbId: number,              // TMDB movie ID (unique, indexed)
  title: string,
  releaseDate: string | null,  // ISO date string
  runtime: number | null,      // Minutes
  overview: string | null,
  posterPath: string | null,
  backdropPath: string | null,
  voteAverage: number | null,
  
  // Rich Data (stored as objects for flexibility)
  genres: Array<{
    id: number,
    name: string
  }> | null,
  
  cast: Array<{
    id: number,
    name: string,
    character: string,
    order: number
  }> | null,
  
  // Full TMDB response for future extensibility
  tmdbData: any | null,
  
  // Cache Management
  lastSyncedAt: number,
  
  // Metadata
  updatedAt: number,
}
```

**Indexes:**
- `by_tmdb_id` on `tmdbId` (unique, for lookups)
- `by_title` on `title` (for search)

**Notes:**
- Cache TMDB data to avoid repeated API calls
- `lastSyncedAt` allows for cache invalidation/refresh strategies
- `tmdbData` stores full API response for fields we might need later

---

### 3. `watchLogs`
The core action - logging a movie watch

**Schema:**
```typescript
{
  _id: Id<"watchLogs">,
  _creationTime: number,
  
  // Relationships
  userId: Id<"users">,         // Indexed
  movieId: Id<"movies">,       // Indexed
  tmdbId: number,              // Denormalized for queries
  
  // Watch Details
  watchedAt: string,           // ISO date string, default: today
  rating: number | null,       // 0-10 (one decimal), nullable
  reviewText: string | null,
  isRewatch: boolean,          // Default: false
  
  // Theater Info (MVP: minimal, no theater table)
  watchedInTheater: boolean,   // Default: false
  theaterName: string | null,  // Free-form for MVP
  theaterCity: string | null,
  theaterFormat: "standard" | "imax" | "dolby" | "3d" | "70mm" | "35mm" | null,
  
  // Privacy
  visibility: "public" | "friends" | "private", // Inherits from user setting
  
  // Metadata
  updatedAt: number,
}
```

**Indexes:**
- `by_user_id` on `userId` (for user's watch history)
- `by_movie_id` on `movieId` (for movie's watch logs)
- `by_user_and_movie` on `userId, movieId` (for checking if user watched movie)
- `by_watched_at` on `watchedAt` (for chronological feeds)
- `by_user_and_watched_at` on `userId, watchedAt` (for user's timeline)
- `by_visibility` on `visibility` (for public activity feed - `_creationTime` is auto-appended)
- `by_visibility_and_created` on `visibility, _creationTime` (for public feed)

**Notes:**
- Supports multiple logs per user/movie (rewatches)
- Rating is optional (can log without rating)
- Theater fields are free-form strings for MVP (structured theater table later)
- `tmdbId` is denormalized to avoid joins when querying by movie

---

## Data Relationships

```
users (1) ----< (many) watchLogs
movies (1) ----< (many) watchLogs

User can have many watch logs
Movie can have many watch logs
Each watch log belongs to one user and one movie
```

## Validation Rules

### `users` table:
- `clerkUserId` must be unique and non-empty
- `username` must be unique if set (allow null)
- `privacySetting` must be one of: "public", "friends_only", "private"

### `movies` table:
- `tmdbId` must be unique and positive integer
- `title` must be non-empty
- `runtime` must be positive if set
- `voteAverage` must be 0-10 if set

### `watchLogs` table:
- `userId` must reference valid user
- `movieId` must reference valid movie
- `rating` must be 0-10 with max 1 decimal place if set
- `watchedAt` must be valid ISO date string
- `theaterFormat` must be one of allowed values if set
- `visibility` must be one of: "public", "friends", "private"

---

## Convex Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    username: v.union(v.string(), v.null()),
    displayName: v.union(v.string(), v.null()),
    bio: v.union(v.string(), v.null()),
    profileImageUrl: v.union(v.string(), v.null()),
    privacySetting: v.union(
      v.literal("public"),
      v.literal("friends_only"),
      v.literal("private")
    ),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_username", ["username"]),

  movies: defineTable({
    tmdbId: v.number(),
    title: v.string(),
    releaseDate: v.union(v.string(), v.null()),
    runtime: v.union(v.number(), v.null()),
    overview: v.union(v.string(), v.null()),
    posterPath: v.union(v.string(), v.null()),
    backdropPath: v.union(v.string(), v.null()),
    voteAverage: v.union(v.number(), v.null()),
    genres: v.union(
      v.array(
        v.object({
          id: v.number(),
          name: v.string(),
        })
      ),
      v.null()
    ),
    cast: v.union(
      v.array(
        v.object({
          id: v.number(),
          name: v.string(),
          character: v.string(),
          order: v.number(),
        })
      ),
      v.null()
    ),
    tmdbData: v.any(),
    lastSyncedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tmdb_id", ["tmdbId"])
    .index("by_title", ["title"]),

  watchLogs: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    tmdbId: v.number(),
    watchedAt: v.string(),
    rating: v.union(v.number(), v.null()),
    reviewText: v.union(v.string(), v.null()),
    isRewatch: v.boolean(),
    watchedInTheater: v.boolean(),
    theaterName: v.union(v.string(), v.null()),
    theaterCity: v.union(v.string(), v.null()),
    theaterFormat: v.union(
      v.literal("standard"),
      v.literal("imax"),
      v.literal("dolby"),
      v.literal("3d"),
      v.literal("70mm"),
      v.literal("35mm"),
      v.null()
    ),
    visibility: v.union(
      v.literal("public"),
      v.literal("friends"),
      v.literal("private")
    ),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_movie_id", ["movieId"])
    .index("by_user_and_movie", ["userId", "movieId"])
    .index("by_watched_at", ["watchedAt"])
    .index("by_user_and_watched_at", ["userId", "watchedAt"])
    .index("by_visibility", ["visibility"]),
});
```

---

## TypeScript Types

```typescript
// types/database.ts
import { Doc, Id } from "./_generated/dataModel";

export type User = Doc<"users">;
export type Movie = Doc<"movies">;
export type WatchLog = Doc<"watchLogs">;

export type PrivacySetting = "public" | "friends_only" | "private";
export type Visibility = "public" | "friends" | "private";
export type TheaterFormat = "standard" | "imax" | "dolby" | "3d" | "70mm" | "35mm";

// For creating new records
export type NewUser = Omit<User, "_id" | "_creationTime">;
export type NewMovie = Omit<Movie, "_id" | "_creationTime">;
export type NewWatchLog = Omit<WatchLog, "_id" | "_creationTime">;

// Rich types for embedded objects
export type MovieGenre = {
  id: number;
  name: string;
};

export type MovieCastMember = {
  id: number;
  name: string;
  character: string;
  order: number;
};
```

---

## Common Queries

### Get user by Clerk ID
```typescript
const user = await ctx.db
  .query("users")
  .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
  .unique();
```

### Get or create movie from TMDB ID
```typescript
const movie = await ctx.db
  .query("movies")
  .withIndex("by_tmdb_id", (q) => q.eq("tmdbId", tmdbId))
  .unique();
```

### Get user's watch logs (recent first)
```typescript
const watchLogs = await ctx.db
  .query("watchLogs")
  .withIndex("by_user_and_watched_at", (q) => q.eq("userId", userId))
  .order("desc")
  .take(20);
```

### Check if user has watched a movie
```typescript
const hasWatched = await ctx.db
  .query("watchLogs")
  .withIndex("by_user_and_movie", (q) => 
    q.eq("userId", userId).eq("movieId", movieId)
  )
  .first();
```

### Get public feed
```typescript
const publicFeed = await ctx.db
  .query("watchLogs")
  .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
  .order("desc")
  .take(50);
```

---

## Phase 2 - Minimal Social (Completed)

### Implemented Features:
- **Public Activity Feed** - View all users' public watch logs at `/activity` route
- **User Profile Viewing** - View other users' public profiles via `/profile/:username`
- **Activity Navigation** - Added Activity link to bottom nav (mobile) and side nav (desktop)
- **Privacy Filtering** - Only public logs appear in activity feed and on other users' profiles

### Database Changes:
- Added `by_visibility` index to `watchLogs` for efficient public feed queries
- Added `getUserByUsername` query to look up users by username
- Added `getPublicActivityFeed` query with pagination support
- Added `getPublicActivityCount` query for metrics

---

## Future Expansion (Post-MVP)

### Phase 2b - Enhanced Social Tables:
- **`lists`** - User watchlists, custom lists, favorites
- **`listItems`** - Movies in lists (many-to-many)
- **`follows`** - User follow/friend relationships
- **`likes`** - Likes on watch logs
- **`comments`** - Comments on watch logs
- **`tags`** - User-defined tags
- **`watchLogTags`** - Tags applied to watch logs (many-to-many)

### Phase 3 Tables:
- **`theaters`** - Structured theater data (when we have a data source)
- **`circles`** - Friend groups for movie planning
- **`circleMembers`** - Users in circles
- **`circlePolls`** - Movie night polls
- **`circlePollOptions`** - Movie options in polls
- **`circlePollVotes`** - User votes on polls

### Phase 4 Tables (AI Features):
- **`recommendations`** - AI-generated recommendations
- **`wrapUps`** - Annual wrap-up reports
- **`tasteProfiles`** - User taste analysis

---

## Migration Strategy

Since we're starting fresh:
1. Create Convex project and install dependencies
2. Define schema in `convex/schema.ts`
3. Create initial mutations/queries for CRUD operations
4. Hook up UI components to Convex
5. Test with sample data

For future schema changes:
- Convex handles schema evolution automatically
- Adding fields: New fields can be added with sensible defaults
- Removing fields: Old data remains, queries ignore missing fields
- Renaming: Requires data migration via mutation

---

## Notes

- **No CASCADE deletes**: Convex requires manual cleanup. If a user is deleted, decide whether to delete or anonymize their watch logs
- **No transactions yet**: Convex doesn't support multi-document transactions in MVP. Keep mutations atomic where possible
- **Indexes are critical**: Always query using indexes for performance
- **Denormalization**: `tmdbId` in watchLogs is intentionally denormalized for query performance

---

## Questions / Decisions Made

✅ **Theater data**: Free-form strings for MVP (structured later)
✅ **Tags**: Punted to Phase 2
✅ **Lists**: Punted to Phase 2
✅ **Social features**: Punted to Phase 2
✅ **AI features**: Punted to Phase 4
✅ **Schema files**: Committed to git in `/docs` directory

---

## Visual Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MooV MVP Schema                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       users          │
│──────────────────────│
│ _id (PK)             │
│ clerkUserId (UK)     │◄────────┐
│ username             │         │
│ displayName          │         │
│ bio                  │         │
│ profileImageUrl      │         │
│ privacySetting       │         │
│ updatedAt            │         │
└──────────────────────┘         │
                                 │
                                 │ userId (FK)
                                 │
┌──────────────────────┐         │
│      movies          │         │
│──────────────────────│         │
│ _id (PK)             │◄────┐   │
│ tmdbId (UK)          │     │   │
│ title                │     │   │
│ releaseDate          │     │   │
│ runtime              │     │   │
│ overview             │     │ movieId (FK)
│ posterPath           │     │   │
│ backdropPath         │     │   │
│ voteAverage          │     │   │
│ genres (JSON)        │     │   │
│ cast (JSON)          │     │   │
│ tmdbData (JSON)      │     │   │
│ lastSyncedAt         │     │   │
│ updatedAt            │     │   │
└──────────────────────┘     │   │
                             │   │
                             │   │
                    ┌────────┴───┴──────────┐
                    │     watchLogs         │
                    │───────────────────────│
                    │ _id (PK)              │
                    │ userId (FK)           │
                    │ movieId (FK)          │
                    │ tmdbId (denormalized) │
                    │ watchedAt             │
                    │ rating                │
                    │ reviewText            │
                    │ isRewatch             │
                    │ watchedInTheater      │
                    │ theaterName           │
                    │ theaterCity           │
                    │ theaterFormat         │
                    │ visibility            │
                    │ updatedAt             │
                    └───────────────────────┘

Relationships:
- users → watchLogs (1:many) via userId
- movies → watchLogs (1:many) via movieId
- Users can create multiple watch logs
- Movies can have multiple watch logs from different users
- Watch logs can be for rewatches (same user + movie, multiple times)
```

---

## Example Data Flow

### User logs a movie watch:

```
1. User clicks "Review" button on movie detail page
   ↓
2. NewReview component captures:
   - rating (0-10)
   - reviewText (optional)
   - watchedAt (defaults to today)
   ↓
3. Frontend calls Convex mutation: createWatchLog()
   ↓
4. Backend:
   a. Get/create user record (by clerkUserId)
   b. Get/create movie record (by tmdbId, cache TMDB data)
   c. Create watchLog record linking user + movie
   d. Set visibility based on user's privacy setting
   ↓
5. Frontend:
   - Update UI to show "watched" indicator
   - Redirect to profile or movie detail page
   - Display success message
```

### User views their profile:

```
1. User navigates to /profile
   ↓
2. Frontend calls Convex query: getUserWatchLogs(userId)
   ↓
3. Backend:
   - Query watchLogs by userId (indexed)
   - Join with movies table to get movie details
   - Sort by watchedAt DESC
   ↓
4. Frontend:
   - Display user's watch history
   - Show stats (total movies, avg rating, etc.)
   - Allow filtering by rating, date, etc.
```

---

## Implementation Priority

### Phase 1 - Schema & Documentation (Completed):
1. ✅ Define schema in documentation
2. ✅ Create `/docs` directory structure
3. ✅ Commit schema files to git

### Phase 1b - Convex Backend (Completed):
1. ✅ Install Convex dependencies
2. ✅ Initialize Convex project
3. ✅ Implement schema in `convex/schema.ts`
4. ✅ Create mutations (createUser, createMovie, createWatchLog)
5. ✅ Create queries (getUser, getMovie, getUserWatchLogs)
6. ✅ Add error handling and validation

### Phase 1c - UI Integration (Completed):
1. ✅ Hook up NewReview component to createWatchLog mutation
2. ✅ Update profile page to display watch logs
3. ✅ Add "watched" badges to movie cards
4. ✅ Implement privacy controls

### Phase 2 - Activity Feed (Completed):
1. ✅ Added `by_visibility` index to watchLogs schema
2. ✅ Created `getPublicActivityFeed` query with pagination
3. ✅ Created `getPublicActivityCount` query
4. ✅ Created `getUserByUsername` query
5. ✅ Built `/activity` route with public feed UI
6. ✅ Updated `/profile` to `/profile/:username?` for viewing other users
7. ✅ Added Activity to bottom navigation (mobile)
8. ✅ Added Activity to side navigation (desktop)
9. ✅ Created `ActivityCard` component
10. ✅ Implemented privacy filtering (public logs only)

### Phase 3 (Next - Polish):
1. Add loading states
2. Add error messages
3. Add success toasts
4. Add optimistic updates
5. Test edge cases (rewatches, duplicate prevention)

