export class RoleName {
  private constructor(public readonly value: string) {}

  public static create(name: string): RoleName {
    if (!name || name.trim().length < 3) {
      throw new Error("Role name must be at least 3 characters long.");
    }
    if (name.length > 50) {
      throw new Error("Role name must not exceed 50 characters.");
    }
    
    // Normalização básica: trim
    return new RoleName(name.trim());
  }

  public toString(): string {
    return this.value;
  }
  
  public equals(other: RoleName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
