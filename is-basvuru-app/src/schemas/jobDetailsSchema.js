import { z } from "zod";

export const createJobDetailsSchema = (t) => {
  // ✅ DÜZELTME 1: roleOptionSchema içinden 'dept' alanını kaldırdık.
  // Artık sadece value ve label bekliyor, bu sayede "Geçersiz seçim" hatası gidecek.
  const optionSchema = z.object({ value: z.string(), label: z.string() });

  // Array'in boş olmamasını kontrol eden yardımcı fonksiyon
  const arrayNonEmpty = (s, msg) => z.array(s).min(1, msg);

  return z
    .object({
      subeler: arrayNonEmpty(
        optionSchema,
        t("jobDetails.errors.branchRequired"),
      ),
      alanlar: arrayNonEmpty(optionSchema, t("jobDetails.errors.areaRequired")),
      departmanlar: arrayNonEmpty(
        optionSchema,
        t("jobDetails.errors.departmentRequired"),
      ),

      // Programlar opsiyonel (IT seçince program yoksa hata vermesin diye)
      programlar: z.array(optionSchema).optional().default([]),

      // Pozisyonlar opsiyonel (Validasyonu aşağıda duruma göre yapacağız veya UI'a bırakacağız)
      departmanPozisyonlari: z.array(optionSchema).optional().default([]),

      kagitOyunlari: z.array(optionSchema).optional().default([]),

      lojman: z
        .string()
        .refine(
          (v) => ["Evet", "Hayır"].includes(v),
          t("jobDetails.errors.housingRequired"),
        ),

      tercihNedeni: z
        .string()
        .min(1, t("jobDetails.errors.reasonRequired"))
        .regex(
          /^[a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s.,]+$/u,
          t("jobDetails.errors.reasonChars"),
        )
        .max(500, t("jobDetails.errors.reasonMax")),
    })
    .superRefine((data, ctx) => {
      // ✅ DÜZELTME 2: Statik 'departmentRoles' kontrolünü kaldırdık.
      // Artık veriler dinamik (DB'den) geldiği için, hangi departmanın pozisyonu var bilemeyiz.
      // Bu kontrolü UI tarafında (Select disable/enable) yaparak yönetiyoruz.
      // Eğer çok katı validasyon gerekirse backend tarafında yapılmalıdır.

      // Canlı oyun seçildiyse kağıt oyunu zorunlu
      // Not: Departman ID'si veya Adı üzerinden kontrol edilir.
      // Basitlik için label içinde "canlı" veya "live" geçiyorsa kontrol ediyoruz.
      const canliOyun = data.departmanlar.some(
        (d) =>
          d.label &&
          (d.label.toLowerCase().includes("canlı") ||
            d.label.toLowerCase().includes("live")),
      );

      if (
        canliOyun &&
        (!data.kagitOyunlari || data.kagitOyunlari.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["kagitOyunlari"],
          message: t("jobDetails.errors.cardGamesRequired"),
        });
      }
    });
};
