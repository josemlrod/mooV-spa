import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Star, Calendar, Clapperboard, RefreshCw } from "lucide-react";

import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EntityInfo {
  id: number;
  title: string;
}

interface WatchLogsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: EntityInfo;
}

type WatchLog = Doc<"watchLogs">;

function getRatingColor(rating: number): string {
  if (rating <= 3) return "text-red-500";
  if (rating <= 5) return "text-orange-500";
  if (rating <= 7) return "text-yellow-500";
  return "text-green-500";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WatchLogsSheet({ open, onOpenChange, entity }: WatchLogsSheetProps) {
  const { user } = useUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const watchLogsQuery = (api as any).watchLogs?.getWatchLogsByUserAndMovie;
  const watchLogs = useQuery(
    watchLogsQuery,
    user?.id && watchLogsQuery ? { clerkUserId: user.id, tmdbId: entity.id } : "skip"
  ) as WatchLog[] | undefined;

  const isLoading = watchLogs === undefined;
  const hasLogs = watchLogs && watchLogs.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Your watch logs</SheetTitle>
          <SheetDescription>
            Your viewing history for {entity.title}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading logs...</p>
              </div>
            </div>
          ) : !hasLogs ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-center">
                You haven't logged any watches for this movie yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {watchLogs.map((log: WatchLog, index: number) => (
                <div
                  key={log._id}
                  className={cn(
                    "p-4 rounded-lg border bg-card animate-in fade-in slide-in-from-bottom-2",
                    "transition-all duration-200 hover:shadow-md"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star
                            className={cn(
                              "h-4 w-4 fill-current",
                              getRatingColor(log.rating ?? 0)
                            )}
                          />
                          <span
                            className={cn(
                              "font-semibold tabular-nums",
                              getRatingColor(log.rating ?? 0)
                            )}
                          >
                            {log.rating?.toFixed(1)}
                          </span>
                        </div>

                        {log.isRewatch && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <RefreshCw className="h-3 w-3" />
                            Rewatch
                          </Badge>
                        )}

                        {log.watchedInTheater && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Clapperboard className="h-3 w-3" />
                            Theater
                          </Badge>
                        )}
                      </div>

                      {log.reviewText && (
                        <p className="mt-2 text-sm text-foreground/80 line-clamp-3">
                          {log.reviewText}
                        </p>
                      )}

                      {log.watchedInTheater && log.theaterName && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {log.theaterName}
                          {log.theaterCity && ` • ${log.theaterCity}`}
                          {log.theaterFormat && (
                            <span className="uppercase"> • {log.theaterFormat}</span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.watchedAt)}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs capitalize"
                      >
                        {log.visibility}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
