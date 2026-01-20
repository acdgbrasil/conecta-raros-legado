import z from "zod";
import { PasswordStrongSchema } from "../../../shared/types/zod/password.zod";

const LoginInputSchema = z.object({
  email: z.email({ error: "Formato de e-mail inválido" }),
  password: PasswordStrongSchema,
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

function parseUserInput(input: any): LoginInput {
  return LoginInputSchema.parse(input);
}

export const AuthInputSchema = {
  login: LoginInputSchema,
  parser: parseUserInput,
};

