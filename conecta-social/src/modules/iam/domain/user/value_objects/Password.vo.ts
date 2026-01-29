export class Password {
  private constructor(public readonly value: string) {}

  public static create(password: string): Password {
    if (!password) {
      throw new Error("Password cannot be empty.");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    if (password.length > 100) {
      throw new Error("Password is too long.");
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    // Regex para caracteres especiais comuns
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) {
      throw new Error("Password must contain at least one uppercase letter.");
    }

    if (!hasLowercase) {
      throw new Error("Password must contain at least one lowercase letter.");
    }

    if (!hasSpecialChar) {
      throw new Error("Password must contain at least one special character.");
    }

    return new Password(password);
  }

  public getValue(): string {
    return this.value;
  }
}