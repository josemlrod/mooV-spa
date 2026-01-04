import { NavLink } from "react-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import { House, User, Film, LogOut, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SideNav() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { imageUrl } = user || { imageUrl: "" };
  const { emailAddress } = user?.primaryEmailAddress || { emailAddress: "" };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 hidden w-[240px] border-r border-border/40 bg-background/95 backdrop-blur-sm lg:flex lg:flex-col"
      style={{ viewTransitionName: "side-nav" }}
    >
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <Film className="h-6 w-6 text-primary" />
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

          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted/50",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <SearchIcon className="h-5 w-5" />
            <span>Search</span>
          </NavLink>
        </nav>
      </div>

      <Separator />

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start gap-3 h-auto py-2 rounded-tr-none rounded-tl-none",
          )}
        >
          <Avatar className="shrink-0">
            <AvatarImage src={imageUrl} alt="user avatar" />
          </Avatar>
          <span className="truncate min-w-0">{emailAddress}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
