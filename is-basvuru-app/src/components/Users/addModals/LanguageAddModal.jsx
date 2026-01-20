import { useEffect, useRef, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useModalDismiss from "../modalHooks/useModalDismiss";
import { lockScroll, unlockScroll } from "../modalHooks/scrollLock";
import { useTranslation } from "react-i18next";
import { createLanguageSchema } from "../../../schemas/languageSchema"; // Şema importu

/* -------------------- Ortak Sınıflar -------------------- */
const BASE_SELECT =
  "w-full h-[43px] border rounded-lg px-3 py-2 focus:outline-none transition border-gray-300 hover:border-black cursor-pointer";
const BASE_INPUT =
  "w-full h-[43px] border rounded-lg px-3 py-2 focus:outline-none transition border-gray-300 hover:border-black";

export default function LanguageAddModal({
  open,
  mode = "create",
  initialData = null, // { id, dil, konusma, yazma, okuma, dinleme, ogrenilenKurum }
  onClose,
  onSave,
  onUpdate,
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => createLanguageSchema(t), [t]);

  const dialogRef = useRef(null);

  // "Dil" alanını iki parçaya ayırıyoruz: select + diğer metin
  const [dilSelect, setDilSelect] = useState("");
  const [dilOther, setDilOther] = useState("");

  const [formData, setFormData] = useState({
    dil: "",
    konusma: "",
    yazma: "",
    okuma: "",
    dinleme: "",
    ogrenilenKurum: "",
  });

  const [errors, setErrors] = useState({
    dil: "",
    konusma: "",
    yazma: "",
    okuma: "",
    dinleme: "",
    ogrenilenKurum: "",
  });

  const otherRef = useRef(null);

  /* ---------- SCROLL LOCK ---------- */
  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [open]);

  const handleClose = () => {
    unlockScroll();
    onClose?.();
  };

  // Modal her açıldığında formu doldur/temizle
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      const incomingDil = (initialData.dil ?? "").trim();
      const knownValues = [
        t("languages.options.english"),
        t("languages.options.german"),
      ];
      const isKnown = knownValues.includes(incomingDil);
      setDilSelect(
        isKnown ? incomingDil : incomingDil ? t("languages.options.other") : ""
      );
      setDilOther(isKnown ? "" : incomingDil);

      setFormData({
        dil: incomingDil,
        konusma: initialData.konusma ?? "",
        yazma: initialData.yazma ?? "",
        okuma: initialData.okuma ?? "",
        dinleme: initialData.dinleme ?? "",
        ogrenilenKurum: (initialData.ogrenilenKurum ?? "").trim(),
      });
    } else {
      setDilSelect("");
      setDilOther("");
      setFormData({
        dil: "",
        konusma: "",
        yazma: "",
        okuma: "",
        dinleme: "",
        ogrenilenKurum: "",
      });
    }

    setErrors({
      dil: "",
      konusma: "",
      yazma: "",
      okuma: "",
      dinleme: "",
      ogrenilenKurum: "",
    });
  }, [open, mode, initialData, t]);

  // backdrop click ile kapat
  const onBackdropClick = useModalDismiss(open, handleClose, dialogRef);

  // Tek handleChange + alan bazlı Zod kontrol
  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);

    const parsed = schema.safeParse(next);
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path[0] === name);
      setErrors((p) => ({ ...p, [name]: issue ? issue.message : "" }));
    } else {
      setErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  const isValid = schema.safeParse(formData).success;
  const disabledTip = !isValid
    ? (() => {
        const r = schema.safeParse(formData);
        return r.success
          ? ""
          : r.error.issues.map((i) => i.message).join(" • ");
      })()
    : "";

  // Submit
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const sanitized = {
      ...formData,
      dil: formData.dil.trim(),
      ogrenilenKurum: formData.ogrenilenKurum.trim(),
    };
    const final = schema.safeParse(sanitized);
    if (!final.success) {
      const next = { ...errors };
      final.error.issues.forEach((i) => {
        const key = i.path[0];
        if (key) next[key] = i.message;
      });
      setErrors(next);
      return;
    }

    const payload = final.data;
    if (mode === "edit") onUpdate?.(payload);
    else onSave?.(payload);

    handleClose();
  };

  if (!open) return null;

  const dilCounterColor =
    dilOther.length >= 36 ? "text-red-500" : "text-gray-400";

  // Seçenekler (i18n)
  const CHOOSE = t("languages.select.choose");
  const OPT_EN = t("languages.options.english");
  const OPT_DE = t("languages.options.german");
  const OPT_OTHER = t("languages.options.other");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={onBackdropClick}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 text-white px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate">
            {mode === "edit"
              ? t("languages.modal.titleEdit")
              : t("languages.modal.titleCreate")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("actions.close")}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/15 active:bg-white/25 focus:outline-none cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-white text-lg" />
          </button>
        </div>

        {/* Form (DIV'e çevrildi) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* 1 Dil - (Diğer Dil Adı) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Dil Adı */}
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  {t("languages.form.language")}
                </label>

                <select
                  value={dilSelect}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDilSelect(v);
                    if (v !== OPT_OTHER) setDilOther("");

                    const effective = v === OPT_OTHER ? "" : v;
                    handleChange({ target: { name: "dil", value: effective } });

                    if (v === OPT_OTHER)
                      setTimeout(() => otherRef.current?.focus(), 0);
                  }}
                  className={`${BASE_SELECT} ${
                    errors.dil ? "border-red-500 hover:border-red-500" : ""
                  }`}
                  required
                  aria-invalid={Boolean(errors.dil)}
                  aria-describedby="err-dil"
                >
                  <option value="">{CHOOSE}</option>
                  <option value={OPT_EN}>{OPT_EN}</option>
                  <option value={OPT_DE}>{OPT_DE}</option>
                  <option value={OPT_OTHER}>{OPT_OTHER}</option>
                </select>

                <div className="mt-1 min-h-[1rem]">
                  {errors.dil && (
                    <p
                      id="err-dil"
                      className="text-xs text-red-600 font-medium"
                    >
                      {errors.dil}
                    </p>
                  )}
                </div>
              </div>

              {/* Diğer Dil Adı */}
              <div className="sm:col-span-2 relative">
                <label className="block text-sm text-gray-600 mb-1">
                  {t("languages.form.otherLanguage")}
                </label>

                <input
                  ref={otherRef}
                  type="text"
                  value={dilOther}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDilOther(v);
                    if (dilSelect === OPT_OTHER) {
                      handleChange({ target: { name: "dil", value: v } });
                    }
                  }}
                  disabled={dilSelect !== OPT_OTHER}
                  placeholder={
                    dilSelect === OPT_OTHER
                      ? t("languages.placeholders.otherLanguage")
                      : t("languages.select.choose")
                  }
                  className={
                    dilSelect === OPT_OTHER
                      ? `${BASE_INPUT} pr-14 bg-white text-gray-900`
                      : "w-full h-[43px] border rounded-lg px-3 py-2 pr-14 bg-gray-200 text-gray-500 border-gray-300 disabled:cursor-not-allowed focus:outline-none"
                  }
                  maxLength={40}
                  aria-describedby="dil-other-counter"
                />

                <span
                  id="dil-other-counter"
                  className={`absolute right-3 bottom-1 text-xs ${dilCounterColor}`}
                >
                  {dilOther.length}/40
                </span>
              </div>
            </div>

            {/* 2 Konuşma - Yazma - Okuma - Dinleme */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                ["konusma", t("languages.form.speaking")],
                ["yazma", t("languages.form.writing")],
                ["okuma", t("languages.form.reading")],
                ["dinleme", t("languages.form.listening")],
              ].map(([name, label]) => (
                <div key={name} className="sm:col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    {label}
                  </label>
                  <select
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`${BASE_SELECT} ${
                      errors[name] ? "border-red-500 hover:border-red-500" : ""
                    }`}
                    required
                  >
                    <option value="">{CHOOSE}</option>
                    <option value="A1">{t("languages.levels.A1")}</option>
                    <option value="A2">{t("languages.levels.A2")}</option>
                    <option value="B1">{t("languages.levels.B1")}</option>
                    <option value="B2">{t("languages.levels.B2")}</option>
                    <option value="C1">{t("languages.levels.C1")}</option>
                    <option value="C2">{t("languages.levels.C2")}</option>
                  </select>
                  {errors[name] && (
                    <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* 3 Nasıl Öğrenildi */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-sm text-gray-600 mb-1">
                  {t("languages.form.learnedHow")}
                </label>
                <input
                  type="text"
                  name="ogrenilenKurum"
                  value={formData.ogrenilenKurum}
                  onChange={handleChange}
                  className={`${BASE_INPUT}`}
                  placeholder={t("languages.placeholders.learnedHow")}
                  maxLength={80}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.ogrenilenKurum ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.ogrenilenKurum}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.ogrenilenKurum.length >= 72
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.ogrenilenKurum.length}/80
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alt aksiyon bar (butonlar) */}
          <div className="border-t bg-white px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition cursor-pointer"
              >
                {t("actions.cancel")}
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid}
                title={disabledTip}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white transition ${
                  isValid
                    ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 cursor-pointer"
                    : "bg-blue-300 opacity-90 cursor-not-allowed"
                }`}
              >
                {mode === "edit" ? t("actions.update") : t("actions.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
