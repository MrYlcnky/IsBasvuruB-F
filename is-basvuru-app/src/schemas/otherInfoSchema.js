import { z } from "zod";

export const createOtherInfoSchema = (t) => {
  const reqMsg = (key) => ({
    invalid_type_error: t(`otherInfo.errors.${key}`),
    required_error: t(`otherInfo.errors.${key}`),
  });

  // Yardımcı Fonksiyon: Metin tabanlı sayı validasyonu (Garanti Yöntem)
  const stringToNumberSchema = (requiredMsg, invalidMsg, intMsg, min, minMsg, max, maxMsg) => {
    return z.string()
      .or(z.number()) // Hem string hem sayı gelebilir
      .transform((val) => String(val).trim()) // String'e çevir ve boşlukları temizle
      .refine((val) => val !== "", { message: requiredMsg }) // 1. KONTROL: Boş mu? -> Zorunlu hatası ver
      .transform((val) => Number(val)) // Sayıya çevir
      .refine((val) => !isNaN(val), { message: invalidMsg }) // 2. KONTROL: Sayı mı? -> Sayı olmalı hatası ver
      .refine((val) => Number.isInteger(val), { message: intMsg }) // 3. KONTROL: Tam sayı mı?
      .refine((val) => val >= min, { message: minMsg }) // 4. KONTROL: Minimum
      .refine((val) => val <= max, { message: maxMsg }); // 5. KONTROL: Maksimum
  };

  return z
    .object({
      kktcGecerliBelge: z.string(reqMsg("kktcDoc")).min(1, t("otherInfo.errors.kktcDoc")),
      davaDurumu: z.string(reqMsg("lawsuit")).min(1, t("otherInfo.errors.lawsuit")),
      davaNedeni: z
        .string()
        .trim()
        .max(250, t("otherInfo.errors.lawsuitReason"))
        .optional(),
      sigara: z.string(reqMsg("smoke")).min(1, t("otherInfo.errors.smoke")),
      kaliciRahatsizlik: z
        .string(reqMsg("permanentDisease"))
        .min(1, t("otherInfo.errors.permanentDisease")),
      rahatsizlikAciklama: z
        .string()
        .trim()
        .max(250, t("otherInfo.errors.diseaseDesc"))
        .optional(),
      ehliyet: z.string(reqMsg("license")).min(1, t("otherInfo.errors.license")),
      ehliyetTurleri: z.array(z.string()).optional().default([]),
      askerlik: z.string(reqMsg("military")).min(1, t("otherInfo.errors.military")),
      
      // --- BOY (Özel Validasyon Zinciri) ---
      boy: stringToNumberSchema(
        t("otherInfo.errors.heightNum"), // Boşsa bu mesaj (Sayı olmalı)
        t("otherInfo.errors.heightNum"), // Geçersizse bu mesaj (Sayı olmalı)
        t("otherInfo.errors.heightInt"), // Tam sayı değilse
        50, t("otherInfo.errors.heightMin"), // Min 50
        250, t("otherInfo.errors.heightMax") // Max 250
      ),
      
      // --- KİLO (Özel Validasyon Zinciri) ---
      kilo: stringToNumberSchema(
        t("otherInfo.errors.weightNum"),
        t("otherInfo.errors.weightNum"),
        t("otherInfo.errors.weightInt"),
        20, t("otherInfo.errors.weightMin"), // Min 20
        300, t("otherInfo.errors.weightMax") // Max 300
      ),
    })
    .superRefine((data, ctx) => {
      // Koşullu Validasyonlar (Eskisi gibi)
      const isPositive = (val) =>
        ["evet", "yes", "var", "have"].includes(String(val || "").toLowerCase());

      if (isPositive(data.davaDurumu) && (!data.davaNedeni || data.davaNedeni.trim().length < 3)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["davaNedeni"],
          message: t("otherInfo.errors.lawsuitReason"),
        });
      }

      if (
        isPositive(data.kaliciRahatsizlik) &&
        (!data.rahatsizlikAciklama || data.rahatsizlikAciklama.trim().length < 5)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rahatsizlikAciklama"],
          message: t("otherInfo.errors.diseaseDesc"),
        });
      }

      if (isPositive(data.ehliyet) && (!data.ehliyetTurleri || data.ehliyetTurleri.length < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ehliyetTurleri"],
          message: t("otherInfo.errors.licenseTypes"),
        });
      }
    });
};