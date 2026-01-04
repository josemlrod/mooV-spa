import { useRef } from "react";
import {
  useFetcher,
  Link,
  useViewTransitionState,
  type LoaderFunctionArgs,
  useLoaderData,
} from "react-router";
import { useSearchParams, type ActionFunctionArgs } from "react-router";
import { Search as SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchMovie, getPosterUrl } from "@/lib/tmdb.server";
import type { Movie, TrendingResponse } from "@/lib/tmdb.types";

function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}

interface SearchResult {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string;
}

interface ActionData {
  results: SearchResult[];
  query: string;
}

function SearchResultItem({ movie }: { movie: SearchResult }) {
  const href = `/entity/${movie.id}`;
  const isTransitioning = useViewTransitionState(href);

  return (
    <Link
      to={href}
      className="flex gap-4 p-3 rounded-xl bg-card hover:bg-accent transition-colors"
      viewTransition
    >
      <div className="w-20 h-30 flex-shrink-0">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover"
              style={{
                viewTransitionName: isTransitioning
                  ? `movie-poster-${movie.id}`
                  : "none",
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <span className="text-xs">No Poster</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="font-semibold text-foreground line-clamp-1">
          {movie.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {movie.overview || "No description available."}
        </p>
        {movie.releaseDate && (
          <div className="mt-auto pt-2">
            <Badge variant="secondary">
              {new Date(movie.releaseDate).getFullYear()}
            </Badge>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Search() {
  const fetcher = useFetcher<ActionData>();
  const loaderData = useLoaderData();

  const [searchParams, setSearchParams] = useSearchParams();

  const debouncedSubmit = useRef(
    debounce((form: HTMLFormElement) => {
      fetcher.submit(form);
    }, 500),
  ).current;

  const results = fetcher.data?.results || loaderData.results || [];
  const query = fetcher.data?.query || loaderData.query || "";
  const isSearching = fetcher.state === "submitting";
  const hasSearched = fetcher.data !== undefined;

  return (
    <div className="container mx-auto px-4 lg:px-8 pb-6 pt-6 lg:pt-0 h-full">
      <div className="flex flex-col gap-6 h-full">
        <fetcher.Form
          method="post"
          onChange={(e) => debouncedSubmit(e.currentTarget)}
        >
          <Input
            autoFocus
            type="text"
            name="query"
            placeholder="Search by name, e.g. Dune..."
            defaultValue={query}
            onChange={(e) => {
              const val = e.currentTarget.value;

              if (val) {
                searchParams.set("q", val);
              } else {
                searchParams.delete("q");
              }

              setSearchParams(searchParams);
            }}
          />
        </fetcher.Form>

        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <SearchIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No results found for "{query}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-2">
              {results.map((movie: SearchResult) => (
                <SearchResultItem key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Search.loader = async function ({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (query) {
    const data = (await searchMovie(query)) as TrendingResponse | null;

    if (!data) {
      return { results: [], query };
    }

    const results: SearchResult[] = data.results.map((movie: Movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterUrl: getPosterUrl(movie.poster_path, "w154"),
      releaseDate: movie.release_date,
    }));

    return { results, query };
  }

  return { results: [], query: "" };
};

Search.action = async function ({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const query = formData.get("query") as string;

  if (!query || query.trim() === "") {
    return { results: [], query: "" };
  }

  const data = (await searchMovie(query)) as TrendingResponse | null;

  if (!data) {
    return { results: [], query };
  }

  const results: SearchResult[] = data.results.map((movie: Movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: getPosterUrl(movie.poster_path, "w154"),
    releaseDate: movie.release_date,
  }));

  return { results, query };
};
