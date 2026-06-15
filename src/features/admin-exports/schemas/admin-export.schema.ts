import { z } from "zod";

export const exportSchema = z.object({
  name: z.string().trim().min(3, "Le nom de l export est requis"),
  sourceType: z.enum(["campaign", "list", "directory"]),
  sourceName: z.string().trim().min(2, "La source est requise"),
  modelName: z.string().trim().min(2, "Le modele d export est requis"),
  format: z.enum(["csv", "excel"]),
  volume: z.string().trim().min(1, "Le volume estime est requis"),
});

export type ExportSchemaInput = z.infer<typeof exportSchema>;
