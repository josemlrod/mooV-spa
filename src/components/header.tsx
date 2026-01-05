import { useAuth } from "@clerk/react-router";
import { LogOut, Film } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import useUserData from "@/hooks/useUserData";

export function Header() {
  const { signOut } = useAuth();
  const { profileImageUrl } = useUserData();

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-4 pt-[var(--safe-area-inset-top)] backdrop-blur-xl lg:hidden"
      style={{ viewTransitionName: "header", minHeight: "calc(4rem + var(--safe-area-inset-top, 0px))" }}
    >
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
        <Film className="h-6 w-6 text-primary" />
        <span>MooV</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "rounded-full h-10 w-10 border border-border/50 bg-background/50 cursor-pointer",
          )}
        >
          <Avatar className="shrink-0">
            <AvatarImage src={profileImageUrl} alt="user avatar" />
          </Avatar>
          <span className="sr-only">Open user menu</span>
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
    </header>
  );
}
