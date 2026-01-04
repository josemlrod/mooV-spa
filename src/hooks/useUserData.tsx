import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api.js";

export default function useUserData() {
  const { user: clerkUser } = useUser();

  if (clerkUser) {
    const convexUser = useQuery(api.users.getUserByClerkId, {
      clerkUserId: clerkUser.id,
    });

    return {
      displayName: convexUser?.displayName ?? null,
      username: convexUser?.username ?? null,
      profileImageUrl:
        convexUser?.resolvedProfileImageUrl ?? clerkUser.imageUrl,
      emailAddress: clerkUser.primaryEmailAddress?.emailAddress,
    };
  }

  return {
    displayName: "",
    username: "",
    profileImageUrl: "",
    emailAddress: "",
  };
}
