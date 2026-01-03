import { Outlet } from "react-router";

import { Header } from "@/components/header";
import { SideNav } from "@/components/side-nav";
import { BottomNav } from "@/components/bottom-nav";

export default function Layout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SideNav />
      <Header />

      <main className="lg:pl-[240px] pb-24 lg:pb-8 pt-4 lg:pt-8">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
