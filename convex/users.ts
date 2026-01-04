import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { PrivacySetting } from "@/types/db";

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).first();
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
      privacySetting: PrivacySetting.PUBLIC,
      updatedAt,
    })
  },
})
