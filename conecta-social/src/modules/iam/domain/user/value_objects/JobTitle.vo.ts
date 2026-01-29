export class JobTitle {
  private constructor(public readonly value: string) {}

  public static create(title: string): JobTitle {
    // Permite string vazia? Geralmente não para um VO instanciado.
    // Se for opcional na entidade, o campo será undefined, não um VO vazio.
    if (!title || title.trim().length === 0) {
      throw new Error("Job title cannot be empty.");
    }

    if (title.length > 100) {
      throw new Error("Job title must not exceed 100 characters.");
    }

    return new JobTitle(title.trim());
  }

  public toString(): string {
    return this.value;
  }
}
