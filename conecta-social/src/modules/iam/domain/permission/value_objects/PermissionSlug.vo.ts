export class PermissionSlug {
  private constructor(public readonly value: string) {}

  // Padrão esperado: resource:action (ex: users:create)
  private static readonly SLUG_REGEX = /^[a-z0-9_]+:[a-z0-9_]+$/;

  public static create(slug: string): PermissionSlug {
    if (!slug) {
      throw new Error("Permission slug cannot be empty.");
    }

    const normalizedSlug = slug.trim().toLowerCase();

    if (!this.SLUG_REGEX.test(normalizedSlug)) {
      throw new Error(`Invalid permission slug format: '${slug}'. Expected format: resource:action (e.g., users:create).`);
    }

    return new PermissionSlug(normalizedSlug);
  }

  public toString(): string {
    return this.value;
  }
}
