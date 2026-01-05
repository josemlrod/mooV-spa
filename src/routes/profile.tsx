import { useState, useEffect, useRef, useId } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import heic2any from "heic2any";
import {
  Film,
  Eye,
  RefreshCw,
  Clapperboard,
  Camera,
  Edit2,
  Save,
  X,
  Calendar,
  Star,
  Loader2,
} from "lucide-react";

import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WatchLogDetailView } from "@/components/watch-logs-sheet";
import { cn, useMediaQuery } from "@/lib/utils";

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

export default function Profile() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayNameId = useId();
  const usernameId = useId();
  const bioId = useId();
  const fileInputId = useId();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip",
  );

  const stats = useQuery(
    api.watchLogs.getUserStats,
    user?.id ? { clerkUserId: user.id } : "skip",
  );

  const logs = useQuery(
    api.watchLogs.getWatchLogsByUser,
    user?.id ? { clerkUserId: user.id } : "skip",
  );

  const updateUser = useMutation(api.users.updateUser);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateProfileImage = useMutation(api.users.updateProfileImage);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Doc<"watchLogs"> | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    bio: "",
  });

  useEffect(() => {
    if (convexUser) {
      setFormData({
        username: convexUser.username || "",
        displayName: convexUser.displayName || "",
        bio: convexUser.bio || "",
      });
    }
  }, [convexUser]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      let fileToUpload: Blob = file;
      let mimeType = file.type;

      const isHeic = file.type === "image/heic" || 
                     file.type === "image/heif" || 
                     file.name.toLowerCase().endsWith(".heic") ||
                     file.name.toLowerCase().endsWith(".heif");

      if (isHeic) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        fileToUpload = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        mimeType = "image/jpeg";
      }

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": mimeType },
        body: fileToUpload,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();
      await updateProfileImage({ clerkUserId: user.id, storageId });
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await updateUser({
        clerkUserId: user.id,
        username: formData.username || null,
        displayName: formData.displayName || null,
        bio: formData.bio || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (convexUser) {
      setFormData({
        username: convexUser.username || "",
        displayName: convexUser.displayName || "",
        bio: convexUser.bio || "",
      });
    }
    setIsEditing(false);
  };

  if (!convexUser) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-32 w-32 rounded-full bg-muted" />
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
      </div>
    );
  }

  const profileImage = convexUser.resolvedProfileImageUrl || user?.imageUrl;
  const displayName = convexUser.displayName || user?.fullName || "Movie Buff";
  const username = convexUser.username || user?.username || "movie_lover";

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-8 flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage
                    src={profileImage}
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-muted">
                    {displayName[0]}
                  </AvatarFallback>
                </Avatar>

                <Label
                  htmlFor={fileInputId}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-full",
                    "bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer",
                    isUploading && "opacity-100 cursor-wait",
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="h-6 w-6" />
                      <span className="text-xs font-medium">Change</span>
                    </div>
                  )}
                </Label>
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  ref={fileInputRef}
                />
              </div>

              <div className="w-full mt-6 space-y-4">
                {isEditing ? (
                  <div className="space-y-4 text-left animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <Label htmlFor={displayNameId}>Display Name</Label>
                      <Input
                        id={displayNameId}
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={usernameId}>Username</Label>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>@</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          id={usernameId}
                          value={formData.username}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                          placeholder="username"
                        />
                      </InputGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={bioId}>Bio</Label>
                      <Textarea
                        id={bioId}
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        placeholder="Tell us about your movie taste..."
                        className="resize-none min-h-[100px]"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <h1 className="text-2xl font-bold tracking-tight">
                      {displayName}
                    </h1>
                    <p className="text-muted-foreground font-medium">
                      @{username}
                    </p>

                    {convexUser.bio && (
                      <p className="mt-4 text-sm text-foreground/80 leading-relaxed max-w-sm mx-auto">
                        {convexUser.bio}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-6 w-full"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="mr-2 h-3.5 w-3.5" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center gap-2 text-center">
                <Film className="h-8 w-8 text-primary mb-1" />
                <div className="text-2xl font-bold">
                  {stats?.totalLogs || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Total Logs
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center gap-2 text-center">
                <Eye className="h-8 w-8 text-blue-500 mb-1" />
                <div className="text-2xl font-bold">
                  {stats?.uniqueMovies || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Unique
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center gap-2 text-center">
                <RefreshCw className="h-8 w-8 text-green-500 mb-1" />
                <div className="text-2xl font-bold">
                  {stats?.rewatches || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Rewatches
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center gap-2 text-center">
                <Clapperboard className="h-8 w-8 text-purple-500 mb-1" />
                <div className="text-2xl font-bold">
                  {stats?.theaterVisits || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Theaters
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent History
            </h2>

            {!logs || logs.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Film className="h-12 w-12 mb-4 opacity-20" />
                  <p>No movies logged yet.</p>
                  <p className="text-sm">
                    Start watching and logging to fill your profile!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 max-h-[60vh] lg:max-h-[50vh] overflow-y-auto pr-2 -mr-2">
                {logs.map((log, index) => (
                  <Card
                    key={log._id}
                    className="overflow-hidden hover:bg-muted/20 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards cursor-pointer hover:shadow-md hover:border-primary/30"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start p-4 gap-4">
                      <div className="shrink-0 h-24 w-16 bg-muted rounded-md overflow-hidden shadow-sm relative">
                        {log.moviePoster ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${log.moviePoster}`}
                            alt={log.movieTitle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-secondary">
                            <Film className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base leading-none truncate pr-2">
                              {log.movieTitle || "Unknown Title"}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Watched on {formatDate(log.watchedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                            <Star
                              className={cn(
                                "h-3.5 w-3.5 fill-current",
                                getRatingColor(log.rating ?? 0),
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm font-bold tabular-nums",
                                getRatingColor(log.rating ?? 0),
                              )}
                            >
                              {log.rating ? log.rating.toFixed(1) : "--"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
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
                        </div>

                        {log.reviewText && (
                          <p className="text-sm text-foreground/80 line-clamp-2 mt-2 italic border-l-2 border-primary/20 pl-2">
                            "{log.reviewText}"
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isDesktop ? (
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="sm:max-w-md" onCloseClick={() => setSelectedLog(null)}>
            <DialogHeader>
              <DialogTitle>Watch log details</DialogTitle>
              <DialogDescription>
                {selectedLog ? `Logged on ${formatDate(selectedLog.watchedAt)}` : ""}
              </DialogDescription>
            </DialogHeader>
            {selectedLog && <WatchLogDetailView log={selectedLog} />}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <SheetContent side="bottom" className="px-6 pb-8 max-h-[90vh] overflow-y-auto">
            <SheetHeader className="pb-4">
              <SheetTitle>Watch log details</SheetTitle>
              <SheetDescription>
                {selectedLog ? `Logged on ${formatDate(selectedLog.watchedAt)}` : ""}
              </SheetDescription>
            </SheetHeader>
            {selectedLog && <WatchLogDetailView log={selectedLog} />}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
