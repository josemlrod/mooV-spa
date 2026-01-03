import { data } from "react-router";
import type { Route } from "./+types/$";

// Loader throws a 404 error for any unmatched route
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  
  // For programmatic/browser requests to special paths, return empty 404
  if (
    url.pathname.startsWith("/.well-known/") ||
    url.pathname === "/robots.txt" ||
    url.pathname === "/favicon.ico"
  ) {
    throw data(null, { status: 404 });
  }
  
  // For all other paths, throw 404 to trigger ErrorBoundary
  throw data("Not Found", { 
    status: 404,
    statusText: "The requested page could not be found."
  });
}
