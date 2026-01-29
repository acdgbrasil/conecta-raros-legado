export class HttpError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class ValidationError extends HttpError {
  constructor(details: unknown) {
    super(400, "Validation Error", details);
    this.name = "ValidationError";
  }
}
