export class Email {
  private constructor(public readonly value: string) {}

  // Regex simples e robusto para e-mail
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public static create(email: string): Email {
    if (!email) {
      throw new Error("Email cannot be empty.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!this.EMAIL_REGEX.test(normalizedEmail)) {
      throw new Error("Invalid email format.");
    }

    return new Email(normalizedEmail);
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}
