export class PersonId {
  private constructor(public readonly value: string) {}

  // Regex para UUID v4/v7 (hexadecimal 8-4-4-4-12)
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  public static create(id: string): PersonId {
    if (!id || !this.UUID_REGEX.test(id)) {
      throw new Error("Person ID must be a valid UUID.");
    }

    return new PersonId(id);
  }

  public toString(): string {
    return this.value;
  }
}
