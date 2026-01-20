import { z } from "zod";

// Regex sabitleri
const TEXT_ONLY_TR = /^[a-zA-ZığüşöçİĞÜŞÖÇ\s]+$/u;
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

export const createPersonalSchema = (t) => {
  const reqMsg = (key) => ({
    required_error: t(`personal.errors.${key}.required`),
    invalid_type_error: t(`personal.errors.${key}.required`),
  });

  return z.object({
    ad: z
      .string(reqMsg("firstName"))
      .min(1, t("personal.errors.firstName.required"))
      .max(30)
      .regex(TEXT_ONLY_TR, t("personal.errors.firstName.regex")),
    soyad: z
      .string(reqMsg("lastName"))
      .min(1, t("personal.errors.lastName.required"))
      .max(30)
      .regex(TEXT_ONLY_TR, t("personal.errors.lastName.regex")),
    eposta: z
      .string(reqMsg("email"))
      .email(t("personal.errors.email.invalid")),
    telefon: z
      .string(reqMsg("phone"))
      .min(1, t("personal.errors.phone.required"))
      .transform((v) => v.replace(/[\s()-]/g, ""))
      .refine((v) => PHONE_REGEX.test(v), {
        message: t("personal.errors.phone.format"),
      }),
    whatsapp: z
      .string(reqMsg("whatsapp"))
      .min(1, t("personal.errors.whatsapp.required"))
      .transform((v) => v.replace(/[\s()-]/g, ""))
      .refine((v) => PHONE_REGEX.test(v), {
        message: t("personal.errors.whatsapp.format"),
      }),
    adres: z
      .string(reqMsg("address"))
      .min(5, t("personal.errors.address.min"))
      .max(90, t("personal.errors.address.max")),
    cinsiyet: z
      .string(reqMsg("gender"))
      .min(1, t("personal.errors.gender.required")),
    medeniDurum: z
      .string(reqMsg("marital"))
      .min(1, t("personal.errors.marital.required")),
    dogumTarihi: z
      .string(reqMsg("birthDate"))
      .min(1, t("personal.errors.birthDate.required")),
    cocukSayisi: z.string().optional(),
    
    // --- LOKASYON BİLGİLERİ (GÜNCELLENDİ) ---
    dogumUlke: z
      .string(reqMsg("birthCountry"))
      .min(1, t("personal.errors.birthCountry")),
    dogumSehir: z
      .string(reqMsg("birthCity"))
      .min(1, t("personal.errors.birthCity")),
    dogumIlce: z.string().optional(), // Zorunluluğu superRefine ile kontrol edeceğiz

    ikametUlke: z
      .string(reqMsg("resCountry"))
      .min(1, t("personal.errors.resCountry")),
    ikametSehir: z
      .string(reqMsg("resCity"))
      .min(1, t("personal.errors.resCity")),
    ikametIlce: z.string().optional(),

    uyruk: z
      .string(reqMsg("nationality"))
      .min(1, t("personal.errors.nationality")),
    foto: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    // Eğer ülke Türkiye ise İlçe seçimi zorunludur
    if (data.dogumUlke === "Türkiye" && (!data.dogumIlce || data.dogumIlce.length < 1)) {
      ctx.addIssue({
        path: ["dogumIlce"],
        code: z.ZodIssueCode.custom,
        message: t("personal.errors.birthCity"), // "İlçe seçiniz" gibi bir mesaj eklenebilir
      });
    }
    if (data.ikametUlke === "Türkiye" && (!data.ikametIlce || data.ikametIlce.length < 1)) {
      ctx.addIssue({
        path: ["ikametIlce"],
        code: z.ZodIssueCode.custom,
        message: t("personal.errors.resCity"),
      });
    }
  });
};