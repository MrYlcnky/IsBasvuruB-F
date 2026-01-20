// src/components/Users/usersComponents/OtherPersonalInformationTable.jsx
import { useMemo } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import Select from "react-select";
import { useTranslation } from "react-i18next";
// DÜZELTME: Kullanılmayan import kaldırıldı
// import { createOtherInfoSchema } from "../../../schemas/otherInfoSchema";

/* -------------------- Sabitler -------------------- */
const EHLIYET_TURLERI = [
  "M",
  "A1",
  "A2",
  "A",
  "B1",
  "B",
  "BE",
  "C1",
  "C1E",
  "C",
  "CE",
  "D1",
  "D1E",
  "D",
  "DE",
  "F",
  "G",
];

// Stil sabiti
const rsBaseControl =
  "w-full h-[43px] overflow-hidden rounded-lg border border-gray-300 px-3 bg-white shadow-none focus:outline-none transition-none hover:border-black focus-within:border-black flex items-start";

const rsClassNames = {
  container: () => "w-full",
  control: () => rsBaseControl,
  valueContainer: () =>
    "h-[39px] overflow-y-auto flex flex-wrap items-start gap-1 py-0 pr-1",
  placeholder: () => "text-gray-400",
  multiValue: () => "bg-gray-100 text-gray-800 rounded px-2 py-[2px]",
  multiValueLabel: () => "text-sm font-medium",
  multiValueRemove: () => "text-gray-600 hover:text-red-600 cursor-pointer",
  indicatorsContainer: () => "gap-1",
  indicatorSeparator: () => "hidden",
  dropdownIndicator: () => "text-gray-500 transition-none",
  menu: () =>
    "mt-1 border border-gray-200 rounded-md bg-white shadow-none overflow-hidden z-[999]",
  menuList: () => "max-h-56 overflow-auto",
  option: ({ isFocused, isSelected }) =>
    `px-3 py-2 cursor-pointer ${
      isSelected ? "bg-gray-200 text-gray-800" : isFocused ? "bg-gray-100" : ""
    }`,
};

