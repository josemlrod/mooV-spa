import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
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
  SheetTitle,
  SheetHeader,
  SheetDescription,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, useMediaQuery } from "@/lib/utils";
import {
  Star,
  ChevronDown,
  RefreshCw,
  Eye,
  Users,
  Lock,
  Clapperboard,
} from "lucide-react";

type TheaterFormat =
  | "standard"
  | "imax"
  | "dolby"
  | "3d"
  | "70mm"
  | "35mm"
  | null;
type Visibility = "public" | "friends" | "private";

interface WatchLogFormData {
  rating: number;
  reviewText: string;
  watchedAt: string;
  isRewatch: boolean;
  watchedInTheater: boolean;
  theaterName: string;
  theaterCity: string;
  theaterFormat: TheaterFormat;
  visibility: Visibility;
}

function getRatingColor(rating: number): string {
  if (rating === 0) return "text-muted-foreground";
  if (rating <= 3) return "text-red-500";
  if (rating <= 5) return "text-orange-500";
  if (rating <= 7) return "text-yellow-500";
  return "text-green-500";
}

function getRatingLabel(rating: number): string {
  if (rating === 0) return "Select a rating";
  if (rating <= 2) return "Terrible";
  if (rating <= 4) return "Poor";
  if (rating <= 5) return "Mediocre";
  if (rating <= 6) return "Decent";
  if (rating <= 7) return "Good";
  if (rating <= 8) return "Great";
  if (rating <= 9) return "Excellent";
  return "Masterpiece";
}

function RatingSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3">
        <Star
          className={cn(
            "h-8 w-8 transition-all duration-200",
            value > 0
              ? "fill-amber-400 text-amber-400 scale-110"
              : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "text-5xl font-bold tabular-nums transition-all duration-200",
            getRatingColor(value),
            value > 0 && "animate-in zoom-in-95 duration-200"
          )}
        >
          {value === 0 ? "—" : value >= 10 ? value : value.toFixed(1)}
        </span>
        <span className="text-2xl text-muted-foreground font-medium">/ 10</span>
      </div>

      <p
        className={cn(
          "text-center text-sm font-medium transition-all duration-200",
          getRatingColor(value)
        )}
      >
        {getRatingLabel(value)}
      </p>

      <div className="px-2">
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary transition-all duration-150 hover:accent-primary/90"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  pressed,
  onPressedChange,
  children,
  className,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all duration-200",
        pressed
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

function CollapsibleSection({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

const visibilityOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: "public", label: "Public", icon: <Eye className="size-3.5" /> },
  { value: "friends", label: "Friends", icon: <Users className="size-3.5" /> },
  { value: "private", label: "Private", icon: <Lock className="size-3.5" /> },
];

const formatOptions: { value: NonNullable<TheaterFormat>; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "imax", label: "IMAX" },
  { value: "dolby", label: "Dolby Cinema" },
  { value: "3d", label: "3D" },
  { value: "70mm", label: "70mm" },
  { value: "35mm", label: "35mm" },
];

function ReviewForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: WatchLogFormData) => void;
  onCancel: () => void;
}) {
  const reviewId = useId();
  const dateId = useId();
  const theaterNameId = useId();
  const theaterCityId = useId();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [watchedAt, setWatchedAt] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [isRewatch, setIsRewatch] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [watchedInTheater, setWatchedInTheater] = useState(false);
  const [theaterName, setTheaterName] = useState("");
  const [theaterCity, setTheaterCity] = useState("");
  const [theaterFormat, setTheaterFormat] = useState<TheaterFormat>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const canSubmit = rating > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      rating,
      reviewText,
      watchedAt,
      isRewatch,
      visibility,
      watchedInTheater,
      theaterName: watchedInTheater ? theaterName : "",
      theaterCity: watchedInTheater ? theaterCity : "",
      theaterFormat: watchedInTheater ? theaterFormat : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <RatingSlider value={rating} onChange={setRating} />
      </div>

      <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
        <Label htmlFor={reviewId} className="text-sm font-medium">
          Review{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id={reviewId}
          placeholder="Share your thoughts about the movie..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="h-28 resize-none overflow-y-auto"
        />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
        <button
          type="button"
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              showMoreOptions && "rotate-180"
            )}
          />
          <span>More options</span>
        </button>
      </div>

      <CollapsibleSection open={showMoreOptions}>
        <div className="flex flex-col gap-4 pt-1 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Label htmlFor={dateId} className="text-sm font-medium">
                Watch date
              </Label>
              <Input
                id={dateId}
                type="date"
                value={watchedAt}
                onChange={(e) => setWatchedAt(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <ToggleButton pressed={isRewatch} onPressedChange={setIsRewatch}>
                <RefreshCw className="size-3.5" />
                <span>Rewatch</span>
              </ToggleButton>

              <ToggleButton
                pressed={watchedInTheater}
                onPressedChange={setWatchedInTheater}
              >
                <Clapperboard className="size-3.5" />
                <span>Theater</span>
              </ToggleButton>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium shrink-0">Visibility</Label>
            <div className="flex gap-1">
              {visibilityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVisibility(option.value)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-all duration-200",
                    visibility === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <CollapsibleSection open={watchedInTheater}>
            <div className="flex flex-col gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Theater Details
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={theaterNameId} className="text-sm">
                    Theater name
                  </Label>
                  <Input
                    id={theaterNameId}
                    type="text"
                    placeholder="AMC, Regal..."
                    value={theaterName}
                    onChange={(e) => setTheaterName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={theaterCityId} className="text-sm">
                    City
                  </Label>
                  <Input
                    id={theaterCityId}
                    type="text"
                    placeholder="Los Angeles, CA"
                    value={theaterCity}
                    onChange={(e) => setTheaterCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm">Format</Label>
                <Select
                  value={theaterFormat ?? undefined}
                  onValueChange={(val) =>
                    setTheaterFormat(val as NonNullable<TheaterFormat>)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </CollapsibleSection>

      <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="transition-all duration-200"
        >
          Log Watch
        </Button>
      </div>
    </form>
  );
}

export function NewReview({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleSubmit = (data: WatchLogFormData) => {
    console.log("Watch log submitted:", data);
    onOpenChange();
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" onCloseClick={onOpenChange}>
          <DialogHeader>
            <DialogTitle>Log your watch</DialogTitle>
            <DialogDescription>
              Rate and log this movie to your watch history.
            </DialogDescription>
          </DialogHeader>
          <ReviewForm onSubmit={handleSubmit} onCancel={onOpenChange} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-6 pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>Log your watch</SheetTitle>
          <SheetDescription>
            Rate and log this movie to your watch history.
          </SheetDescription>
        </SheetHeader>
        <ReviewForm onSubmit={handleSubmit} onCancel={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
