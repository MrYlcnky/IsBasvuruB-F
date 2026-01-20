import { z } from "zod";

export const createComputerSchema = (t) => {
  return z.object({
    programAdi: z
      .string()
      .trim()
      .min(1, t("computer.validations.program.required"))
      .max(60, t("computer.validations.program.max")),
    yetkinlik: z
      .string()
      .min(1, t("computer.validations.level.required")),
  });
};