import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { Loader2, Film, Users } from "lucide-react";
import { useNavigate } from "react-router";

import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { ActivityCard } from "@/components/activity-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { WatchLogDetailView } from "@/components/watch-logs-sheet";
import { useMediaQuery } from "@/lib/utils";

const ITEMS_PER_PAGE = 20;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type ActivityItem = {
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

export default function Activity() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [offset, setOffset] = useState(0);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<Doc<"watchLogs"> | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const activityData = useQuery(api.watchLogs.getPublicActivityFeed, {
    limit: ITEMS_PER_PAGE,
    offset,
  });

  const totalCount = activityData?.activities.length;

  useEffect(() => {
    if (activityData?.activities) {
      if (offset === 0) {
        setAllActivities(activityData.activities);
      } else {
        setAllActivities((prev) => {
          const existingIds = new Set(prev.map((a) => a.log._id));
          const newActivities = activityData.activities.filter(
            (a) => !existingIds.has(a.log._id),
          );
          return [...prev, ...newActivities];
        });
      }
      setIsLoadingMore(false);
    }
  }, [activityData, offset]);

  const isLoading = activityData === undefined && offset === 0;
  const hasMore = activityData?.hasMore ?? false;
  const isEmpty = allActivities.length === 0 && !isLoading;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setOffset(allActivities.length);
  };

  const handleActivityClick = (log: Doc<"watchLogs">) => {
    setSelectedLog(log);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Activity Feed
              </h1>
              {totalCount !== undefined && totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {totalCount} public {totalCount === 1 ? "log" : "logs"}
                </p>
              )}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex gap-4 p-4">
                  <div className="shrink-0 h-[120px] w-[80px] bg-muted rounded-md" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="flex flex-col gap-1">
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-2 w-16 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {isEmpty && (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Film className="h-8 w-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No public activity yet
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Be the first to share your movie watches! Start logging movies
                with public visibility to appear here.
              </p>
              <Button
                variant="default"
                onClick={() => navigate("/search")}
                className="gap-2"
              >
                <Film className="h-4 w-4" />
                Search Movies
              </Button>
            </CardContent>
          </Card>
        )}

        {allActivities.length > 0 && (
          <div className="flex flex-col gap-4">
            {allActivities.map((activity, index) => (
              <ActivityCard
                key={activity.log._id}
                activity={activity}
                onClick={() => handleActivityClick(activity.log)}
                index={index}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}

            {!hasMore && allActivities.length > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                You've reached the end of the activity feed
              </p>
            )}
          </div>
        )}
      </div>

      {isDesktop ? (
        <Dialog
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
        >
          <DialogContent
            className="sm:max-w-md"
            onCloseClick={() => setSelectedLog(null)}
          >
            <DialogHeader>
              <DialogTitle>Watch log details</DialogTitle>
              <DialogDescription>
                {selectedLog
                  ? `Logged on ${formatDate(selectedLog.watchedAt)}`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            {selectedLog && <WatchLogDetailView log={selectedLog} />}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
        >
          <SheetContent
            side="bottom"
            className="px-6 pb-8 max-h-[90vh] overflow-y-auto"
          >
            <SheetHeader className="pb-4">
              <SheetTitle>Watch log details</SheetTitle>
              <SheetDescription>
                {selectedLog
                  ? `Logged on ${formatDate(selectedLog.watchedAt)}`
                  : ""}
              </SheetDescription>
            </SheetHeader>
            {selectedLog && <WatchLogDetailView log={selectedLog} />}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
