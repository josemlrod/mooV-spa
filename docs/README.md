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

---

## Implementation Checklist

When implementing the Convex backend:

- [ ] Install Convex dependencies
- [ ] Set up Convex project
- [ ] Copy schema from `database-schema.md` to `convex/schema.ts`
- [ ] Create mutations for CRUD operations
- [ ] Create queries for data retrieval
- [ ] Hook up `NewReview` component to create watch logs
- [ ] Update `profile.tsx` to display user's watch logs
- [ ] Add "watched" indicator on movie cards

---

## Related Documentation

- [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md) - Product vision and feature roadmap
- [README.md](../README.md) - Project setup and development guide
