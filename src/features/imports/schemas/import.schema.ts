import { z } from "zod";

export const importSetupSchema = z
  .object({
    name: z.string().trim().min(3, "Le nom de l import est requis"),
    sourceFile: z.string().trim().min(1, "Le fichier source est requis"),
    listName: z.string().trim().optional(),
    targetListId: z.string().trim().optional(),
    targetListMode: z.enum(["existing", "new"]),
  })
  .superRefine((value, ctx) => {
    if (value.targetListMode === "existing" && !value.targetListId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetListId"],
        message: "La liste associee est requise",
      });
    }

    if (value.targetListMode === "new" && !value.listName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["listName"],
        message: "La liste associee est requise",
      });
    }
  });

export const importParametersSchema = z.object({
  estimatedRows: z.string().trim().min(1, "Le volume estime est requis"),
  separator: z.string().trim().min(2, "Le separateur est requis"),
  encoding: z.string().trim().min(2, "L encodage est requis"),
  firstRowHeader: z.enum(["yes", "no"]),
});

export const importDeduplicationSchema = z
  .object({
    deduplicationMode: z.enum([
      "all_contacts",
      "campaign_lists",
      "active_lists",
      "specific_list",
      "none",
    ]),
    deduplicationListName: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.deduplicationMode === "specific_list" && !value.deduplicationListName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deduplicationListName"],
        message: "Selectionne une liste cible pour le dedoublonnage specifique",
      });
    }
  });
