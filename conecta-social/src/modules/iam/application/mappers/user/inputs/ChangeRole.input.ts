import { z } from "zod";

export const ChangeRoleSchema = z.object({
  userId: z.uuidv7().meta({ description: "ID do usuário alvo" }),
  newRoleId: z.uuidv7().meta({ description: "ID do novo cargo a ser atribuído" })
}).meta({ title: "Change Role Input" });

export type ChangeRoleDTO = z.input<typeof ChangeRoleSchema>;
