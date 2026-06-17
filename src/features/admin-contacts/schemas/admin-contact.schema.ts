import { z } from "zod";

export const updateAdminContactSchema = z.object({
  firstName: z.string().trim().min(2, "Le prenom est requis"),
  lastName: z.string().trim().min(2, "Le nom est requis"),
  phone: z.string().trim().min(8, "Le telephone principal est requis"),
  phone2: z.string().trim().optional(),
  email: z.union([z.literal(""), z.string().trim().email("Email invalide")]).optional(),
  company: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().min(2, "La ville est requise"),
  postalCode: z.string().trim().optional(),
  source: z.string().trim().optional(),
  country: z.string().trim().optional(),
  status: z.enum([
    "new",
    "in_progress",
    "callback",
    "appointment",
    "qualified",
    "blacklisted",
    "unreachable",
  ]),
});

export type UpdateAdminContactSchemaInput = z.infer<typeof updateAdminContactSchema>;
