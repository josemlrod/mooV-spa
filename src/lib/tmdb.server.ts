import { tryCatch } from "./utils";
import type { TrendingResponse, PosterSize, BackdropSize, MovieDetail, MovieCredits } from "./tmdb.types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export function getPosterUrl(path: string | null, size: PosterSize = "w342"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: BackdropSize = "w1280"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const apiKey = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY environment variable is not set");
  }

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getTrendingMovies(
  timeWindow: "day" | "week" = "week",
  page: number = 1
) {
  const [data, error] = await tryCatch(
    tmdbFetch<TrendingResponse>(`/trending/movie/${timeWindow}?language=en-US&page=${page}`)
  );

  if (error) {
    console.error("Failed to fetch trending movies:", error);
    return { movies: [], totalPages: 0, totalResults: 0, page: 1 };
  }

  return {
    movies: data.results,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    page: data.page,
  };
}

export async function getEntity(
  id: string
): Promise<MovieDetail & { cast: MovieCredits['cast'] | null } | null> {
  const [entity, error] = await tryCatch(
    tmdbFetch<MovieDetail>(`/movie/${id}?language=en-US`),
  );
  const [credits, _] = await tryCatch(
    tmdbFetch<MovieCredits>(`/movie/${id}/credits?language=en-US`),
  );

  if (error) {
    console.error("Failed to fetch movie:", error);
    return null;
  }

  return {
    ...entity,
    cast: credits ? credits.cast : null,
  };
}

export async function searchMovie(
  query: string
) {
  const [results, error] = await tryCatch(
    tmdbFetch<MovieDetail>(`/search/movie?query=${query}&language=en-US`),
  );

  if (error) {
    console.error("Failed to search:", error);
    return null;
  }

  return results;
}
