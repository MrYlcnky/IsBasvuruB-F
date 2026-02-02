import { z } from "zod";

// Regex sabitleri
const TEXT_ONLY_TR = /^[a-zA-ZığüşöçİĞÜŞÖÇ\s]+$/u;
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

// yardımcılar
const isFilled = (v) => (v ?? "").toString().trim().length > 0;

const numOrNull = z.preprocess((v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}, z.number().nullable());

// ✅ File kontrolü (File / FileList / Array)
const hasRealFile = (v) => {
  if (!v) return false;
  if (v instanceof File) return true;
  // input file bazen FileList döner
  if (typeof FileList !== "undefined" && v instanceof FileList)
    return v.length > 0;
  // bazı componentlerde array gelebilir
  if (Array.isArray(v)) return v.length > 0 && v[0] instanceof File;
  // bazı lib'lerde { file: File } gibi gelebilir
  if (typeof v === "object" && v.file instanceof File) return true;
  return false;
};

// ✅ İlçe var mı? (sehirId’ye göre ilce listesinde eşleşme arar)
const hasDistrictsForCity = (cityId, ilceler = []) => {
  if (cityId == null) return false;
  const cid = Number(cityId);
  if (!Number.isFinite(cid)) return false;

  return (ilceler ?? []).some((x) => {
    const sid =
      x?.SehirId ??
      x?.sehirId ??
      x?.CityId ??
      x?.cityId ??
      x?.SehirID ??
      x?.sehirID;
    const n = Number(sid);
    return Number.isFinite(n) && n === cid;
  });
};

export const createPersonalSchema = (t, defs = {}) => {
  const reqMsg = (key) => ({
    required_error: t(`personal.errors.${key}.required`),
    invalid_type_error: t(`personal.errors.${key}.required`),
  });

  const ilceler = defs?.ilceler ?? [];

  return z
    .object({
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

      // ✅ DTO alanlar
      UyrukId: numOrNull,
      UyrukAdi: z.string().optional().nullable().or(z.literal("")),

      DogumUlkeId: numOrNull,
      DogumUlkeAdi: z.string().optional().nullable().or(z.literal("")),
      DogumSehirId: numOrNull,
      DogumSehirAdi: z.string().optional().nullable().or(z.literal("")),
      DogumIlceId: numOrNull,
      DogumIlceAdi: z.string().optional().nullable().or(z.literal("")),

      IkametgahUlkeId: numOrNull,
      IkametgahUlkeAdi: z.string().optional().nullable().or(z.literal("")),
      IkametgahSehirId: numOrNull,
      IkametgahSehirAdi: z.string().optional().nullable().or(z.literal("")),
      IkametgahIlceId: numOrNull,
      IkametgahIlceAdi: z.string().optional().nullable().or(z.literal("")),

      // ✅ Vesikalık zorunlu
      VesikalikDosyasi: z.any(),

      // opsiyonel (preview vs için)
      foto: z.any().optional(),
    })
    .superRefine((data, ctx) => {
      // ✅ Vesikalık dosya zorunlu
      if (!hasRealFile(data.VesikalikDosyasi)) {
        ctx.addIssue({
          path: ["VesikalikDosyasi"],
          code: z.ZodIssueCode.custom,
          // istediğin uyarı:
          message:
            "⚠️ Fotoğraf önizlemesi var ama dosya yok. Gönderebilmek için fotoğrafı yeniden yükleyin.",
          // istersen çeviri key’i açıp şu şekilde yapabilirsin:
          // message: t("personal.errors.photo.reupload")
        });
      }

      // ✅ Uyruk: ID seçiliyse OK, değilse (Diğer) adı zorunlu
      if (data.UyrukId == null && !isFilled(data.UyrukAdi)) {
        ctx.addIssue({
          path: ["UyrukId"],
          code: z.ZodIssueCode.custom,
          message: t("personal.errors.nationality"),
        });
      }

      // ✅ Doğum Ülke
      if (data.DogumUlkeId == null && !isFilled(data.DogumUlkeAdi)) {
        ctx.addIssue({
          path: ["DogumUlkeId"],
          code: z.ZodIssueCode.custom,
          message: t("personal.errors.birthCountry"),
        });
      }

      // ✅ Doğum Şehir
      if (data.DogumSehirId == null && !isFilled(data.DogumSehirAdi)) {
        ctx.addIssue({
          path: ["DogumSehirId"],
          code: z.ZodIssueCode.custom,
          message: t("personal.errors.birthCity"),
        });
      }

      // ✅ Doğum İlçe:
      // Şehir seçildiyse ve o şehre bağlı ilçe varsa -> ilçe zorunlu
      const dogumSehirId = data.DogumSehirId;
      const mustBirthDistrict =
        (dogumSehirId != null && hasDistrictsForCity(dogumSehirId, ilceler)) ||
        (dogumSehirId != null && ilceler.length > 0); // fallback: elinde ilce datası varsa zorunlu say

      if (
        mustBirthDistrict &&
        data.DogumIlceId == null &&
        !isFilled(data.DogumIlceAdi)
      ) {
        ctx.addIssue({
          path: ["DogumIlceId"],
          code: z.ZodIssueCode.custom,
          // varsa translation key aç: personal.errors.birthDistrict.required
          message:
            t("personal.errors.birthDistrict") || "Doğum ilçesi zorunludur.",
        });
      }

      // ✅ İkamet Ülke
      if (data.IkametgahUlkeId == null && !isFilled(data.IkametgahUlkeAdi)) {
        ctx.addIssue({
          path: ["IkametgahUlkeId"],
          code: z.ZodIssueCode.custom,
          message: t("personal.errors.resCountry"),
        });
      }

      // ✅ İkamet Şehir
      if (data.IkametgahSehirId == null && !isFilled(data.IkametgahSehirAdi)) {
        ctx.addIssue({
          path: ["IkametgahSehirId"],
          code: z.ZodIssueCode.custom,
          message: t("personal.errors.resCity"),
        });
      }

      // ✅ İkamet İlçe:
      const ikametSehirId = data.IkametgahSehirId;
      const mustResDistrict =
        (ikametSehirId != null &&
          hasDistrictsForCity(ikametSehirId, ilceler)) ||
        (ikametSehirId != null && ilceler.length > 0);

      if (
        mustResDistrict &&
        data.IkametgahIlceId == null &&
        !isFilled(data.IkametgahIlceAdi)
      ) {
        ctx.addIssue({
          path: ["IkametgahIlceId"],
          code: z.ZodIssueCode.custom,
          message:
            t("personal.errors.resDistrict") || "İkamet ilçesi zorunludur.",
        });
      }
    });
};
