import z from "zod";
import "hono-zod-openapi";

export const PasswordStrongSchema = z
  .string()
  .min(8, { error: "Senha deve ter no mínimo 8 caracteres" })
  .check(
    z.refine((val) => /[A-Z]/.test(val), {
      error: "Senha deve conter pelo menos 1 letra maiúscula",
      abort: true,
    }),
    z.refine((val) => /[a-z]/.test(val), {
      error: "Senha deve conter pelo menos 1 letra minúscula",
      abort: true,
    }),
    z.refine((val) => /[0-9]/.test(val), {
      error: "Senha deve conter pelo menos 1 número",
      abort: true,
    }),
    z.refine((val) => /[^A-Za-z0-9]/.test(val), {
      error: "Senha deve conter pelo menos 1 caractere especial (!@#$)",
      abort: true,
    })
  )
  .meta({
    description: "Senha forte: min 8 chars, 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial.",
    example: "StrongP@ssw0rd!"
  });