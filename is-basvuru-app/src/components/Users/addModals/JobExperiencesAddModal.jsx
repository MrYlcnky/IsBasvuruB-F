import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useModalDismiss from "../modalHooks/useModalDismiss";
import { createJobExpSchema } from "../../../schemas/jobExperienceSchema"; // Şema importu
import SearchSelect from "../Selected/SearchSelect";
import MuiDateStringField from "../Date/MuiDateStringField";
import { lockScroll, unlockScroll } from "../modalHooks/scrollLock";
import {
  toISODate,
  fromISODateString,
  todayISO,
  yesterdayISO,
} from "../modalHooks/dateUtils";
import { useTranslation } from "react-i18next";

/* -------------------- Ülke / İl seçenekleri -------------------- */
const TR_IL_ILCE = {
  İstanbul: ["Kadıköy", "Üsküdar", "Beşiktaş", "Bakırköy", "Sarıyer"],
  Ankara: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Sincan"],
  İzmir: ["Konak", "Karşıyaka", "Bornova", "Buca", "Bayraklı"],
  Çorum: ["Merkez", "Sungurlu", "Osmancık", "İskilip", "Uğurludağ"],
  Kayseri: ["Kocasinan", "Melikgazi", "Talas", "Develi", "İncesu"],
  Antalya: ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat"],
};

const COUNTRY_OPTIONS = [
  "Türkiye",
  "Türkmenistan",
  "Pakistan",
  "Azerbaycan",
  "Kazakistan",
  "Kırgızistan",
  "Özbekistan",
  "Kuzey Kıbrıs (KKTC)",
  "Bangladeş",
  "Rusya",
  "Diğer",
];

const onlyLettersTR = (s) => s.replace(/[^a-zA-ZığüşöçİĞÜŞÖÇ\s]/g, "");

/* -------------------- ORTAK SINIF -------------------- */
const FIELD_BASE =
  "w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none border-gray-300 hover:border-black";

