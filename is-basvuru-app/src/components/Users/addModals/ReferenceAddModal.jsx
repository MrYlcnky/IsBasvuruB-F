import { useEffect, useRef, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useModalDismiss from "../modalHooks/useModalDismiss";
import { lockScroll, unlockScroll } from "../modalHooks/scrollLock";
import { useTranslation } from "react-i18next";
import { createReferenceSchema } from "../../../schemas/referenceSchema"; // Şema importu

/* -------------------- Ortak Alan Sınıfı -------------------- */
const FIELD_BASE =
  "w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none border-gray-300 hover:border-black focus:border-black";

export default function ReferenceAddModal({
  open,
  mode = "create",
  initialData = null,
  onClose,
  onSave,
  onUpdate,
}) {
  const { t } = useTranslation();
  // Merkezi şemayı kullan
  const refSchema = useMemo(() => createReferenceSchema(t), [t]);

  const dialogRef = useRef(null);

  const [formData, setFormData] = useState({
    calistigiKurum: "",
    referansAdi: "",
    referansSoyadi: "",
    referansIsYeri: "",
    referansGorevi: "",
    referansTelefon: "",
  });

  const [errors, setErrors] = useState({});

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

  // Modal açıldığında formu doldur / temizle
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialData) {
      setFormData({
        calistigiKurum: initialData.calistigiKurum ?? "",
        referansAdi: initialData.referansAdi ?? "",
        referansSoyadi: initialData.referansSoyadi ?? "",
        referansIsYeri: initialData.referansIsYeri ?? "",
        referansGorevi: initialData.referansGorevi ?? "",
        referansTelefon: initialData.referansTelefon ?? "",
      });
      setErrors({});
    } else {
      setFormData({
        calistigiKurum: "",
        referansAdi: "",
        referansSoyadi: "",
        referansIsYeri: "",
        referansGorevi: "",
        referansTelefon: "",
      });
      setErrors({});
    }
  }, [open, mode, initialData]);

  const onBackdropClick = useModalDismiss(open, handleClose, dialogRef);

  /* -------------------- Change bazlı doğrulama -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);

    const parsed = refSchema.safeParse(next);
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path[0] === name);
      setErrors((p) => ({ ...p, [name]: issue ? issue.message : "" }));
    } else {
      setErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  /* -------------------- Geçerlilik ve ipucu -------------------- */
  const isValid = useMemo(
    () => refSchema.safeParse(formData).success,
    [formData, refSchema]
  );
  const disabledTip = !isValid ? t("common.fillAllProperly") : "";

  /* -------------------- Submit -------------------- */
  const handleSubmit = (e) => {
    if (e) e.preventDefault(); // Form submiti engelle
    const parsed = refSchema.safeParse(formData);
    if (!parsed.success) {
      const next = {};
      parsed.error.issues.forEach((i) => {
        const key = i.path[0];
        if (key) next[key] = i.message;
      });
      setErrors(next);
      return;
    }

    const d = parsed.data;
    const payload = {
      calistigiKurum: d.calistigiKurum,
      referansAdi: d.referansAdi.trim(),
      referansSoyadi: d.referansSoyadi.trim(),
      referansIsYeri: d.referansIsYeri.trim(),
      referansGorevi: d.referansGorevi.trim(),
      referansTelefon: d.referansTelefon.trim(),
    };

    if (mode === "edit") onUpdate?.(payload);
    else onSave?.(payload);

    handleClose();
  };

  if (!open) return null;

  // i18n options
  const SELECT = t("common.pleaseSelect");
  const IN_HOUSE = t("references.options.inHouse");
  const EXTERNAL = t("references.options.external");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={onBackdropClick}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 text-white px-6 py-4">
          <h2 className="text-lg font-semibold truncate">
            {mode === "edit"
              ? t("references.modal.titleEdit")
              : t("references.modal.titleCreate")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("actions.close")}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/15 active:bg-white/25 cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-white text-lg" />
          </button>
        </div>

        {/* Form yerine DIV */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Çalıştığı Kurum */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("references.form.orgType")}
                </label>
                <select
                  name="calistigiKurum"
                  value={formData.calistigiKurum}
                  onChange={handleChange}
                  className={`${FIELD_BASE} h-[43px]`}
                  required
                >
                  <option value="">{SELECT}</option>
                  <option value={IN_HOUSE}>{IN_HOUSE}</option>
                  <option value={EXTERNAL}>{EXTERNAL}</option>
                </select>
                {errors.calistigiKurum && (
                  <p className="mt-1 text-xs text-red-700">
                    {errors.calistigiKurum}
                  </p>
                )}
              </div>

              {/* Ad */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("references.form.firstName")}
                </label>
                <input
                  type="text"
                  name="referansAdi"
                  value={formData.referansAdi}
                  onChange={handleChange}
                  maxLength={50}
                  className={FIELD_BASE}
                  placeholder={t("references.placeholders.firstName")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.referansAdi ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.referansAdi}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.referansAdi.length >= 45
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.referansAdi.length}/50
                  </p>
                </div>
              </div>

              {/* Soyad */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("references.form.lastName")}
                </label>
                <input
                  type="text"
                  name="referansSoyadi"
                  value={formData.referansSoyadi}
                  onChange={handleChange}
                  maxLength={50}
                  className={FIELD_BASE}
                  placeholder={t("references.placeholders.lastName")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.referansSoyadi ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.referansSoyadi}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.referansSoyadi.length >= 45
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.referansSoyadi.length}/50
                  </p>
                </div>
              </div>

              {/* İşyeri */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("references.form.workplace")}
                </label>
                <input
                  type="text"
                  name="referansIsYeri"
                  value={formData.referansIsYeri}
                  onChange={handleChange}
                  maxLength={100}
                  className={FIELD_BASE}
                  placeholder={t("references.placeholders.workplace")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.referansIsYeri ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.referansIsYeri}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.referansIsYeri.length >= 90
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.referansIsYeri.length}/100
                  </p>
                </div>
              </div>

              {/* Görev */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("references.form.role")}
                </label>
                <input
                  type="text"
                  name="referansGorevi"
                  value={formData.referansGorevi}
                  onChange={handleChange}
                  maxLength={100}
                  className={FIELD_BASE}
                  placeholder={t("references.placeholders.role")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.referansGorevi ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.referansGorevi}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.referansGorevi.length >= 90
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.referansGorevi.length}/100
                  </p>
                </div>
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("references.form.phone")}
                </label>
                <input
                  type="tel"
                  name="referansTelefon"
                  value={formData.referansTelefon}
                  onChange={handleChange}
                  maxLength={20}
                  className={FIELD_BASE}
                  placeholder={t("references.placeholders.phone")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.referansTelefon ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.referansTelefon}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.referansTelefon.length >= 18
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.referansTelefon.length}/20
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

              {mode === "create" ? (
                <button
                  type="button" // Submit değil, normal buton
                  onClick={handleSubmit}
                  disabled={!isValid}
                  title={disabledTip}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white transition ${
                    isValid
                      ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 cursor-pointer"
                      : "bg-blue-300 opacity-90 cursor-not-allowed"
                  }`}
                >
                  {t("actions.save")}
                </button>
              ) : (
                <button
                  type="button" // Submit değil, normal buton
                  onClick={handleSubmit}
                  disabled={!isValid}
                  title={disabledTip}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white transition ${
                    isValid
                      ? "bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 cursor-pointer"
                      : "bg-green-300 opacity-90 cursor-not-allowed"
                  }`}
                >
                  {t("actions.update")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