export default function OtherPersonalInformationTable() {
  const { t } = useTranslation();
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  // --- Anlık İzleme (Watch) ---
  const davaDurumu = useWatch({ name: "otherInfo.davaDurumu" });
  const kaliciRahatsizlik = useWatch({ name: "otherInfo.kaliciRahatsizlik" });
  const ehliyet = useWatch({ name: "otherInfo.ehliyet" });
  const ehliyetTurleri = useWatch({ name: "otherInfo.ehliyetTurleri" }) || [];

  // --- Seçenekler (Memoized) ---
  const belgeOptions = useMemo(
    () =>
      (t("otherInfo.options.kktcDoc", { returnObjects: true }) || []).map(
        (v) => ({ value: v, label: v })
      ),
    [t]
  );
  const yesNo = useMemo(
    () => ({
      yes: t("otherInfo.options.yesNo.yes"),
      no: t("otherInfo.options.yesNo.no"),
    }),
    [t]
  );
  const licenseOpts = useMemo(
    () => ({
      have: t("otherInfo.options.license.have"),
      none: t("otherInfo.options.license.none"),
    }),
    [t]
  );
  const lawsuitOpts = useMemo(
    () => ({
      have: t("otherInfo.options.lawsuit.have"),
      none: t("otherInfo.options.lawsuit.none"),
    }),
    [t]
  );
  const militaryOpts = useMemo(
    () => ({
      done: t("otherInfo.options.military.done"),
      notDone: t("otherInfo.options.military.notDone"),
      postponed: t("otherInfo.options.military.postponed"),
      exempt: t("otherInfo.options.military.exempt"),
    }),
    [t]
  );

  const ehliyetTurOptions = useMemo(
    () => EHLIYET_TURLERI.map((t_) => ({ value: t_, label: t_ })),
    []
  );

  // --- Yardımcı Kontroller ---
  const isPositive = (val) =>
    ["evet", "yes", "var", "have"].includes(String(val || "").toLowerCase());

  const isLawsuitYes = isPositive(davaDurumu);
  const isDiseaseYes = isPositive(kaliciRahatsizlik);
  const isLicenseYes = isPositive(ehliyet);

  // --- Handlers (Yan Etkiler) ---
  const handleDavaChange = (val, field) => {
    field.onChange(val);
    if (!isPositive(val)) setValue("otherInfo.davaNedeni", "");
  };
  const handleDiseaseChange = (val, field) => {
    field.onChange(val);
    if (!isPositive(val)) setValue("otherInfo.rahatsizlikAciklama", "");
  };
  const handleLicenseChange = (val, field) => {
    field.onChange(val);
    if (!isPositive(val)) setValue("otherInfo.ehliyetTurleri", []);
  };

  const getSelectValue = (options, currentVal) =>
    options.find((o) => o.value === currentVal) ||
    (currentVal ? { value: currentVal, label: currentVal } : null);

  const ehliyetMultiValue = ehliyetTurOptions.filter((o) =>
    ehliyetTurleri.includes(o.value)
  );

  return (
    <div className="bg-white p-6 rounded-b-lg border border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KKTC Belge */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {t("otherInfo.labels.kktcDoc")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <Controller
            name="otherInfo.kktcGecerliBelge"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={getSelectValue(belgeOptions, field.value)}
                onChange={(opt) => field.onChange(opt ? opt.value : "")}
                options={belgeOptions}
                placeholder={t("personal.placeholders.select")}
                unstyled
                classNames={rsClassNames}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
              />
            )}
          />
          {errors.otherInfo?.kktcGecerliBelge && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.otherInfo.kktcGecerliBelge.message}
            </p>
          )}
        </div>

        {/* Dava Durumu */}
        <SelectController
          name="otherInfo.davaDurumu"
          label={t("otherInfo.labels.lawsuit")}
          options={[
            { value: "", label: t("personal.placeholders.select") },
            { value: lawsuitOpts.none, label: lawsuitOpts.none },
            { value: lawsuitOpts.have, label: lawsuitOpts.have },
          ]}
          control={control}
          onChangeCustom={handleDavaChange}
          error={errors.otherInfo?.davaDurumu}
        />

        {/* Dava Nedeni */}
        <InputField
          name="otherInfo.davaNedeni"
          label={t("otherInfo.labels.lawsuitReason")}
          placeholder={t("otherInfo.placeholders.lawsuitReason")}
          disabled={!isLawsuitYes}
          register={register}
          error={errors.otherInfo?.davaNedeni}
          max={250}
        />

        {/* Sigara & Askerlik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SelectController
            name="otherInfo.sigara"
            label={t("otherInfo.labels.smoke")}
            options={[
              { value: "", label: t("personal.placeholders.select") },
              { value: yesNo.yes, label: yesNo.yes },
              { value: yesNo.no, label: yesNo.no },
            ]}
            control={control}
            error={errors.otherInfo?.sigara}
          />
          <SelectController
            name="otherInfo.askerlik"
            label={t("otherInfo.labels.military")}
            options={[
              { value: "", label: t("personal.placeholders.select") },
              { value: militaryOpts.done, label: militaryOpts.done },
              { value: militaryOpts.notDone, label: militaryOpts.notDone },
              { value: militaryOpts.postponed, label: militaryOpts.postponed },
              { value: militaryOpts.exempt, label: militaryOpts.exempt },
            ]}
            control={control}
            error={errors.otherInfo?.askerlik}
          />
        </div>

        {/* Kalıcı Rahatsızlık */}
        <SelectController
          name="otherInfo.kaliciRahatsizlik"
          label={t("otherInfo.labels.permanentDisease")}
          options={[
            { value: "", label: t("personal.placeholders.select") },
            { value: yesNo.yes, label: yesNo.yes },
            { value: yesNo.no, label: yesNo.no },
          ]}
          control={control}
          onChangeCustom={handleDiseaseChange}
          error={errors.otherInfo?.kaliciRahatsizlik}
        />

        {/* Rahatsızlık Açıklama */}
        <InputField
          name="otherInfo.rahatsizlikAciklama"
          label={t("otherInfo.labels.diseaseDesc")}
          placeholder={t("otherInfo.placeholders.diseaseDesc")}
          disabled={!isDiseaseYes}
          register={register}
          error={errors.otherInfo?.rahatsizlikAciklama}
          max={250}
        />

        {/* Ehliyet Var mı? */}
        <SelectController
          name="otherInfo.ehliyet"
          label={t("otherInfo.labels.license")}
          options={[
            { value: "", label: t("personal.placeholders.select") },
            { value: licenseOpts.have, label: licenseOpts.have },
            { value: licenseOpts.none, label: licenseOpts.none },
          ]}
          control={control}
          onChangeCustom={handleLicenseChange}
          error={errors.otherInfo?.ehliyet}
        />

        {/* Ehliyet Türleri */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {t("otherInfo.labels.licenseTypes")}{" "}
            {isLicenseYes && <span className="text-red-500">*</span>}
          </label>
          <Controller
            name="otherInfo.ehliyetTurleri"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                closeMenuOnSelect={false}
                options={ehliyetTurOptions}
                // DÜZELTME: Sabit string yerine çeviri fonksiyonu
                placeholder={t("otherInfo.placeholders.licenseTypePlaceholder")}
                value={ehliyetMultiValue}
                onChange={(selected) =>
                  field.onChange(selected ? selected.map((o) => o.value) : [])
                }
                unstyled
                classNames={rsClassNames}
                isDisabled={!isLicenseYes}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
              />
            )}
          />
          {errors.otherInfo?.ehliyetTurleri && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.otherInfo.ehliyetTurleri.message}
            </p>
          )}
        </div>

        {/* Boy & Kilo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            name="otherInfo.boy"
            label={t("otherInfo.labels.height")}
            type="number"
            placeholder={t("otherInfo.placeholders.height")}
            register={register}
            error={errors.otherInfo?.boy}
          />
          <InputField
            name="otherInfo.kilo"
            label={t("otherInfo.labels.weight")}
            type="number"
            placeholder={t("otherInfo.placeholders.weight")}
            register={register}
            error={errors.otherInfo?.kilo}
          />
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

// --- Helper Components ---

// DÜZELTME: 'valueAsNumber' mantığını kaldırdık. Artık her şey string gidiyor, Zod halledecek.
function InputField({
  label,
  name,
  placeholder,
  type = "text",
  disabled = false,
  error,
  max,
  register,
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label}{" "}
        {!disabled &&
          name !== "otherInfo.davaNedeni" &&
          name !== "otherInfo.rahatsizlikAciklama" && (
            <span className="text-red-500">*</span>
          )}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={max}
        {...register(name)}
        className={`block w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-0 ${
          disabled
            ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-white border-gray-300 text-gray-900 hover:border-black focus:border-black"
        }`}
      />
      <div className="flex justify-between mt-1 min-h-[1rem]">
        {error && (
          <p className="text-xs text-red-600 font-medium">{error.message}</p>
        )}
        {max && !disabled && (
          <p className="text-xs text-gray-400">Max: {max}</p>
        )}
      </div>
    </div>
  );
}

// ... (SelectController aynı kalabilir)

function SelectController({
  name,
  label,
  options,
  control,
  error,
  onChangeCustom,
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            onChange={(e) => {
              if (onChangeCustom) onChangeCustom(e.target.value, field);
              else field.onChange(e);
            }}
            className="block w-full min-h-[43px] rounded-lg border px-3 py-2 bg-white text-gray-900 focus:outline-none transition border-gray-300 hover:border-black focus:border-black"
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium">{error.message}</p>
      )}
    </div>
  );
}
