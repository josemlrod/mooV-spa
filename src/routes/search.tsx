import { useRef } from "react";
import {
  useFetcher,
  Link,
  useViewTransitionState,
  type LoaderFunctionArgs,
  useLoaderData,
} from "react-router";
import { useSearchParams, type ActionFunctionArgs } from "react-router";
import { ChevronDownIcon, Search as SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { searchMovie, getPosterUrl, searchTvShow } from "@/lib/tmdb.server";
import type { Movie, TrendingResponse } from "@/lib/tmdb.types";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export const SearchType = {
  MOVIE: "movie",
  TV_SHOW: "tv",
} as const;
const searchTypeLabel = {
  movie: "Movie",
  tv: "Tv Show",
} as const;

type SearchTypeKeys = keyof typeof SearchType;
export type SearchTypeValues = (typeof SearchType)[SearchTypeKeys];

interface SearchResult {
  id: number;
  title: string;
  name?: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string;
}

interface ActionData {
  results: SearchResult[];
  query: string;
}

function SearchResultItem({
  entity,
  type,
}: {
  entity: SearchResult;
  type: SearchTypeValues;
}) {
  const href = `/entity/${entity.id}/${type}`;
  const isTransitioning = useViewTransitionState(href);

  return (
    <Link
      to={href}
      className="flex gap-4 p-3 rounded-xl bg-card hover:bg-accent transition-colors"
      viewTransition
    >
      <div className="w-20 h-30 flex-shrink-0">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted">
          {entity.posterUrl ? (
            <img
              src={entity.posterUrl}
              alt={entity.title}
              className="h-full w-full object-cover"
              style={{
                viewTransitionName: isTransitioning
                  ? `movie-poster-${entity.id}`
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
          {entity.title || entity.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {entity.overview || "No description available."}
        </p>
        {entity.releaseDate && (
          <div className="mt-auto pt-2">
            <Badge variant="secondary">
              {new Date(entity.releaseDate).getFullYear()}
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

  const searchType =
    searchParams.get("type") ?? (SearchType.MOVIE as SearchTypeValues);
  const label = searchTypeLabel[searchType as SearchTypeValues];

  const debouncedSubmit = useRef(
    debounce((form: HTMLFormElement) => {
      fetcher.submit(form);
    }, 750),
  ).current;

  const setSearchType = (event: React.MouseEvent<HTMLDivElement>) => {
    const type = event.currentTarget.dataset.type;

    if (type) {
      searchParams.set("type", type);
      setSearchParams(searchParams);
    }
  };

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
          <InputGroup>
            <InputGroupInput
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
            <InputGroupAddon align="inline-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <InputGroupButton
                      variant="ghost"
                      className="!pr-1.5 text-xs"
                    />
                  }
                >
                  {label} <ChevronDownIcon className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={setSearchType}
                    data-type={SearchType.MOVIE}
                  >
                    {searchTypeLabel.movie}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={setSearchType}
                    data-type={SearchType.TV_SHOW}
                  >
                    {searchTypeLabel.tv}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </InputGroupAddon>
          </InputGroup>
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
              {results.map((entity: SearchResult) => (
                <SearchResultItem
                  key={entity.id}
                  entity={entity}
                  type={searchType}
                />
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
  const type = url.searchParams.get("type");

  let fetchEntity = searchMovie;

  if (type) {
    fetchEntity = type === SearchType.TV_SHOW ? searchTvShow : searchMovie;
  }

  if (query) {
    const data = (await fetchEntity(query)) as TrendingResponse | null;

    if (!data) {
      return { results: [], query };
    }

    const results: SearchResult[] = data.results.map((entity: Movie) => ({
      id: entity.id,
      title: entity.title,
      name: entity?.name,
      overview: entity.overview,
      posterUrl: getPosterUrl(entity.poster_path, "w154"),
      releaseDate: entity.release_date,
    }));

    return { results, query };
  }

  return { results: [], query: "" };
};

Search.action = async function ({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const query = formData.get("query") as string;
  const type = url.searchParams.get("type");

  let fetchEntity = searchMovie;

  if (type) {
    fetchEntity = type === SearchType.TV_SHOW ? searchTvShow : searchMovie;
  }

  if (!query || query.trim() === "") {
    return { results: [], query: "" };
  }

  const data = (await fetchEntity(query)) as TrendingResponse | null;

  if (!data) {
    return { results: [], query };
  }

  const results: SearchResult[] = data.results.map((entity: Movie) => ({
    id: entity.id,
    title: entity.title,
    overview: entity.overview,
    posterUrl: getPosterUrl(entity.poster_path, "w154"),
    releaseDate: entity.release_date,
  }));

  return { results, query };
};
