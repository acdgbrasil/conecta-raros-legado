import { ZodSchema } from "zod";
import { ValidationError } from "./errors";

export class Context {
  public url: URL;
  public user?: any; // Quick access for Auth
  public locals = new Map<string, any>(); // Generic storage

  constructor(
    public req: Request,
    public params: Record<string, string> = {}
  ) {
    this.url = new URL(req.url);
  }

  /**
   * Access query parameters as a plain object.
   * Note: This is a getter, so it parses on every access. Cache it if needed.
   */
  get query(): Record<string, string> {
    return Object.fromEntries(this.url.searchParams);
  }

  /**
   * Parse and validate the JSON body using Zod.
   * Throws ValidationError (400) if parsing or validation fails.
   */
  async parseBody<T>(schema: ZodSchema<T>): Promise<T> {
    let json: unknown;
    try {
      json = await this.req.json();
    } catch (err) {
      // Body is empty or invalid JSON
      json = {}; 
    }

    const result = schema.safeParse(json);

    if (!result.success) {
      throw new ValidationError(result.error.flatten());
    }

    return result.data;
  }

  /**
   * Helper to set status and return JSON
   */
  json(data: unknown, status = 200): Response {
    return Response.json(data, { status });
  }

  /**
   * Helper for standard text responses
   */
  text(data: string, status = 200): Response {
    return new Response(data, { status });
  }
}
