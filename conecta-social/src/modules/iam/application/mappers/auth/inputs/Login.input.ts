import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email()
    .meta({ 
      id: "auth_email",
      description: "E-mail de acesso à plataforma",
      example: "admin@conecta.com" 
    }),
  password: z.string().min(8)
    .meta({ 
      id: "auth_password",
      description: "Senha secreta",
      example: "Minh@Senha123" 
    })
}).meta({ title: "Login Request" });

export type LoginDTO = z.input<typeof LoginSchema>;
