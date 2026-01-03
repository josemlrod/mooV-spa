import { Outlet, ScrollRestoration } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";
import { clerk, PUBLISHABLE_KEY } from "@/lib/clerk";

export default function AppWithProviders() {
  return (
    <ClerkProvider Clerk={clerk} publishableKey={PUBLISHABLE_KEY}>
      <ScrollRestoration />
      <Outlet />
    </ClerkProvider>
  );
}
