import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";

import type { LoaderFunctionArgs } from "react-router";
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

export default function Entity() {
  const loaderData = useLoaderData();
  const { entity } = loaderData;
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

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
              <Button variant="outline" size="lg" className="gap-2">
                <Heart className="h-5 w-5" />
                Favorite
              </Button>
              <Button
                variant="default"
                size="lg"
                className="gap-2"
                onClick={() => {
                  setOpen(true);
                }}
              >
                <MessageCircle className="h-5 w-5" />
                Review
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

      <NewReview open={open} onOpenChange={() => setOpen(false)} />
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
