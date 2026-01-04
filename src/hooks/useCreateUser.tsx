import { useUser } from "@clerk/clerk-react";
import { useConvex, useMutation } from "convex/react";

import { api } from "../../convex/_generated/api.js";

export async function useCreateUser() {
  const convex = useConvex();
  const clerkUser = useUser();

  const createUser = useMutation(api.users.createUser);

  if (clerkUser) {
    const { emailAddress } = clerkUser.user?.primaryEmailAddress || {
      emailAddress: "",
    };

    if (emailAddress && clerkUser.user?.id) {
      const user = await convex.query(api.users.getUser, {
        email: emailAddress,
      });

      if (!user) {
        await createUser({
          email: emailAddress,
          clerkUserId: clerkUser.user?.id,
          profileImageUrl: clerkUser.user?.imageUrl,
        });
      }
    }
  }
}