/* -------------------- COMPONENT -------------------- */
export default function JobExperiencesAddModal({
  open,
  mode = "create",
  initialData = null,
  onClose,
  onSave,
  onUpdate,
  anotherActiveExists = false,
}) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);

  // Şemayı burada oluşturuyoruz (Eski makeSchema yerine)
  const schema = useMemo(
    () => createJobExpSchema(t, anotherActiveExists),
    [t, anotherActiveExists]
  );

  const [formData, setFormData] = useState({
    isAdi: "",
    departman: "",
    pozisyon: "",
    gorev: "",
    ucret: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    ayrilisSebebi: "",
    isUlke: "",
    isSehir: "",
    halenCalisiyor: false,
  });

  const [touched, setTouched] = useState({});
  const touch = (name) =>
    setTouched((p) => (p[name] ? p : { ...p, [name]: true }));

  /* --------- Ülke/Şehir --------- */
  const [jobCountry, setJobCountry] = useState("");
  const [jobCountryOther, setJobCountryOther] = useState("");
  const [jobProvince, setJobProvince] = useState("");
  const [jobPlaceOther, setJobPlaceOther] = useState("");

  const countryOptions = [
    { value: "", label: t("common.pleaseSelect") },
  ].concat(COUNTRY_OPTIONS.map((c) => ({ value: c, label: c })));
  const ilOptions = [
    { value: "", label: t("jobExp.labels.selectProvince") },
  ].concat(Object.keys(TR_IL_ILCE).map((il) => ({ value: il, label: il })));

  const [errors, setErrors] = useState({});
  const [disabledTip, setDisabledTip] = useState("");

  const todayStr = useMemo(() => todayISO(), []);
  const yesterdayStr = useMemo(() => yesterdayISO(), []);

  const buildCandidate = (fd = formData) => {
    let countryFallback = jobCountry === "Diğer" ? jobCountryOther : jobCountry;
    let cityFallback =
      jobCountry === "Türkiye" ? jobProvince || "" : jobPlaceOther || "";
    const country =
      (fd.isUlke ?? "").toString() !== "" ? fd.isUlke : countryFallback || "";
    const city =
      (fd.isSehir ?? "").toString() !== "" ? fd.isSehir : cityFallback || "";
    return { ...fd, isUlke: country, isSehir: city };
  };

  const isValid = useMemo(() => {
    const parsed = schema.safeParse(buildCandidate());
    setDisabledTip(parsed.success ? "" : t("common.fillAllProperly"));
    return parsed.success;
  }, [
    formData,
    jobCountry,
    jobCountryOther,
    jobProvince,
    jobPlaceOther,
    schema,
    t,
  ]);

  const parseInitialCountryCity = (ulkeVal, sehirVal) => {
    if (!ulkeVal) {
      setJobCountry("");
      setJobCountryOther("");
      setJobProvince("");
      setJobPlaceOther("");
      return;
    }
    if (COUNTRY_OPTIONS.includes(ulkeVal)) {
      setJobCountry(ulkeVal);
      setJobCountryOther("");
    } else {
      setJobCountry("Diğer");
      setJobCountryOther(ulkeVal);
    }
    if (ulkeVal === "Türkiye") {
      setJobProvince(sehirVal || "");
      setJobPlaceOther("");
    } else {
      setJobProvince("");
      setJobPlaceOther(sehirVal || "");
    }
  };

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [open]);

  const handleClose = () => {
    unlockScroll();
    onClose?.();
  };

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialData) {
      const next = {
        isAdi: initialData.isAdi ?? "",
        departman: initialData.departman ?? "",
        pozisyon: initialData.pozisyon ?? "",
        gorev: initialData.gorev ?? "",
        ucret: initialData.ucret ?? "",
        baslangicTarihi: initialData.baslangicTarihi
          ? toISODate(fromISODateString(initialData.baslangicTarihi))
          : "",
        bitisTarihi: initialData.bitisTarihi
          ? toISODate(fromISODateString(initialData.bitisTarihi))
          : "",
        ayrilisSebebi: initialData.ayrilisSebebi ?? "",
        isUlke: initialData.isUlke ?? "",
        isSehir: initialData.isSehir ?? "",
        halenCalisiyor:
          initialData.halenCalisiyor === true ||
          !initialData.bitisTarihi ||
          initialData.bitisTarihi === "",
      };
      setFormData(next);
      parseInitialCountryCity(next.isUlke, next.isSehir);
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        isAdi: "",
        departman: "",
        pozisyon: "",
        gorev: "",
        ucret: "",
        baslangicTarihi: "",
        bitisTarihi: "",
        ayrilisSebebi: "",
        isUlke: "",
        isSehir: "",
        halenCalisiyor: false,
      });
      setJobCountry("");
      setJobCountryOther("");
      setJobProvince("");
      setJobPlaceOther("");
      setErrors({});
      setTouched({});
      setDisabledTip("");
    }
  }, [open, mode, initialData]);

  const onBackdropClick = useModalDismiss(open, handleClose, dialogRef);

  const validateField = (name, next) => {
    const parsed = schema.safeParse(buildCandidate(next));
    const issue = !parsed.success
      ? parsed.error.issues.find((i) => i.path[0] === name)
      : null;
    setErrors((p) => ({ ...p, [name]: issue ? issue.message : "" }));
  };

  const normalizeSalaryInput = (raw) =>
    raw
      .replace(/[^\d.,]/g, "")
      .replace(/,+/g, (m) => (m.length > 1 ? "," : ","));

  const onInput = (e) => {
    const { name, value } = e.target;
    const v = name === "ucret" ? normalizeSalaryInput(value) : value;
    const next = { ...formData, [name]: v };
    setFormData(next);
    if (!touched[name]) touch(name);
    validateField(name, next);
  };

  const onBlur = (e) => {
    const { name } = e.target;
    touch(name);
    validateField(name, formData);
  };

  const onDateChange = (name, value) => {
    const next = { ...formData, [name]: value || "" };
    setFormData(next);
    if (!touched[name]) touch(name);
    validateField(name, next);
  };
  const onDateBlur = (name) => {
    touch(name);
    validateField(name, formData);
  };

  const handleCountryChange = (e) => {
    const v = e.target.value;
    setJobCountry(v);
    setJobCountryOther("");
    setJobProvince("");
    setJobPlaceOther("");

    const next = { ...formData, isUlke: v === "Diğer" ? "" : v, isSehir: "" };
    setFormData(next);

    if (!touched.isUlke) touch("isUlke");
    validateField("isUlke", next);
    setErrors((p) => ({ ...p, isSehir: "" }));
  };

  const handleCityChangeTR = (e) => {
    const val = e.target.value;
    setJobProvince(val);
    const next = { ...formData, isSehir: val };
    setFormData(next);
    if (!touched.isSehir) touch("isSehir");
    validateField("isSehir", next);
  };

  const handleCityChangeOther = (e) => {
    const v = onlyLettersTR(e.target.value);
    setJobPlaceOther(v);
    if (jobCountry && (jobCountry !== "Diğer" || jobCountryOther)) {
      const next = { ...formData, isSehir: v };
      setFormData(next);
      if (!touched.isSehir) touch("isSehir");
      validateField("isSehir", next);
    }
  };

  const toggleHalenCalisiyor = (checked) => {
    const next = checked
      ? {
          ...formData,
          halenCalisiyor: true,
          bitisTarihi: "",
          ayrilisSebebi: "",
        }
      : { ...formData, halenCalisiyor: false };
    setFormData(next);
    if (!touched.halenCalisiyor) touch("halenCalisiyor");
    validateField("halenCalisiyor", next);
    setErrors((p) => ({
      ...p,
      bitisTarihi: checked ? "" : p.bitisTarihi,
      ayrilisSebebi: checked ? "" : p.ayrilisSebebi,
    }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const allKeys = [
      "isAdi",
      "departman",
      "pozisyon",
      "gorev",
      "ucret",
      "baslangicTarihi",
      "bitisTarihi",
      "ayrilisSebebi",
      "isUlke",
      "isSehir",
      "halenCalisiyor",
    ];
    setTouched(Object.fromEntries(allKeys.map((k) => [k, true])));

    const candidate = buildCandidate();
    const parsed = schema.safeParse(candidate);
    if (!parsed.success) {
      const newErrs = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) newErrs[i.path[0]] = i.message;
      });
      setErrors((prev) => ({ ...prev, ...newErrs }));
      return;
    }

    const d = parsed.data;
    const payload = {
      isAdi: d.isAdi.trim(),
      departman: d.departman.trim(),
      pozisyon: d.pozisyon.trim(),
      gorev: d.gorev.trim(),
      ucret: d.ucret === "" ? "" : String(d.ucret),
      baslangicTarihi: d.baslangicTarihi,
      bitisTarihi: d.halenCalisiyor || !d.bitisTarihi ? "" : d.bitisTarihi,
      ayrilisSebebi: (d.ayrilisSebebi || "").trim(),
      isUlke: d.isUlke.trim(),
      isSehir: d.isSehir.trim(),
      halenCalisiyor: !!d.halenCalisiyor,
    };

    if (mode === "edit") onUpdate?.(payload);
    else onSave?.(payload);
    handleClose();
  };

  if (!open) return null;

  const portalTarget = typeof document !== "undefined" ? document.body : null;

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
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 text-white px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate">
            {mode === "edit" ? t("jobExp.title.edit") : t("jobExp.title.add")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("common.close")}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/15 active:bg-white/25 focus:outline-none cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-white text-lg" />
          </button>
        </div>

        {/* DIV yapısı (Form içinde form olmaması için) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 overflow-visible">
            {/* 1. Satır */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("jobExp.labels.company")} *
                </label>
                <input
                  type="text"
                  name="isAdi"
                  value={formData.isAdi}
                  onChange={onInput}
                  onBlur={onBlur}
                  maxLength={100}
                  className={FIELD_BASE}
                  placeholder={t("jobExp.placeholders.company")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {touched.isAdi && errors.isAdi ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.isAdi}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.isAdi.length >= 90
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.isAdi.length}/100
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("jobExp.labels.department")} *
                </label>
                <input
                  type="text"
                  name="departman"
                  value={formData.departman}
                  onChange={onInput}
                  onBlur={onBlur}
                  maxLength={100}
                  className={FIELD_BASE}
                  placeholder={t("jobExp.placeholders.department")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {touched.departman && errors.departman ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.departman}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.departman.length >= 90
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.departman.length}/100
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Satır */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("jobExp.labels.position")} *
                </label>
                <input
                  type="text"
                  name="pozisyon"
                  value={formData.pozisyon}
                  onChange={onInput}
                  onBlur={onBlur}
                  maxLength={100}
                  className={FIELD_BASE}
                  placeholder={t("jobExp.placeholders.position")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {touched.pozisyon && errors.pozisyon ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.pozisyon}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.pozisyon.length >= 90
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.pozisyon.length}/100
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("jobExp.labels.duty")} *
                </label>
                <input
                  type="text"
                  name="gorev"
                  value={formData.gorev}
                  onChange={onInput}
                  onBlur={onBlur}
                  maxLength={120}
                  className={FIELD_BASE}
                  placeholder={t("jobExp.placeholders.duty")}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  {touched.gorev && errors.gorev ? (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.gorev}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className={`text-xs ${
                      formData.gorev.length >= 110
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.gorev.length}/120
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Satır: Ücret + Ülke */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {t("jobExp.labels.salary")} *
                </label>
                <input
                  type="text"
                  name="ucret"
                  value={formData.ucret}
                  onChange={onInput}
                  onBlur={onBlur}
                  className={FIELD_BASE}
                  placeholder={t("jobExp.placeholders.salary")}
                  required
                />
                {touched.ucret && errors.ucret && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.ucret}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  {t("jobExp.labels.country")} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchSelect
                    label={null}
                    name="isUlkeSelect"
                    value={jobCountry}
                    onChange={handleCountryChange}
                    options={countryOptions}
                    placeholder={t("jobExp.placeholders.countrySearch")}
                    isClearable={false}
                    menuPortalTarget={portalTarget}
                  />
                  <input
                    type="text"
                    placeholder={t("jobExp.placeholders.countryOther")}
                    value={jobCountryOther}
                    onChange={(e) => {
                      const v = onlyLettersTR(e.target.value);
                      setJobCountryOther(v);
                      if (jobCountry === "Diğer") {
                        const next = { ...formData, isUlke: v, isSehir: "" };
                        setFormData(next);
                        if (!touched.isUlke) touch("isUlke");
                        validateField("isUlke", next);
                      }
                    }}
                    disabled={jobCountry !== "Diğer"}
                    className={`block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none transition ${
                      jobCountry === "Diğer"
                        ? "bg-white border-gray-300 text-gray-900 hover:border-black"
                        : "bg-gray-200 border-gray-300 text-gray-500 disabled:cursor-not-allowed"
                    }`}
                  />
                </div>
                {touched.isUlke && errors.isUlke && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.isUlke}
                  </p>
                )}
              </div>
            </div>

            {/* 3.5 Satır: Şehir */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("jobExp.labels.city")} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobCountry === "Türkiye" ? (
                  <>
                    <SearchSelect
                      label={null}
                      name="isIl"
                      value={jobProvince}
                      onChange={handleCityChangeTR}
                      options={ilOptions}
                      placeholder={t("jobExp.placeholders.provinceSearch")}
                      isClearable={false}
                      isDisabled={!jobCountry}
                      menuPortalTarget={portalTarget}
                    />
                    <div className="hidden sm:block" />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder={t("jobExp.placeholders.cityOther")}
                      value={jobPlaceOther}
                      onChange={handleCityChangeOther}
                      disabled={
                        !jobCountry ||
                        (jobCountry === "Diğer" && !jobCountryOther)
                      }
                      className={`block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none transition ${
                        !jobCountry ||
                        (jobCountry === "Diğer" && !jobCountryOther)
                          ? "bg-gray-200 border-gray-300 text-gray-500 disabled:cursor-not-allowed"
                          : "bg-white border-gray-300 text-gray-900 hover:border-black"
                      }`}
                    />
                    <div className="hidden sm:block" />
                  </>
                )}
              </div>
              {touched.isSehir && errors.isSehir && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.isSehir}
                </p>
              )}
            </div>

            {/* Hâlen çalışıyorum */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="halenCalisiyorum"
                type="checkbox"
                className="h-4 w-4 cursor-pointer"
                checked={formData.halenCalisiyor}
                onChange={(e) => toggleHalenCalisiyor(e.target.checked)}
                onBlur={() => {
                  touch("halenCalisiyor");
                  validateField("halenCalisiyor", formData);
                }}
                disabled={anotherActiveExists && !formData.halenCalisiyor}
                title={
                  anotherActiveExists && !formData.halenCalisiyor
                    ? t("jobExp.err.alreadyActive")
                    : ""
                }
              />
              <label
                htmlFor="halenCalisiyorum"
                className="text-sm text-gray-700 select-none"
              >
                {t("jobExp.labels.ongoing")}
              </label>
              {touched.halenCalisiyor && errors.halenCalisiyor && (
                <span className="text-xs text-red-600 font-medium ml-2">
                  {errors.halenCalisiyor}
                </span>
              )}
            </div>

            {/* 4. Satır: Tarihler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="shadow-none">
                <MuiDateStringField
                  label={t("jobExp.labels.startDate")}
                  name="baslangicTarihi"
                  value={formData.baslangicTarihi}
                  onChange={(e) =>
                    onDateChange("baslangicTarihi", e.target.value)
                  }
                  onBlur={() => onDateBlur("baslangicTarihi")}
                  required
                  min="1950-01-01"
                  max={yesterdayStr}
                  size="small"
                  error={touched.baslangicTarihi ? errors.baslangicTarihi : ""}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d1d5db",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "black",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "black",
                    },
                    "& .MuiFormHelperText-root": { fontWeight: 500 },
                  }}
                />
              </div>
              <div className="shadow-none">
                <MuiDateStringField
                  label={`${t("jobExp.labels.endDate")} ${
                    formData.halenCalisiyor
                      ? `(${t("jobExp.badges.ongoing")})`
                      : "*"
                  }`}
                  name="bitisTarihi"
                  value={formData.bitisTarihi}
                  onChange={(e) => onDateChange("bitisTarihi", e.target.value)}
                  onBlur={() => onDateBlur("bitisTarihi")}
                  min={formData.baslangicTarihi || "1950-01-01"}
                  max={todayStr}
                  size="small"
                  disabled={formData.halenCalisiyor}
                  error={touched.bitisTarihi ? errors.bitisTarihi : ""}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d1d5db",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "black",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "black",
                    },
                    "& .MuiInputBase-root.Mui-disabled": {
                      backgroundColor: "#f3f4f6",
                    },
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#6b7280",
                    },
                    "& .MuiFormHelperText-root": { fontWeight: 500 },
                  }}
                />
              </div>
            </div>

            {/* 5. Satır: Ayrılış Sebebi */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t("jobExp.labels.leaveReason")}{" "}
                {formData.halenCalisiyor
                  ? `(${t("jobExp.badges.ongoing")})`
                  : "*"}
              </label>
              <input
                type="text"
                name="ayrilisSebebi"
                value={formData.ayrilisSebebi}
                onChange={onInput}
                onBlur={onBlur}
                maxLength={150}
                disabled={formData.halenCalisiyor}
                className={`rounded-lg px-3 py-2 focus:outline-none border ${
                  formData.halenCalisiyor
                    ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-70"
                    : "bg-white border-gray-300 hover:border-black"
                } w-full`}
                placeholder={t("jobExp.placeholders.leaveReason")}
              />
              <div className="flex justify-between items-center mt-1">
                {touched.ayrilisSebebi && errors.ayrilisSebebi ? (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.ayrilisSebebi}
                  </p>
                ) : (
                  <span />
                )}
                <p
                  className={`text-xs ${
                    (formData.ayrilisSebebi || "").length >= 140
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {(formData.ayrilisSebebi || "").length}/150
                </p>
              </div>
            </div>
          </div>

          {/* Alt aksiyon bar */}
          <div className="border-t bg-white px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition cursor-pointer"
              >
                {t("common.cancel")}
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
                {mode === "edit" ? t("common.update") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
