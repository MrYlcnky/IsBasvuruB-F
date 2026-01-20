import { z } from "zod";

const LANG_REGEX = /^[a-zA-ZığüşöçİĞÜŞÖÇ\s.-]+$/;

export const createLanguageSchema = (t) => {
  return z.object({
    dil: z
      .string()
      .trim()
      .min(1, t("languages.validations.languageRequired"))
      .max(40, t("languages.validations.languageMax"))
      .regex(LANG_REGEX, t("languages.validations.languageRegex")),
    konusma: z.string().min(1, t("languages.validations.speakingRequired")),
    yazma: z.string().min(1, t("languages.validations.writingRequired")),
    okuma: z.string().min(1, t("languages.validations.readingRequired")),
    dinleme: z.string().min(1, t("languages.validations.listeningRequired")),
    ogrenilenKurum: z
      .string()
      .trim()
      .min(1, t("languages.validations.learnedHowRequired"))
      .max(80, t("languages.validations.learnedHowMax"))
      .regex(LANG_REGEX, t("languages.validations.learnedHowRegex")),
  });
};