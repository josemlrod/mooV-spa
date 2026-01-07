import { formatDistanceToNow } from "date-fns";
import { Star, Calendar, Clapperboard, RefreshCw, Film } from "lucide-react";
import { useNavigate } from "react-router";

import type { Doc } from "../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: {
    log: Doc<"watchLogs">;
    user: {
      displayName: string | null;
      username: string | null;
      profileImageUrl: string | null;
    } | null;
    movie: {
      title: string;
      posterPath: string | null;
      releaseDate: string | null;
    } | null;
  };
  onClick: () => void;
  index: number;
}

function getRatingColor(rating: number): string {
  if (rating <= 3) return "text-red-500";
  if (rating <= 5) return "text-orange-500";
  if (rating <= 7) return "text-yellow-500";
  return "text-green-500";
}

export function ActivityCard({ activity, onClick, index }: ActivityCardProps) {
  const navigate = useNavigate();
  const { log, user, movie } = activity;

  if (!user || !movie) return null;

  const displayName = user.displayName || "Unknown User";
  const username = user.username || "unknown";
  const relativeTime = formatDistanceToNow(new Date(log.watchedAt), {
    addSuffix: true,
  });

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.username) {
      navigate(`/profile/${user.username}`);
    }
  };

  return (
    <Card
      className="overflow-hidden hover:bg-muted/20 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards cursor-pointer hover:shadow-md hover:border-primary/30"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        <div className="shrink-0 h-[120px] w-[80px] bg-muted rounded-md overflow-hidden shadow-sm relative">
          {movie.posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-secondary">
              <Film className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <button
            type="button"
            className="flex items-center gap-2 group/user cursor-pointer w-fit text-left"
            onClick={handleUserClick}
          >
            <Avatar className="h-8 w-8 ring-2 ring-background group-hover/user:ring-primary transition-all">
              <AvatarImage
                src={user.profileImageUrl || undefined}
                alt={displayName}
              />
              <AvatarFallback className="text-xs bg-muted">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold group-hover/user:text-primary transition-colors truncate">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground group-hover/user:text-primary/70 transition-colors truncate">
                @{username}
              </span>
            </div>
          </button>

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">watched</p>
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {movie.title}
              </h3>
            </div>

            {log.rating && (
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full shrink-0">
                <Star
                  className={cn(
                    "h-3.5 w-3.5 fill-current",
                    getRatingColor(log.rating)
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    getRatingColor(log.rating)
                  )}
                >
                  {log.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {log.isRewatch && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 gap-1 font-normal"
              >
                <RefreshCw className="h-3 w-3" /> Rewatch
              </Badge>
            )}
            {log.watchedInTheater && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 gap-1 font-normal"
              >
                <Clapperboard className="h-3 w-3" /> Theater
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar className="h-3 w-3" />
              <span>{relativeTime}</span>
            </div>
          </div>

          {log.reviewText && (
            <p className="text-sm text-foreground/80 line-clamp-2 italic border-l-2 border-primary/20 pl-2 mt-1">
              "{log.reviewText}"
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
