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
import { cn, useMediaQuery } from "@/lib/utils";
import { Star } from "lucide-react";

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
              : "text-muted-foreground",
          )}
        />
        <span
          className={cn(
            "text-5xl font-bold tabular-nums transition-all duration-200",
            getRatingColor(value),
            value > 0 && "animate-in zoom-in-95 duration-200",
          )}
        >
          {value === 0 ? "—" : value >= 10 ? value : value.toFixed(1)}
        </span>
        <span className="text-2xl text-muted-foreground font-medium">/ 10</span>
      </div>

      <p
        className={cn(
          "text-center text-sm font-medium transition-all duration-200",
          getRatingColor(value),
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

function ReviewForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { rating: number; review: string }) => void;
  onCancel: () => void;
}) {
  const reviewId = useId();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const canSubmit = rating > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ rating, review });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="h-40 resize-none overflow-y-auto"
        />
      </div>

      <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="transition-all duration-200"
        >
          Submit Review
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

  const handleSubmit = (data: { rating: number; review: string }) => {
    console.log("Review submitted:", data);
    onOpenChange();
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" onCloseClick={onOpenChange}>
          <DialogHeader>
            <DialogTitle>Rate this movie</DialogTitle>
            <DialogDescription>
              How would you rate your experience? Your rating helps others
              discover great films.
            </DialogDescription>
          </DialogHeader>
          <ReviewForm onSubmit={handleSubmit} onCancel={onOpenChange} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-6 pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle>Rate this movie</SheetTitle>
          <SheetDescription>
            How would you rate your experience? Your rating helps others
            discover great films.
          </SheetDescription>
        </SheetHeader>
        <ReviewForm onSubmit={handleSubmit} onCancel={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
