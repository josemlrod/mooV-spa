import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/server";

export function meta() {
  return [
    { title: "Profile | MooV" },
    { name: "description", content: "Your MooV profile" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/auth");
  }

  return { userId };
}

export default function Profile() {
  return (
    <div className="container mx-auto px-4 lg:px-8 flex-1 flex flex-col items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
