import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { ArrowLeft, Calendar, Clock, History, MessageCircle, Star } from "lucide-react";

import { getEntity, getPosterUrl } from "@/lib/tmdb.server";
import type { CastMember } from "@/lib/tmdb.types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { NewReview } from "@/components/new-review";
import { WatchLogsSheet } from "@/components/watch-logs-sheet";

interface EntityData {
  id: number;
  title: string;
  tagline?: string;
  release_date: string;
  runtime: number;
  overview: string;
  posterUrl: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  cast?: CastMember[];
}

export default function Entity() {
  const loaderData = useLoaderData() as { entity: EntityData };
  const { entity } = loaderData;
  const navigate = useNavigate();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 roundex-xl">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-lg">
            {entity.posterUrl ? (
              <img
                src={entity.posterUrl}
                alt={entity.title}
                className="h-full w-full object-cover"
                style={{
                  viewTransitionName: `movie-poster-${entity.id}`,
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                <span>No Poster</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {entity.title}
              </h1>
              {entity.tagline && (
                <p className="text-lg text-muted-foreground italic">
                  "{entity.tagline}"
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex w-full gap-4">
                <div className="flex gap-1 items-center text-muted-foreground text-base">
                  <Calendar className="w-4 h-4" /> {entity.release_date}
                </div>
                <div className="flex gap-1 items-center text-muted-foreground text-base">
                  <Clock className="w-4 h-4" /> {entity.runtime} min
                </div>
              </div>

              <div className="flex w-full gap-2">
                {entity.genres.map((genre: { id: number; name: string }) => {
                  return (
                    <Badge variant="secondary" key={genre.id}>
                      {genre.name}
                    </Badge>
                  );
                })}
              </div>

              <div className="flex w-full gap-4">
                <div className="flex gap-2">
                  <Star className="fill-amber-300 text-amber-300" />
                  <p>
                    <span className="font-semibold">
                      {entity.vote_average.toFixed(1)}
                    </span>{" "}
                    / 10
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="default"
                size="lg"
                className="gap-2"
                onClick={() => setReviewOpen(true)}
              >
                <MessageCircle className="h-5 w-5" />
                Log watch
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => setLogsOpen(true)}
              >
                <History className="h-5 w-5" />
                See watch logs
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2 flex-col">
            <h3 className="text-xl font-semibold">Overview</h3>
            <p className="text-base text-foreground/90 leading-relaxed">
              {entity.overview}
            </p>
          </div>

          {entity.cast ? (
            <>
              <Separator />

              <div className="flex gap-2 flex-col">
                <h3 className="text-xl font-semibold">Cast</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {entity.cast.slice(0, 6).map((c: CastMember) => {
                    return (
                      <Card key={c.id}>
                        <CardHeader>
                          <CardTitle>{c.character}</CardTitle>
                          <CardDescription>{c.name}</CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <NewReview
        open={reviewOpen}
        onOpenChange={() => setReviewOpen(false)}
        entity={entity}
      />

      <WatchLogsSheet
        open={logsOpen}
        onOpenChange={() => setLogsOpen(false)}
        entity={entity}
      />
    </div>
  );
}

Entity.loader = async function (args: LoaderFunctionArgs) {
  const {
    params: { id },
  } = args;

  if (!id) {
    throw new Response("Movie ID is required", { status: 400 });
  }

  const entity = await getEntity(id);

  if (!entity) {
    throw new Response("Movie not found", { status: 404 });
  }

  return {
    entity: {
      ...entity,
      posterUrl: getPosterUrl(entity.poster_path, "w500"),
    },
  };
};

Entity.action = async function ({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rating = formData.get("rating");
  const reviewText = formData.get("reviewText");
  const watchedAt = formData.get("watchedAt");
  const isRewatch = formData.get("isRewatch") === "true";
  const watchedInTheater = formData.get("watchedInTheater") === "true";
  const theaterName = formData.get("theaterName");
  const theaterCity = formData.get("theaterCity");
  const theaterFormat = formData.get("theaterFormat");
  const visibility = formData.get("visibility");
  const tmdbId = formData.get("tmdbId");
  const movieTitle = formData.get("movieTitle");
  const releaseDate = formData.get("releaseDate");
  const runtime = formData.get("runtime");
  const overview = formData.get("overview");
  const posterPath = formData.get("posterPath");
  const backdropPath = formData.get("backdropPath");
  const voteAverage = formData.get("voteAverage");
  const genres = formData.get("genres");
  const cast = formData.get("cast");

  if (!rating || Number(rating) <= 0) {
    return { success: false, error: "Rating is required" };
  }

  if (!tmdbId) {
    return { success: false, error: "Movie ID is required" };
  }

  return {
    success: true,
    data: {
      rating: Number(rating),
      reviewText: reviewText ? String(reviewText) : null,
      watchedAt: String(watchedAt),
      isRewatch,
      watchedInTheater,
      theaterName: theaterName ? String(theaterName) : null,
      theaterCity: theaterCity ? String(theaterCity) : null,
      theaterFormat: theaterFormat ? String(theaterFormat) : null,
      visibility: String(visibility) as "public" | "friends" | "private",
      movie: {
        tmdbId: Number(tmdbId),
        title: String(movieTitle),
        releaseDate: releaseDate ? String(releaseDate) : null,
        runtime: runtime ? Number(runtime) : null,
        overview: overview ? String(overview) : null,
        posterPath: posterPath ? String(posterPath) : null,
        backdropPath: backdropPath ? String(backdropPath) : null,
        voteAverage: voteAverage ? Number(voteAverage) : null,
        genres: genres ? JSON.parse(String(genres)) : null,
        cast: cast ? JSON.parse(String(cast)) : null,
      },
    },
  };
};
