import { z } from "zod";

// Yardımcı fonksiyonlar (Bağımsız olması için buraya aldım)
const isValidISODate = (s) => {
  if (!s) return false;
  const d = new Date(s + "T00:00:00");
  return !Number.isNaN(d.getTime());
};

const toDate = (s) => (s ? new Date(s + "T00:00:00") : null);

export const createEducationSchema = (t) => {
  return z
    .object({
      seviye: z.string().min(1, t("education.validations.levelRequired")),
      okul: z
        .string()
        .trim()
        .regex(
          /^[a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s]+$/u,
          t("education.validations.schoolFormat")
        )
        .min(5, t("education.validations.schoolRequired"))
        .max(100, t("education.validations.schoolMax")),
      bolum: z
        .string()
        .trim()
        .regex(
          /^[a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s]+$/u,
          t("education.validations.deptFormat")
        )
        .min(5, t("education.validations.deptRequired"))
        .max(100, t("education.validations.deptMax")),
      notSistemi: z.enum(["4", "100"], {
        errorMap: () => ({ message: t("education.validations.gradeSystem") }),
      }),
      gano: z
        .string()
        .optional()
        .refine((v) => v === "" || (!isNaN(v) && Number(v) >= 0), {
          message: t("education.validations.gpaNumber"),
        }),
      baslangic: z.string().min(1, t("education.validations.startRequired")),
      bitis: z.string().optional().default(""),
      diplomaDurum: z
        .string()
        .min(1, t("education.validations.diplomaRequired"))
        .refine(
          (v) => ["Mezun", "Devam", "Ara Verdi", "Terk"].includes(v),
          t("education.validations.diplomaValid")
        ),
    })
    .superRefine((data, ctx) => {
      // 1. Başlangıç Tarihi Kontrolü
      if (!isValidISODate(data.baslangic)) {
        ctx.addIssue({
          path: ["baslangic"],
          code: z.ZodIssueCode.custom,
          message: t("education.validations.startInvalid"),
        });
        return; // Tarih bozuksa diğer kontrollere geçme
      }
      const start = toDate(data.baslangic);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start > today) {
        ctx.addIssue({
          path: ["baslangic"],
          code: z.ZodIssueCode.custom,
          message: t("education.validations.startFuture"),
        });
      }

      // 2. Bitiş Tarihi Kontrolü
      const requiresEnd = ["Mezun", "Ara Verdi"].includes(data.diplomaDurum);

      if (requiresEnd) {
        if (!data.bitis || data.bitis.trim() === "") {
          ctx.addIssue({
            path: ["bitis"],
            code: z.ZodIssueCode.custom,
            message: t("education.validations.endRequired"),
          });
          return;
        }
        if (!isValidISODate(data.bitis)) {
          ctx.addIssue({
            path: ["bitis"],
            code: z.ZodIssueCode.custom,
            message: t("education.validations.endInvalid"),
          });
          return;
        }
        const end = toDate(data.bitis);

        if (end > today) {
          ctx.addIssue({
            path: ["bitis"],
            code: z.ZodIssueCode.custom,
            message: t("education.validations.endFuture"),
          });
        }
        if (start && end) {
          // Aynı yıl/ay/gün mü?
          if (
            start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth() &&
            start.getDate() === end.getDate()
          ) {
            ctx.addIssue({
              path: ["bitis"],
              code: z.ZodIssueCode.custom,
              message: t("education.validations.sameDay"),
            });
          }
          // Bitiş, başlangıçtan önce mi?
          if (end.getTime() < start.getTime()) {
            ctx.addIssue({
              path: ["bitis"],
              code: z.ZodIssueCode.custom,
              message: t("education.validations.endBeforeStart"),
            });
          }
        }
      }

      // 3. GANO Kontrolü
      if (data.gano && data.gano !== "") {
        const n = Number(data.gano);
        const max = data.notSistemi === "100" ? 100 : 4;
        if (n > max) {
          ctx.addIssue({
            path: ["gano"],
            code: z.ZodIssueCode.custom,
            message: t("education.validations.gpaRange", { max }),
          });
        }
        // 4'lük sistem ondalık kontrolü
        if (data.notSistemi === "4" && String(n).includes(".")) {
          const decimals = String(n).split(".")[1];
          if (decimals && decimals.length > 2) {
            ctx.addIssue({
              path: ["gano"],
              code: z.ZodIssueCode.custom,
              message: t("education.validations.gpaDecimals"),
            });
          }
        }
      }
    });
};