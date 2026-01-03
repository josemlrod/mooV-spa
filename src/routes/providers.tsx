import { Outlet } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function AppWithProviders() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Outlet />
    </ClerkProvider>
  );
}
