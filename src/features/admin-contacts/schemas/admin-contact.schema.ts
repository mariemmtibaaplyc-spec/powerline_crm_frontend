import { z } from "zod";

export const updateAdminContactSchema = z.object({
  firstName: z.string().trim().min(2, "Le prenom est requis"),
  lastName: z.string().trim().min(2, "Le nom est requis"),
  phone: z.string().trim().min(8, "Le telephone principal est requis"),
  phone2: z.string().trim().optional(),
  email: z.union([z.literal(""), z.string().trim().email("Email invalide")]).optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().min(2, "La ville est requise"),
  postalCode: z.string().trim().optional(),
  campaign: z.string().trim().min(2, "La campagne est requise"),
  listName: z.string().trim().min(2, "La liste est requise"),
  sourceImport: z.string().trim().min(2, "La source import est requise"),
  status: z.enum([
    "new",
    "in_progress",
    "callback",
    "appointment",
    "qualified",
    "blacklisted",
    "unreachable",
  ]),
  lastAction: z.string().trim().min(3, "La derniere action est requise"),
  lastQualification: z.string().trim().min(3, "La derniere qualification est requise"),
  note: z.string().trim().min(3, "La note est requise"),
});

export type UpdateAdminContactSchemaInput = z.infer<typeof updateAdminContactSchema>;
