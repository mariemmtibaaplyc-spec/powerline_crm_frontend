import { z } from "zod";

export const exportTemplateSchema = z.object({
  name: z.string().trim().min(3, "Le nom du modele est requis"),
  source: z.enum(["contacts", "lists", "campaigns"]),
  format: z.enum(["csv", "excel"]),
  fields: z.string().trim().min(3, "Les champs inclus sont requis"),
  status: z.enum(["active", "inactive"]),
});

export type ExportTemplateSchemaInput = z.infer<typeof exportTemplateSchema>;
