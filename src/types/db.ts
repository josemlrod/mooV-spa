import type { Doc } from "../../convex/_generated/dataModel";

export type User = Doc<"users">;
export type Movie = Doc<"movies">;
export type WatchLog = Doc<"watchLogs">;

export type PrivacySetting = "public" | "friends_only" | "private";
export const PrivacySetting = {
  PUBLIC: "public",
  FRIENDS_ONLY: "friends_only",
  PRIVATE: "private",
} as const;
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
