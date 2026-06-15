import { z } from "zod";

const baseSchema = z.object({
  firstName: z.string().trim().min(2, "Le prenom est requis"),
  lastName: z.string().trim().min(2, "Le nom est requis"),
  email: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || z.email().safeParse(value).success, {
      message: "Email invalide",
    }),
  username: z.string().trim().min(3, "Identifiant trop court"),
  role: z.string().trim().min(1, "Role requis"),
  team: z.string().trim().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
});

export const createUserSchema = baseSchema.extend({
  password: z.string().trim().min(6, "Mot de passe mocke trop court"),
});

export const updateUserSchema = baseSchema.extend({
  password: z.string().trim().optional(),
});

export type CreateUserSchemaInput = z.infer<typeof createUserSchema>;
export type UpdateUserSchemaInput = z.infer<typeof updateUserSchema>;
