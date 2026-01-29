export class Department {
  private constructor(public readonly value: string) {}

  public static create(department: string): Department {
    if (!department || department.trim().length === 0) {
      throw new Error("Department cannot be empty.");
    }

    if (department.length > 100) {
      throw new Error("Department must not exceed 100 characters.");
    }

    return new Department(department.trim());
  }

  public toString(): string {
    return this.value;
  }
}
