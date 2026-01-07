import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    username: v.union(v.string(), v.null()),
    email: v.string(),
    displayName: v.union(v.string(), v.null()),
    bio: v.union(v.string(), v.null()),
    profileImageUrl: v.union(v.string(), v.null()),
    profileImageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    privacySetting: v.union(
      v.literal("public"),
      v.literal("friends_only"),
      v.literal("private")
    ),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"]),

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
