import type { ServeOptions } from "bun";
import { Context } from "./context";
import { HttpError } from "./errors";
import { defaultRouter, Router } from "./router";

export type ServerOptions = Omit<ServeOptions, "fetch"> & {
  router?: Router;
  errorHandler?: (err: Error) => Response | undefined | HttpError;
};

export const createServer = (portOrOptions: number | ServerOptions) => {
  const options = typeof portOrOptions === "number" 
    ? { port: portOrOptions } 
    : portOrOptions;
  
  const router = (options as any).router || defaultRouter;
  const customErrorHandler = (options as any).errorHandler;

  return Bun.serve({
    ...options,
    async fetch(req) {
      const url = new URL(req.url);
      
      // 1. Route Matching
      const match = router.match(req.method, url.pathname);

      if (!match) {
        return new Response("Not Found", { status: 404 });
      }

      const { handler, params } = match;

      // 2. Context Creation (Lightweight & Stateless)
      const ctx = new Context(req, params);

      // 3. Execution & Error Boundary
      try {
        return await handler(ctx);
      } catch (err: any) {
        console.error(`[HttpServer] Error on ${req.method} ${url.pathname}:`, err);

        // Custom Mapper Injection
        if (customErrorHandler) {
          const mapped = customErrorHandler(err);
          if (mapped instanceof Response) return mapped;
          if (mapped instanceof HttpError) err = mapped; // Upgrade error
        }

        if (err instanceof HttpError) {
          return Response.json(
            { error: err.message, details: err.details },
            { status: err.status }
          );
        }

        // Fallback for unhandled errors
        return Response.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
    },
    error(error) {
      return new Response(`<pre>${error}\n${error.stack}</pre>`, {
        headers: { "Content-Type": "text/html" },
        status: 500,
      });
    },
  });
};
