import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { PrivacySetting } from "@/types/db";

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).first();
  },
});

export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) return null;

    let profileImageUrl = user.profileImageUrl;
    if (user.profileImageStorageId) {
      const storageUrl = await ctx.storage.getUrl(user.profileImageStorageId);
      if (storageUrl) {
        profileImageUrl = storageUrl;
      }
    }

    return {
      ...user,
      resolvedProfileImageUrl: profileImageUrl,
    };
  },
});

export const createUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    profileImageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const updatedAt = new Date(Date.now()).getTime();
    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      username: null,
      email: args.email,
      displayName: null,
      bio: null,
      profileImageUrl: args.profileImageUrl,
      profileImageStorageId: null,
      privacySetting: PrivacySetting.PUBLIC,
      updatedAt,
    })
  },
});

export const updateUser = mutation({
  args: {
    clerkUserId: v.string(),
    username: v.optional(v.union(v.string(), v.null())),
    displayName: v.optional(v.union(v.string(), v.null())),
    bio: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.username !== undefined) updates.username = args.username;
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.bio !== undefined) updates.bio = args.bio;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

export const updateProfileImage = mutation({
  args: {
    clerkUserId: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.profileImageStorageId) {
      await ctx.storage.delete(user.profileImageStorageId);
    }

    await ctx.db.patch(user._id, {
      profileImageStorageId: args.storageId,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
