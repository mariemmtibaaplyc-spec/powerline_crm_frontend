import { z } from "zod";

export const listSchema = z.object({
  name: z.string().trim().min(3, "Le nom de liste est requis"),
  type: z.enum(["prospects", "callback", "qualification", "cleanup", "blacklist"]),
  source: z.string().trim().min(2, "La source est requise"),
  status: z.enum(["ready", "importing", "review", "attached", "archived"]),
  campaign: z.string().trim().min(2, "La campagne associee est requise"),
  contactsCount: z.string().trim().min(1, "Le volume est requis"),
  description: z.string().trim().min(6, "La description est requise"),
});

export type ListSchemaInput = z.infer<typeof listSchema>;
