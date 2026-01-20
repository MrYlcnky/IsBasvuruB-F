import { useMemo } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faBuilding,
  faLayerGroup,
  faBriefcase,
  faComputer,
  faHouseUser,
  faCircleInfo,
  faClapperboard,
} from "@fortawesome/free-solid-svg-icons";

// --- Sabit Veriler (Bileşen dışına alındı) ---
// Bu veriler ileride veritabanından (API) gelebilir.
const departmentPrograms = {
  "Casino F&B": ["Asist"],
  "Casino Kasa": ["drCage"],
  "Casino Slot": ["Asist", "drReports"],
  "Casino Canlı Oyun": [],
  "Otel Resepsiyon": ["Opera PMS"],
  "Otel Housekeeping": ["HotelLogix"],
};

// React-Select stilleri
const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
    border: "1px solid #d1d5db",
    boxShadow: "none",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    "&:hover": { borderColor: "#000000" },
    opacity: state.isDisabled ? 0.8 : 1,
  }),
  dropdownIndicator: (base) => ({ ...base, cursor: "pointer" }),
  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#e0f2fe"
      : state.isFocused
      ? "#f0f9ff"
      : "white",
    color: "#111827",
  }),
};

export default function JobApplicationDetails() {
  const { t } = useTranslation();
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  // --- Anlık Veri Takibi (Watch) ---
  // Formdaki seçimleri dinliyoruz
  const subeler = useWatch({ name: "jobDetails.subeler" }) || [];
  const alanlar = useWatch({ name: "jobDetails.alanlar" }) || [];
  const departmanlar = useWatch({ name: "jobDetails.departmanlar" }) || [];
  const programlar = useWatch({ name: "jobDetails.programlar" }) || [];
  const departmanPozisyonlari =
    useWatch({ name: "jobDetails.departmanPozisyonlari" }) || [];
  const kagitOyunlari = useWatch({ name: "jobDetails.kagitOyunlari" }) || [];
  const lojman = useWatch({ name: "jobDetails.lojman" });
  const tercihNedeni = useWatch({ name: "jobDetails.tercihNedeni" }) || "";

  // --- Seçenek Tanımları (Memoized) ---

  const subeOptions = useMemo(
    () => [
      { value: "Prestige", label: "Prestige" },
      { value: "Girne", label: "Girne" },
    ],
    []
  );

  const alanOptions = useMemo(
    () => [
      { value: "Otel", label: t("jobDetails.areas.hotel") },
      { value: "Casino", label: t("jobDetails.areas.casino") },
    ],
    [t]
  );

  const lojmanOptions = useMemo(
    () => [
      { value: "Evet", label: t("jobDetails.housing.yes") },
      { value: "Hayır", label: t("jobDetails.housing.no") },
    ],
    [t]
  );

  const otelDepartments = useMemo(
    () => [
      {
        value: "Otel Resepsiyon",
        label: t("jobDetails.departments.hotelReception"),
      },
      {
        value: "Otel Housekeeping",
        label: t("jobDetails.departments.hotelHousekeeping"),
      },
    ],
    [t]
  );

  const casinoDepartments = useMemo(
    () => [
      { value: "Casino F&B", label: t("jobDetails.departments.casinoFB") },
      {
        value: "Casino Kasa",
        label: t("jobDetails.departments.casinoCashier"),
      },
      { value: "Casino Slot", label: t("jobDetails.departments.casinoSlot") },
      {
        value: "Casino Canlı Oyun",
        label: t("jobDetails.departments.casinoLiveGame"),
      },
    ],
    [t]
  );

  // Roller (MainSchema'da da kullanıldı, burada UI için tekrar tanımlıyoruz)
  const departmentRoles = useMemo(
    () => ({
      "Casino F&B": [
        t("jobDetails.roles.waiter"),
        t("jobDetails.roles.bartender"),
        t("jobDetails.roles.barback"),
        t("jobDetails.roles.commis"),
        t("jobDetails.roles.supervisor"),
      ],
      "Casino Kasa": [
        t("jobDetails.roles.cashier"),
        t("jobDetails.roles.cageSupervisor"),
      ],
      "Casino Slot": [
        t("jobDetails.roles.slotAttendant"),
        t("jobDetails.roles.slotTechnician"),
        t("jobDetails.roles.host"),
      ],
      "Casino Canlı Oyun": [
        t("jobDetails.roles.dealer"),
        t("jobDetails.roles.inspector"),
        t("jobDetails.roles.pitboss"),
      ],
      "Otel Resepsiyon": [
        t("jobDetails.roles.receptionist"),
        t("jobDetails.roles.guestRelations"),
        t("jobDetails.roles.nightAuditor"),
      ],
      "Otel Housekeeping": [
        t("jobDetails.roles.roomAttendant"),
        t("jobDetails.roles.floorSupervisor"),
        t("jobDetails.roles.laundry"),
      ],
    }),
    [t]
  );

  const kagitOyunlariList = useMemo(
    () => [
      { value: "Poker", label: t("jobDetails.cards.poker") },
      { value: "Blackjack", label: t("jobDetails.cards.blackjack") },
      { value: "Baccarat", label: t("jobDetails.cards.baccarat") },
      { value: "Roulette", label: t("jobDetails.cards.roulette") },
      { value: "Texas Hold’em", label: t("jobDetails.cards.texasHoldem") },
    ],
    [t]
  );

  // --- Filtreleme Mantığı ---

  // Seçilen Alanlara göre Departman Listesi
  const availableDepartments = useMemo(() => {
    let list = [];
    if (alanlar.some((a) => a.value === "Otel")) list.push(...otelDepartments);
    if (alanlar.some((a) => a.value === "Casino"))
      list.push(...casinoDepartments);
    return list;
  }, [alanlar, otelDepartments, casinoDepartments]);

  // Seçilen Departmanlara göre Program Listesi
  const availablePrograms = useMemo(() => {
    const set = new Set();
    departmanlar.forEach((d) => {
      (departmentPrograms[d.value] || []).forEach((p) => set.add(p));
    });
    return Array.from(set).map((p) => ({ value: p, label: p }));
  }, [departmanlar]);

  // Seçilen Departmanlara göre Roller (Pozisyonlar)
  const availableRoles = useMemo(() => {
    const groups = [];
    departmanlar.forEach((d) => {
      const roleLabels = departmentRoles[d.value] || [];
      const roles = roleLabels.map((r) => ({
        value: `${d.value}::${r}`,
        label: r,
        dept: d.value,
      }));
      if (roles.length) {
        const deptLabel =
          [...otelDepartments, ...casinoDepartments].find(
            (x) => x.value === d.value
          )?.label || d.value;
        groups.push({ label: deptLabel, options: roles });
      }
    });
    return groups;
  }, [departmanlar, departmentRoles, otelDepartments, casinoDepartments]);

  // Durum Kontrolleri
  const hasSubeSelected = subeler.length > 0;
  const needsRoles = availableRoles.length > 0;
  const canliOyunSelected = departmanlar.some(
    (d) => d.value === "Casino Canlı Oyun"
  );

  // --- Handlers (Resetleme Mantığı) ---
  // React-Select onChange ile tetiklenir, alt alanları sıfırlarız.

  const handleSubeChange = (val, field) => {
    field.onChange(val);
    // Şube değişince alt tarafta sıfırlama yapmaya gerek var mı?
    // Genelde şube değişse de alan/departman kalabilir,
    // ama şube silinirse alan seçimi geçersiz olabilir.
    // Şimdilik kullanıcı deneyimini bozmamak için sıfırlamıyoruz.
  };

  const handleAlanChange = (val, field) => {
    field.onChange(val);
    // Alan değişince, seçili departmanların hala geçerli olup olmadığını kontrol et
    // Basitlik adına departmanları, rolleri vb. sıfırlayabiliriz.
    setValue("jobDetails.departmanlar", []);
    setValue("jobDetails.departmanPozisyonlari", []);
    setValue("jobDetails.programlar", []);
    setValue("jobDetails.kagitOyunlari", []);
  };

  const handleDepartmanChange = (val, field) => {
    field.onChange(val);
    // Departman değişince, seçili rolleri ve programları temizle
    setValue("jobDetails.departmanPozisyonlari", []);
    setValue("jobDetails.programlar", []);
    // Eğer canlı oyun seçimi kalktıysa kağıt oyunlarını temizle
    const hasLive = (val || []).some((d) => d.value === "Casino Canlı Oyun");
    if (!hasLive) {
      setValue("jobDetails.kagitOyunlari", []);
    }
  };

  return (
    <div className="bg-gray-50 rounded-b-lg p-4 sm:p-6 lg:p-8">
      {/* Bilgilendirme Kutusu */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-md shadow-sm">
        <p className="text-sm sm:text-base leading-relaxed">
          <strong>📋 {t("jobDetails.info.title")}</strong>{" "}
          {t("jobDetails.info.bodyBase")}{" "}
          <span className="font-semibold text-red-500">
            {t("jobDetails.info.requiredNote")}
          </span>{" "}
          {t("jobDetails.info.liveGameNote")}{" "}
          {availableRoles.length > 0 && (
            <span className="ml-1">{t("jobDetails.info.rolesNote")}</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Şubeler */}
        <Controller
          name="jobDetails.subeler"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.branches")}
              options={subeOptions}
              {...field}
              onChange={(val) => handleSubeChange(val, field)}
              placeholder={t("jobDetails.placeholders.selectBranch")}
              error={errors.jobDetails?.subeler}
              isMulti
              styles={customStyles}
            />
          )}
        />

        {/* Alanlar */}
        <Controller
          name="jobDetails.alanlar"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.areas")}
              options={alanOptions}
              {...field}
              onChange={(val) => handleAlanChange(val, field)}
              placeholder={
                hasSubeSelected
                  ? t("jobDetails.placeholders.selectArea")
                  : t("jobDetails.placeholders.selectBranchFirst")
              }
              isDisabled={!hasSubeSelected}
              error={errors.jobDetails?.alanlar}
              isMulti
              styles={customStyles}
            />
          )}
        />

        {/* Departmanlar */}
        <Controller
          name="jobDetails.departmanlar"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.departments")}
              options={availableDepartments}
              {...field}
              onChange={(val) => handleDepartmanChange(val, field)}
              placeholder={
                availableDepartments.length === 0
                  ? t("jobDetails.placeholders.selectAreaFirst")
                  : t("jobDetails.placeholders.selectDepartment")
              }
              isDisabled={availableDepartments.length === 0}
              error={errors.jobDetails?.departmanlar}
              isMulti
              styles={customStyles}
            />
          )}
        />

        {/* Roller / Pozisyonlar */}
        <Controller
          name="jobDetails.departmanPozisyonlari"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.roles")}
              options={availableRoles}
              {...field}
              placeholder={
                needsRoles
                  ? t("jobDetails.placeholders.selectRoles")
                  : t("jobDetails.placeholders.selectDeptForRoles")
              }
              isDisabled={!needsRoles}
              error={errors.jobDetails?.departmanPozisyonlari}
              isMulti
              styles={customStyles}
            />
          )}
        />

        {/* Programlar */}
        <Controller
          name="jobDetails.programlar"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.programs")}
              options={availablePrograms}
              {...field}
              placeholder={
                availablePrograms.length === 0
                  ? t("jobDetails.placeholders.selectDeptFirst")
                  : t("jobDetails.placeholders.selectProgram")
              }
              isDisabled={availablePrograms.length === 0}
              error={errors.jobDetails?.programlar}
              isMulti
              styles={customStyles}
            />
          )}
        />

        {/* Kağıt Oyunları */}
        <Controller
          name="jobDetails.kagitOyunlari"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.cardGames")}
              options={kagitOyunlariList}
              {...field}
              placeholder={
                canliOyunSelected
                  ? t("jobDetails.placeholders.selectCardGame")
                  : t("jobDetails.placeholders.cardGameOnlyForLive")
              }
              isDisabled={!canliOyunSelected}
              error={errors.jobDetails?.kagitOyunlari}
              isMulti
              styles={customStyles}
            />
          )}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
        {/* Lojman */}
        <div className="lg:col-span-2">
          <Controller
            name="jobDetails.lojman"
            control={control}
            render={({ field }) => {
              // Lojman tekli seçim olduğu için value object değil string geliyor olabilir
              // React-select object bekler {value, label}
              const valObj =
                lojmanOptions.find((o) => o.value === field.value) || null;
              return (
                <SelectField
                  label={t("jobDetails.labels.housing")}
                  options={lojmanOptions}
                  {...field} // onChange, onBlur vb.
                  value={valObj} // Value'yu override et
                  onChange={(opt) => field.onChange(opt ? opt.value : "")} // String kaydet
                  placeholder={t("jobDetails.placeholders.selectHousing")}
                  error={errors.jobDetails?.lojman}
                  styles={customStyles}
                  isMulti={false}
                />
              );
            }}
          />
        </div>

        {/* Tercih Nedeni */}
        <div className="lg:col-span-10 flex flex-col">
          <label
            htmlFor="tercihNedeni"
            className="block text-sm sm:text-[15px] font-semibold text-gray-700 mb-1"
          >
            {t("jobDetails.labels.whyUs")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="tercihNedeni"
            rows={2}
            maxLength={500}
            placeholder={t("jobDetails.placeholders.whyUs")}
            {...register("jobDetails.tercihNedeni")}
            className={`w-full rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none resize-none shadow-none border ${
              errors.jobDetails?.tercihNedeni
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-black"
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.jobDetails?.tercihNedeni ? (
              <p className="text-xs text-red-600 font-medium">
                {errors.jobDetails.tercihNedeni.message}
              </p>
            ) : (
              <span />
            )}
            <p
              className={`text-xs ${
                tercihNedeni.length >= 480 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {tercihNedeni.length}/500
            </p>
          </div>
        </div>
      </div>

      {/* Önizleme Bölümü */}
      <div className="mt-10 bg-white rounded-lg border border-gray-200 shadow-sm p-5 sm:p-6 md:p-8 transition-all">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faEye} className="text-red-600 text-lg" />
          {t("jobDetails.preview.title")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-sm sm:text-[15px] text-gray-700">
          {[
            {
              icon: faBuilding,
              label: t("jobDetails.preview.branches"),
              value: subeler.map((s) => s.label).join(", "),
            },
            {
              icon: faLayerGroup,
              label: t("jobDetails.preview.areas"),
              value: alanlar.map((a) => a.label).join(", "),
            },
            {
              icon: faBriefcase,
              label: t("jobDetails.preview.departments"),
              value: departmanlar.map((d) => d.label).join(", "),
            },
            {
              icon: faBriefcase,
              label: t("jobDetails.preview.roles"),
              value: departmanPozisyonlari.map((p) => p.label).join(", "),
            },
            {
              icon: faComputer,
              label: t("jobDetails.preview.programs"),
              value: programlar.map((p) => p.label).join(", "),
            },
            {
              icon: faClapperboard,
              label: t("jobDetails.preview.cardGames"),
              value: kagitOyunlari.map((k) => k.label).join(", "),
            },
            {
              icon: faHouseUser,
              label: t("jobDetails.preview.housing"),
              value: lojman || "—",
            },
          ].map(({ icon, label, value }, i) => (
            <p
              key={i}
              className="flex items-start gap-2 p-1 sm:p-2 rounded-md hover:bg-gray-50 transition"
            >
              <FontAwesomeIcon
                icon={icon}
                className="mt-0.5 text-gray-400 text-sm sm:text-base"
              />
              <strong className="shrink-0">{label}:</strong>
              <ClampText text={value || "—"} lines={2} />
            </p>
          ))}
        </div>
        <div className="mt-4 text-xs sm:text-sm text-gray-400 italic text-right">
          <FontAwesomeIcon icon={faCircleInfo} className="mr-1 text-gray-400" />
          {t("jobDetails.preview.liveUpdate")}
        </div>
      </div>
    </div>
  );
}

// --- Yardımcı Bileşenler ---

function ClampText({ text, lines = 2 }) {
  return (
    <span
      title={text}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "normal",
        lineHeight: "1.25rem",
      }}
      className="text-gray-800"
    >
      {text}
    </span>
  );
}

// Hata mesajını içinde gösteren Select Wrapper
function SelectField({ label, error, ...props }) {
  return (
    <div className="w-full">
      <label className="block text-sm sm:text-[15px] font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <Select {...props} />
      {error && (
        <p className="text-red-600 text-xs mt-1">{error.message || error}</p>
      )}
    </div>
  );
}
