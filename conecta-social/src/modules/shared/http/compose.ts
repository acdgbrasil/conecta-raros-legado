import type { Handler, Middleware } from "./types";

/**
 * Procedural composition of middlewares.
 * Executes in order: middleware[0] -> middleware[1] -> ... -> handler
 * 
 * @param middlewares Array of middlewares to execute before the handler
 * @param handler The final route handler
 */
export function stack(middlewares: Middleware[], handler: Handler): Handler {
  if (middlewares.length === 0) {
    return handler;
  }
  
  // reduceRight allows us to wrap the handler from the inside out:
  // stack([m1, m2], h) => m1(m2(h))
  return middlewares.reduceRight((next, mw) => mw(next), handler);
}
