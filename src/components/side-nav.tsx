import { NavLink } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { House, User, Film } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function SideNav() {
  const {
    user: { imageUrl, primaryEmailAddress },
  } = useUser();
  const { emailAddress } = primaryEmailAddress;

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 hidden w-[240px] border-r border-border/40 bg-background/95 backdrop-blur-sm lg:flex lg:flex-col"
      style={{ viewTransitionName: "side-nav" }}
    >
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Film className="h-6 w-6" />
          <span>MooV</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted/50",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <House className="h-5 w-5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted/50",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      <Separator />

      <Button
        variant="ghost"
        className="w-full justify-start gap-3 h-auto py-2"
      >
        <Avatar className="shrink-0">
          <AvatarImage src={imageUrl} alt="user avatar" />
        </Avatar>
        <span className="truncate min-w-0">{emailAddress}</span>
      </Button>
    </aside>
  );
}
