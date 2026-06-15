import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().trim().min(3, "Le nom de campagne est requis"),
  description: z.string().trim().max(2000, "Description trop longue"),
  type: z.enum(["outbound", "inbound"]),
  status: z.enum(["active", "paused", "closed", "inactive"]),
  startDate: z.string().trim(),
  endDate: z.string().trim(),
}).superRefine((values, ctx) => {
  if (values.startDate && Number.isNaN(Date.parse(values.startDate))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["startDate"],
      message: "Date de debut invalide",
    });
  }

  if (values.endDate && Number.isNaN(Date.parse(values.endDate))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "Date de fin invalide",
    });
  }

  if (values.startDate && values.endDate) {
    const start = new Date(values.startDate);
    const end = new Date(values.endDate);

    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "La date de fin doit etre posterieure a la date de debut",
      });
    }
  }
});

export type CampaignSchemaInput = z.infer<typeof campaignSchema>;
