import { z } from "zod";

export const createJobDetailsSchema = (t, departmentRoles) => {
  // Seçenek nesneleri için alt şemalar
  const optionSchema = z.object({ value: z.string(), label: z.string() });
  const roleOptionSchema = z.object({ value: z.string(), label: z.string(), dept: z.string() });
  const arrayNonEmpty = (s, msg) => z.array(s).min(1, msg);

  return z
    .object({
      subeler: arrayNonEmpty(optionSchema, t("jobDetails.errors.branchRequired")),
      alanlar: arrayNonEmpty(optionSchema, t("jobDetails.errors.areaRequired")),
      departmanlar: arrayNonEmpty(optionSchema, t("jobDetails.errors.departmentRequired")),
      programlar: arrayNonEmpty(optionSchema, t("jobDetails.errors.programRequired")),
      departmanPozisyonlari: z.array(roleOptionSchema).optional().default([]),
      kagitOyunlari: z.array(optionSchema).optional().default([]),
      lojman: z
        .string()
        .refine((v) => ["Evet", "Hayır"].includes(v), t("jobDetails.errors.housingRequired")),
      tercihNedeni: z
        .string()
        .min(1, t("jobDetails.errors.reasonRequired"))
        .regex(
          /^[a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s.,]+$/u,
          t("jobDetails.errors.reasonChars")
        )
        .max(500, t("jobDetails.errors.reasonMax")),
    })
    .superRefine((data, ctx) => {
      // Departmanın pozisyon gerektirip gerektirmediğini kontrol et
      const anyDeptHasRoles = data.departmanlar.some(
        (d) => (departmentRoles[d.value] || []).length > 0
      );

      if (
        anyDeptHasRoles &&
        (!data.departmanPozisyonlari || data.departmanPozisyonlari.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["departmanPozisyonlari"],
          message: t("jobDetails.errors.rolesRequired"),
        });
      }

      // Canlı oyun seçildiyse kağıt oyunu zorunlu
      const canliOyun = data.departmanlar.some((d) => d.value === "Casino Canlı Oyun");
      if (canliOyun && (!data.kagitOyunlari || data.kagitOyunlari.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["kagitOyunlari"],
          message: t("jobDetails.errors.cardGamesRequired"),
        });
      }
    });
};