import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const createWatchLog = mutation({
  args: {
    clerkUserId: v.string(),
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
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();

    return await ctx.db.insert("watchLogs", {
      userId: user._id,
      movieId: args.movieId,
      tmdbId: args.tmdbId,
      watchedAt: args.watchedAt,
      rating: args.rating,
      reviewText: args.reviewText,
      isRewatch: args.isRewatch,
      watchedInTheater: args.watchedInTheater,
      theaterName: args.theaterName,
      theaterCity: args.theaterCity,
      theaterFormat: args.theaterFormat,
      visibility: args.visibility,
      updatedAt: now,
    });
  },
});

export const getWatchLogsByUserAndMovie = query({
  args: {
    clerkUserId: v.string(),
    tmdbId: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      return [];
    }

    const movie = await ctx.db
      .query("movies")
      .withIndex("by_tmdb_id", (q) => q.eq("tmdbId", args.tmdbId))
      .first();

    if (!movie) {
      return [];
    }

    const logs = await ctx.db
      .query("watchLogs")
      .withIndex("by_user_and_movie", (q) =>
        q.eq("userId", user._id).eq("movieId", movie._id)
      )
      .collect();

    return logs.sort((a, b) => 
      new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
    );
  },
});

export const getWatchLogsByUser = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      return [];
    }

    const logs = await ctx.db
      .query("watchLogs")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    const logsWithMovies = await Promise.all(
      logs.map(async (log) => {
        const movie = await ctx.db.get(log.movieId);
        return {
          ...log,
          movieTitle: movie?.title,
          moviePoster: movie?.posterPath,
          movieReleaseDate: movie?.releaseDate,
        };
      })
    );

    return logsWithMovies.sort((a, b) =>
      new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
    );
  },
});

export const getUserStats = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      return { totalLogs: 0, uniqueMovies: 0, rewatches: 0, theaterVisits: 0 };
    }

    const logs = await ctx.db
      .query("watchLogs")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    const uniqueMovieIds = new Set(logs.map((log) => log.movieId));
    const rewatches = logs.filter((log) => log.isRewatch).length;
    const theaterVisits = logs.filter((log) => log.watchedInTheater).length;

    return {
      totalLogs: logs.length,
      uniqueMovies: uniqueMovieIds.size,
      rewatches,
      theaterVisits,
    };
  },
});
