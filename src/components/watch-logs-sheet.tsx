import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Star, Calendar, Clapperboard, RefreshCw, ArrowLeft, Eye, Users, Lock } from "lucide-react";

import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, useMediaQuery } from "@/lib/utils";

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

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getVisibilityIcon(visibility: string) {
  switch (visibility) {
    case "public":
      return <Eye className="h-3 w-3" />;
    case "friends":
      return <Users className="h-3 w-3" />;
    case "private":
      return <Lock className="h-3 w-3" />;
    default:
      return null;
  }
}

interface WatchLogDetailViewProps {
  log: WatchLog;
  onBack?: () => void;
}

export function WatchLogDetailView({ log, onBack }: WatchLogDetailViewProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-300">
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="self-start gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Star
            className={cn(
              "h-6 w-6 fill-current",
              getRatingColor(log.rating ?? 0)
            )}
          />
          <span
            className={cn(
              "text-3xl font-bold tabular-nums",
              getRatingColor(log.rating ?? 0)
            )}
          >
            {log.rating?.toFixed(1)}
          </span>
          <span className="text-lg text-muted-foreground">/ 10</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {log.isRewatch && (
            <Badge variant="secondary" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Rewatch
            </Badge>
          )}
          {log.watchedInTheater && (
            <Badge variant="secondary" className="gap-1.5">
              <Clapperboard className="h-3.5 w-3.5" />
              Theater
            </Badge>
          )}
          <Badge variant="outline" className="gap-1.5 capitalize">
            {getVisibilityIcon(log.visibility)}
            {log.visibility}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Watched on {formatFullDate(log.watchedAt)}</span>
        </div>

        {log.reviewText && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Review</p>
            <p className="text-foreground/90 leading-relaxed">
              {log.reviewText}
            </p>
          </div>
        )}

        {log.watchedInTheater && (log.theaterName || log.theaterCity || log.theaterFormat) && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Theater Details
            </p>
            <div className="flex flex-col gap-1 text-sm">
              {log.theaterName && (
                <p className="font-medium">{log.theaterName}</p>
              )}
              {log.theaterCity && (
                <p className="text-muted-foreground">{log.theaterCity}</p>
              )}
              {log.theaterFormat && (
                <Badge variant="secondary" className="self-start uppercase text-xs">
                  {log.theaterFormat}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface WatchLogsListProps {
  logs: WatchLog[];
  onSelectLog: (log: WatchLog) => void;
}

function WatchLogsList({ logs, onSelectLog }: WatchLogsListProps) {
  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
      {logs.map((log: WatchLog, index: number) => (
        <button
          key={log._id}
          type="button"
          onClick={() => onSelectLog(log)}
          className={cn(
            "p-4 rounded-lg border bg-card text-left animate-in fade-in slide-in-from-bottom-2",
            "transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer"
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
                <p className="mt-2 text-sm text-foreground/80 line-clamp-2">
                  {log.reviewText}
                </p>
              )}

              {log.watchedInTheater && log.theaterName && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {log.theaterName}
                  {log.theaterCity && ` \u2022 ${log.theaterCity}`}
                  {log.theaterFormat && (
                    <span className="uppercase"> \u2022 {log.theaterFormat}</span>
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
        </button>
      ))}
    </div>
  );
}

interface WatchLogsContentProps {
  isLoading: boolean;
  hasLogs: boolean;
  watchLogs: WatchLog[] | undefined;
  selectedLog: WatchLog | null;
  onSelectLog: (log: WatchLog) => void;
  onBack: () => void;
}

function WatchLogsContent({
  isLoading,
  hasLogs,
  watchLogs,
  selectedLog,
  onSelectLog,
  onBack,
}: WatchLogsContentProps) {
  if (selectedLog) {
    return <WatchLogDetailView log={selectedLog} onBack={onBack} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (!hasLogs) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Calendar className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground text-center">
          You haven't logged any watches for this movie yet.
        </p>
      </div>
    );
  }

  return <WatchLogsList logs={watchLogs!} onSelectLog={onSelectLog} />;
}

export function WatchLogsSheet({ open, onOpenChange, entity }: WatchLogsSheetProps) {
  const { user } = useUser();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedLog, setSelectedLog] = useState<WatchLog | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const watchLogsQuery = (api as any).watchLogs?.getWatchLogsByUserAndMovie;
  const watchLogs = useQuery(
    watchLogsQuery,
    user?.id && watchLogsQuery ? { clerkUserId: user.id, tmdbId: entity.id } : "skip"
  ) as WatchLog[] | undefined;

  const isLoading = watchLogs === undefined;
  const hasLogs = Boolean(watchLogs && watchLogs.length > 0);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedLog(null);
    }
    onOpenChange(newOpen);
  };

  const handleBack = () => {
    setSelectedLog(null);
  };

  const title = selectedLog ? "Watch log details" : "Your watch logs";
  const description = selectedLog
    ? `Logged on ${formatDate(selectedLog.watchedAt)}`
    : `Your viewing history for ${entity.title}`;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md" onCloseClick={() => handleOpenChange(false)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <WatchLogsContent
            isLoading={isLoading}
            hasLogs={hasLogs}
            watchLogs={watchLogs}
            selectedLog={selectedLog}
            onSelectLog={setSelectedLog}
            onBack={handleBack}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="px-6 pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <WatchLogsContent
          isLoading={isLoading}
          hasLogs={hasLogs}
          watchLogs={watchLogs}
          selectedLog={selectedLog}
          onSelectLog={setSelectedLog}
          onBack={handleBack}
        />
      </SheetContent>
    </Sheet>
  );
}
