import { z } from "zod";

const NAME_STRICT_RE = /^[a-zA-ZığüşöçİĞÜŞÖÇ\s]+$/u;
const ORG_JOB_RE = /^[-a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s'’]+$/u;
const PHONE_RE = /^\+?[0-9\s()-]{8,20}$/;

export const createReferenceSchema = (t) =>
  z.object({
    calistigiKurum: z.string().min(1, t("references.validations.orgTypeRequired")),
    referansAdi: z
      .string()
      .trim()
      .regex(NAME_STRICT_RE, t("references.validations.firstNameAlpha"))
      .min(2, t("references.validations.firstNameMin"))
      .max(50, t("references.validations.firstNameMax")),
    referansSoyadi: z
      .string()
      .trim()
      .regex(NAME_STRICT_RE, t("references.validations.lastNameAlpha"))
      .min(2, t("references.validations.lastNameMin"))
      .max(50, t("references.validations.lastNameMax")),
    referansIsYeri: z
      .string()
      .trim()
      .regex(ORG_JOB_RE, t("references.validations.workplaceFormat"))
      .min(2, t("references.validations.workplaceRequired"))
      .max(100, t("references.validations.workplaceMax")),
    referansGorevi: z
      .string()
      .trim()
      .regex(ORG_JOB_RE, t("references.validations.roleFormat"))
      .min(2, t("references.validations.roleRequired"))
      .max(100, t("references.validations.roleMax")),
    referansTelefon: z
      .string()
      .trim()
      .min(1, t("references.validations.phoneRequired"))
      .regex(PHONE_RE, t("references.validations.phoneInvalid")),
  });