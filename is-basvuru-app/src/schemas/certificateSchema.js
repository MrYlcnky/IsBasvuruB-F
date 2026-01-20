import { z } from "zod";
import { toISODate } from "../components/Users/modalHooks/dateUtils"; 

const ALNUM_TR = /^[a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s]+$/u;

export const createCertificateSchema = (t) => {
  return z
    .object({
      ad: z
        .string()
        .trim()
        .min(1, t("certificates.validations.name.required"))
        .max(100, t("certificates.validations.name.max"))
        .regex(ALNUM_TR, t("certificates.validations.alphaNum")),
      kurum: z
        .string()
        .trim()
        .min(1, t("certificates.validations.org.required"))
        .max(100, t("certificates.validations.org.max"))
        .regex(ALNUM_TR, t("certificates.validations.alphaNum")),
      sure: z
        .string()
        .trim()
        .min(1, t("certificates.validations.duration.required"))
        .max(50, t("certificates.validations.duration.max"))
        .regex(ALNUM_TR, t("certificates.validations.alphaNum")),
      // Gelen string değeri Date objesine veya null'a çevir
      verilisTarihi: z.preprocess(
        (v) => (v ? new Date(v) : null),
        z
          .date({
            required_error: t("certificates.validations.issuedAt.required"),
          })
          .nullable()
      ),
      gecerlilikTarihi: z.preprocess(
        (v) => (v ? new Date(v) : null),
        z.date().nullable()
      ),
    })
    .superRefine((data, ctx) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!data.verilisTarihi) {
        ctx.addIssue({
          path: ["verilisTarihi"],
          code: z.ZodIssueCode.custom,
          message: t("certificates.validations.issuedAt.required"),
        });
        return;
      }

      if (data.verilisTarihi > today) {
        ctx.addIssue({
          path: ["verilisTarihi"],
          code: z.ZodIssueCode.custom,
          message: t("certificates.validations.issuedAt.future"),
        });
      }

      if (data.verilisTarihi && data.gecerlilikTarihi) {
        if (data.gecerlilikTarihi < data.verilisTarihi) {
          ctx.addIssue({
            path: ["gecerlilikTarihi"],
            code: z.ZodIssueCode.custom,
            message: t("certificates.validations.validUntil.beforeIssued"),
          });
        }
        // Tarihleri string'e çevirip karşılaştır (gün bazında eşitlik)
        if (toISODate(data.gecerlilikTarihi) === toISODate(data.verilisTarihi)) {
          ctx.addIssue({
            path: ["gecerlilikTarihi"],
            code: z.ZodIssueCode.custom,
            message: t("certificates.validations.validUntil.sameDay"),
          });
        }
      }
    });
};