import { NavLink } from "react-router";
import { House, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border/40 bg-background/80 pb-safe backdrop-blur-xl lg:hidden"
      style={{ viewTransitionName: "bottom-nav" }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors hover:bg-muted/50",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <House className="h-6 w-6" />
          <span>Home</span>
        </NavLink>
        
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors hover:bg-muted/50",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <User className="h-6 w-6" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
