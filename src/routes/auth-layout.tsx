import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <main className="h-full flex items-center justify-center container mx-auto px-4 lg:px-8 space-y-6">
      <Outlet />
    </main>
  );
}
