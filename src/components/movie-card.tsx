import { Link, useViewTransitionState } from "react-router";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SearchType } from "@/routes/search";

interface MovieCardProps {
  id: number;
  posterUrl: string | null;
  title: string;
  voteAverage: number;
  releaseDate: string;
  className?: string;
}

export function MovieCard({
  id,
  posterUrl,
  title,
  voteAverage,
  releaseDate,
  className,
}: MovieCardProps) {
  const href = `/entity/${id}/${SearchType.MOVIE}`;
  const isTransitioning = useViewTransitionState(href);

  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating = voteAverage.toFixed(1);

  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      <Link
        to={href}
        viewTransition
        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-300 hover:shadow-md block"
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{
              viewTransitionName: isTransitioning
                ? `movie-poster-${id}`
                : "none",
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <span className="text-xs">No Poster</span>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white border-0 hover:bg-black/70"
          >
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </Badge>
        </div>
      </Link>

      <div className="space-y-1">
        <h3 className="font-semibold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {year && <p className="text-xs text-muted-foreground">{year}</p>}
      </div>
    </div>
  );
}
