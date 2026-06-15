import { z } from "zod";

export const blacklistSchema = z.object({
  phone: z.string().trim().min(8, "Le numero est requis"),
  reason: z.string().trim().optional(),
  contactId: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d+$/.test(value), "Le contact_id doit etre numerique"),
  status: z.enum(["active", "inactive"]).optional(),
  addedBy: z.string().trim().optional(),
  note: z.string().trim().optional(),
  linkedCampaign: z.string().trim().optional(),
  sourceImport: z.string().trim().optional(),
  linkedContactName: z.string().trim().optional(),
});

export type BlacklistSchemaInput = z.infer<typeof blacklistSchema>;
