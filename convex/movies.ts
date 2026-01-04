import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getMovieByTmdbId = query({
  args: { tmdbId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .withIndex("by_tmdb_id", (q) => q.eq("tmdbId", args.tmdbId))
      .first();
  },
});

export const upsertMovie = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existingMovie = await ctx.db
      .query("movies")
      .withIndex("by_tmdb_id", (q) => q.eq("tmdbId", args.tmdbId))
      .first();

    const now = Date.now();

    if (existingMovie) {
      await ctx.db.patch(existingMovie._id, {
        title: args.title,
        releaseDate: args.releaseDate,
        runtime: args.runtime,
        overview: args.overview,
        posterPath: args.posterPath,
        backdropPath: args.backdropPath,
        voteAverage: args.voteAverage,
        genres: args.genres,
        cast: args.cast,
        tmdbData: args.tmdbData,
        lastSyncedAt: now,
        updatedAt: now,
      });
      return existingMovie._id;
    }

    return await ctx.db.insert("movies", {
      tmdbId: args.tmdbId,
      title: args.title,
      releaseDate: args.releaseDate,
      runtime: args.runtime,
      overview: args.overview,
      posterPath: args.posterPath,
      backdropPath: args.backdropPath,
      voteAverage: args.voteAverage,
      genres: args.genres,
      cast: args.cast,
      tmdbData: args.tmdbData,
      lastSyncedAt: now,
      updatedAt: now,
    });
  },
});
