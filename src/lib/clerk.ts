import { Clerk } from "@clerk/clerk-js";

export const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

export const clerk = new Clerk(PUBLISHABLE_KEY);

export const clerkLoaded = clerk.load();
