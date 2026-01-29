export class Name {
  private constructor(public readonly value: string) {}

  public static create(name: string): Name {
    if (!name || name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long.");
    }
    
    if (name.length > 100) {
      throw new Error("Name must not exceed 100 characters.");
    }

    return new Name(name.trim());
  }

  public toString(): string {
    return this.value;
  }
}
