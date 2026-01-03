import { MovieCard } from "@/components/movie-card";

import { getTrendingMovies, getPosterUrl } from "@/lib/tmdb.server";
import { useLoaderData } from "react-router";

export interface MovieWithPoster {
  id: number;
  title: string;
  posterUrl: string | null;
  releaseDate: string;
  voteAverage: number;
  overview: string;
}

export default function Home() {
  const loaderData = useLoaderData();
  const { movies } = loaderData;

  return (
    <div className="container mx-auto px-4 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          Trending This Week
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterUrl={movie.posterUrl}
            voteAverage={movie.voteAverage}
            releaseDate={movie.releaseDate}
          />
        ))}
      </div>
    </div>
  );
}

Home.loader = async function () {
  const trending = await getTrendingMovies("week");

  const moviesWithPosters: MovieWithPoster[] = trending.movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    posterUrl: getPosterUrl(movie.poster_path, "w342"),
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    overview: movie.overview,
  }));

  return {
    movies: moviesWithPosters,
  };
};
