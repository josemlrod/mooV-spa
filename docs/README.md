# MooV Documentation

This directory contains technical documentation for the MooV project.

## Contents

### [database-schema.md](./database-schema.md)
Complete database schema documentation for MooV's Convex backend.

**Includes:**
- MVP table definitions (users, movies, watchLogs)
- Convex schema code with TypeScript types
- Common query patterns
- Validation rules
- Future expansion plans (Phase 2-4)

**Quick Reference:**
- 3 core tables for MVP
- Theater-first movie tracking
- Privacy controls built-in
- Rewatch support
- Extensible for social features

### Phase 2 - Activity Feed (Completed)
Minimal social interaction feature for viewing public activity across all users.

**Includes:**
- Public activity feed route (`/activity`)
- View other users' profiles (`/profile/:username`)
- Activity navigation in mobile and desktop navs
- Privacy-aware filtering (public logs only)
- Pagination with "Load More" functionality
- Relative time display for recent activity

**Quick Reference:**
- No likes, comments, or follows (minimal social)
- Encourages public sharing of movie logs
- Username-based profile URLs
- Reuses existing WatchLog components

---

## Implementation Checklist

### MVP - Convex Backend (Completed)
- [x] Install Convex dependencies
- [x] Set up Convex project
- [x] Copy schema from `database-schema.md` to `convex/schema.ts`
- [x] Create mutations for CRUD operations
- [x] Create queries for data retrieval
- [x] Hook up `NewReview` component to create watch logs
- [x] Update `profile.tsx` to display user's watch logs
- [x] Add "watched" indicator on movie cards

### Phase 2 - Activity Feed (Completed)
- [x] Add `by_visibility_and_created` index to watchLogs
- [x] Create public activity feed queries
- [x] Build `/activity` route UI
- [x] Update profile to support viewing other users
- [x] Add Activity to navigation components
- [x] Update router configuration
- [x] Update documentation

---

## Related Documentation

- [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md) - Product vision and feature roadmap
- [README.md](../README.md) - Project setup and development guide
