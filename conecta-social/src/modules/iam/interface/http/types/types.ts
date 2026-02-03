import { type BunRequest } from "bun";


export type RouterHandler<Path extends string = string> = (request: BunRequest<Path>) => Response | Promise<Response>;
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
export type RouteDefinition = | RouterHandler | Partial<Record<HttpMethod, RouterHandler>> | Response;
export type IamRouteMap = Record<string, RouteDefinition>;