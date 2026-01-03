import { clsx, type ClassValue } from "clsx"
import { useState, useEffect } from "react"
import { twMerge } from "tailwind-merge"
import { redirect } from "react-router"
import { clerk, clerkLoaded } from "@/lib/clerk"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Hook that tracks whether a media query matches.
 * Returns false during SSR to avoid hydration mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return matches
}

export type Result<T, E = Error> = [data: T, error: null] | [data: null, error: E];

export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as E];
  }
}

export async function loggingMiddleware(
  { request }: { request: Request },
  next: () => Promise<unknown>
) {
  const url = new URL(request.url);
  console.log(`Starting navigation: ${url.pathname}${url.search}`);
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  console.log(`Navigation completed in ${duration}ms`);
}

export async function authMiddleware() {
  await clerkLoaded;

  if (!clerk.user) {
    throw redirect("/auth");
  }
}
