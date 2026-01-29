import type { Context } from "./context";

export type Handler = (ctx: Context) => Response | Promise<Response>;

export type Middleware = (next: Handler) => Handler;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
