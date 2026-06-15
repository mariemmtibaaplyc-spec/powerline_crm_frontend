import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'identifiant est obligatoire."),
  password: z
    .string()
    .trim()
    .min(1, "Le mot de passe est obligatoire."),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse e-mail est obligatoire.")
    .email("Entrez une adresse e-mail valide."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
