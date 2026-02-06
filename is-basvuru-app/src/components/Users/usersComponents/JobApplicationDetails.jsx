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
  faClapperboard,
} from "@fortawesome/free-solid-svg-icons";

// React-Select Stilleri
const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "43px",
    borderRadius: "0.5rem",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
    border: "1px solid #d1d5db",
    boxShadow: "none",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    "&:hover": { borderColor: "#000000" },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

// --- YARDIMCI FONKSİYON: TEKİLLEŞTİRME ---
// Listeyi "Label" (Görünen İsim) bazında tekil hale getirir.
const getUniqueOptions = (items, labelFn, valueFn) => {
  const uniqueMap = new Map();
  items.forEach((item) => {
    const label = labelFn(item);
    // Eğer label varsa ve haritada yoksa ekle
    if (label && !uniqueMap.has(label)) {
      uniqueMap.set(label, {
        value: String(valueFn(item)), // İlk bulunanın ID'si value olur (Arka planda tüm ID'leri kapsayacağız)
        label: label,
      });
    }
  });
  return Array.from(uniqueMap.values());
};

export default function JobApplicationDetails({ definitions }) {
  const { t } = useTranslation();
  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = useFormContext();

  // --- API Verileri ---
  const apiSubeler = useMemo(() => definitions?.subeler ?? [], [definitions]);
  const apiSubeAlanlar = useMemo(
    () => definitions?.subeAlanlar ?? [],
    [definitions],
  );
  const apiDepartmanlar = useMemo(
    () => definitions?.departmanlar ?? [],
    [definitions],
  );
  const apiPozisyonlar = useMemo(
    () => definitions?.pozisyonlar ?? [],
    [definitions],
  );
  const apiProgramlar = useMemo(
    () => definitions?.programlar ?? [],
    [definitions],
  );
  const apiOyunlar = useMemo(
    () => definitions?.kagitOyunlari ?? [],
    [definitions],
  );

  // --- Form Verileri (Watch) ---
  const rawSubeler = useWatch({ name: "jobDetails.subeler" });
  const subeler = useMemo(() => rawSubeler || [], [rawSubeler]);

  const rawAlanlar = useWatch({ name: "jobDetails.alanlar" });
  const alanlar = useMemo(() => rawAlanlar || [], [rawAlanlar]);

  const rawDepartmanlar = useWatch({ name: "jobDetails.departmanlar" });
  const departmanlar = useMemo(() => rawDepartmanlar || [], [rawDepartmanlar]);

  const rawProgramlar = useWatch({ name: "jobDetails.programlar" });
  const programlar = useMemo(() => rawProgramlar || [], [rawProgramlar]);

  const rawDepartmanPozisyonlari = useWatch({
    name: "jobDetails.departmanPozisyonlari",
  });
  const departmanPozisyonlari = useMemo(
    () => rawDepartmanPozisyonlari || [],
    [rawDepartmanPozisyonlari],
  );

  const rawKagitOyunlari = useWatch({ name: "jobDetails.kagitOyunlari" });
  const kagitOyunlari = useMemo(
    () => rawKagitOyunlari || [],
    [rawKagitOyunlari],
  );

  const lojman = useWatch({ name: "jobDetails.lojman" });
  const rawTercihNedeni = useWatch({ name: "jobDetails.tercihNedeni" });
  const tercihNedeni = useMemo(() => rawTercihNedeni || "", [rawTercihNedeni]);

  // --- FİLTRELEME VE TEKİLLEŞTİRME MANTIĞI ---

  // 1. ŞUBELER (Tekilleştirmeye gerek yok, şubeler zaten benzersizdir)
  const subeOptions = useMemo(
    () => apiSubeler.map((s) => ({ value: String(s.id), label: s.subeAdi })),
    [apiSubeler],
  );

  // 2. ALANLAR (Seçili Şubelere Göre -> İsme Göre Tekilleştir)
  const alanOptions = useMemo(() => {
    if (subeler.length === 0) return [];
    const selectedSubeIds = subeler.map((s) => Number(s.value));

    // Seçili şubelerin alanlarını bul
    const filteredRaw = apiSubeAlanlar.filter((a) =>
      selectedSubeIds.includes(a.subeId),
    );

    // Tekilleştir (Örn: Hem Girne hem Prestige'de "Casino" varsa tek satır yap)
    return getUniqueOptions(
      filteredRaw,
      (item) => item.alanAdi ?? item.subeAlanAdi, // Label (Backend DTO güncellemesine uygun)
      (item) => item.id, // Value
    );
  }, [apiSubeAlanlar, subeler]);

  // 3. DEPARTMANLAR (Seçili Alan İSİMLERİNE Göre -> İsme Göre Tekilleştir)
  const departmanOptions = useMemo(() => {
    if (alanlar.length === 0) return [];

    // 1. Kullanıcının seçtiği Alan İsimlerini al (Örn: ["Casino"])
    const selectedLabels = alanlar.map((a) => a.label);
    const selectedSubeIds = subeler.map((s) => Number(s.value));

    // 2. Seçili şubelerde, ismi bu olan TÜM SubeAlan ID'lerini bul
    // (Örn: Girne Casino ID'si VE Prestige Casino ID'si)
    const validSubeAlanIds = apiSubeAlanlar
      .filter(
        (a) =>
          selectedSubeIds.includes(a.subeId) &&
          selectedLabels.includes(a.alanAdi ?? a.subeAlanAdi),
      )
      .map((a) => a.id);

    // 3. Bu ID'lere bağlı departmanları getir
    const filteredRaw = apiDepartmanlar.filter((d) =>
      validSubeAlanIds.includes(d.subeAlanId),
    );

    // 4. Tekilleştir (Örn: İkisinde de "Canlı Oyun" varsa tek satır yap)
    return getUniqueOptions(
      filteredRaw,
      (item) => item.departmanAdi,
      (item) => item.id,
    );
  }, [apiDepartmanlar, alanlar, subeler, apiSubeAlanlar]);

  // 4. POZİSYONLAR (Seçili Departman İSİMLERİNE Göre -> Tekilleştir)
  const pozisyonOptions = useMemo(() => {
    if (departmanlar.length === 0) return [];

    // Zincirleme Mantık: Şube -> Alan -> Departman ID'lerini bulmamız lazım
    const selectedLabels = departmanlar.map((d) => d.label);
    const selectedAlanLabels = alanlar.map((a) => a.label);
    const selectedSubeIds = subeler.map((s) => Number(s.value));

    // Geçerli ŞubeAlan ID'leri
    const validSubeAlanIds = apiSubeAlanlar
      .filter(
        (a) =>
          selectedSubeIds.includes(a.subeId) &&
          selectedAlanLabels.includes(a.alanAdi ?? a.subeAlanAdi),
      )
      .map((a) => a.id);

    // Geçerli Departman ID'leri (İsmi eşleşenler)
    const validDepartmanIds = apiDepartmanlar
      .filter(
        (d) =>
          validSubeAlanIds.includes(d.subeAlanId) &&
          selectedLabels.includes(d.departmanAdi),
      )
      .map((d) => d.id);

    // Pozisyonları getir
    const filteredRaw = apiPozisyonlar.filter((p) =>
      validDepartmanIds.includes(p.departmanId),
    );

    return getUniqueOptions(
      filteredRaw,
      (item) => item.pozisyonAdi ?? item.departmanPozisyonAdi,
      (item) => item.id,
    );
  }, [
    apiPozisyonlar,
    departmanlar,
    alanlar,
    subeler,
    apiSubeAlanlar,
    apiDepartmanlar,
  ]);

  // 5. PROGRAMLAR (Seçili Departman İSİMLERİNE Göre -> Tekilleştir)
  const programOptions = useMemo(() => {
    if (departmanlar.length === 0) return [];

    const selectedLabels = departmanlar.map((d) => d.label);
    const selectedAlanLabels = alanlar.map((a) => a.label);
    const selectedSubeIds = subeler.map((s) => Number(s.value));

    const validSubeAlanIds = apiSubeAlanlar
      .filter(
        (a) =>
          selectedSubeIds.includes(a.subeId) &&
          selectedAlanLabels.includes(a.alanAdi ?? a.subeAlanAdi),
      )
      .map((a) => a.id);

    const validDepartmanIds = apiDepartmanlar
      .filter(
        (d) =>
          validSubeAlanIds.includes(d.subeAlanId) &&
          selectedLabels.includes(d.departmanAdi),
      )
      .map((d) => d.id);

    const filteredRaw = apiProgramlar.filter((pr) =>
      validDepartmanIds.includes(pr.departmanId),
    );

    return getUniqueOptions(
      filteredRaw,
      (item) => item.programAdi,
      (item) => item.id,
    );
  }, [
    apiProgramlar,
    departmanlar,
    alanlar,
    subeler,
    apiSubeAlanlar,
    apiDepartmanlar,
  ]);

  // 6. KAĞIT OYUNLARI
  const isLiveGameSelected = useMemo(() => {
    return departmanlar.some(
      (d) =>
        d.label.toLowerCase().includes("canlı") ||
        d.label.toLowerCase().includes("live"),
    );
  }, [departmanlar]);

  const oyunOptions = useMemo(() => {
    // API'den gelen tüm oyunları tekilleştir
    return getUniqueOptions(
      apiOyunlar,
      (item) => item.oyunAdi,
      (item) => item.id,
    );
  }, [apiOyunlar]);

  // Lojman (Statik)
  const lojmanOptions = [
    { value: "Evet", label: t("jobDetails.housing.yes") },
    { value: "Hayır", label: t("jobDetails.housing.no") },
  ];

  // --- Handlers (Zincirleme Temizlik) ---

  const handleSubeChange = (val, field) => {
    field.onChange(val);
    setValue("jobDetails.alanlar", []);
    setValue("jobDetails.departmanlar", []);
    setValue("jobDetails.departmanPozisyonlari", []);
    setValue("jobDetails.programlar", []);
  };

  const handleAlanChange = (val, field) => {
    field.onChange(val);
    setValue("jobDetails.departmanlar", []);
    setValue("jobDetails.departmanPozisyonlari", []);
    setValue("jobDetails.programlar", []);
  };

  const handleDepartmanChange = (val, field) => {
    field.onChange(val);
    setValue("jobDetails.departmanPozisyonlari", []);
    setValue("jobDetails.programlar", []);

    const hasLive = (val || []).some((d) =>
      d.label.toLowerCase().includes("canlı"),
    );
    if (!hasLive) setValue("jobDetails.kagitOyunlari", []);
  };

  return (
    <div className="bg-gray-50 rounded-b-lg p-4 sm:p-6 lg:p-8">
      {/* Bilgilendirme */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-md shadow-sm">
        <p className="text-sm sm:text-base leading-relaxed">
          <strong>📋 {t("jobDetails.info.title")}</strong>{" "}
          {t("jobDetails.info.bodyBase")}
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
              placeholder={t("jobDetails.placeholders.selectArea")}
              isDisabled={subeler.length === 0}
              error={errors.jobDetails?.alanlar}
              isMulti
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
              options={departmanOptions}
              {...field}
              onChange={(val) => handleDepartmanChange(val, field)}
              placeholder={t("jobDetails.placeholders.selectDepartment")}
              isDisabled={alanlar.length === 0}
              error={errors.jobDetails?.departmanlar}
              isMulti
            />
          )}
        />

        {/* Pozisyonlar */}
        <Controller
          name="jobDetails.departmanPozisyonlari"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.roles")}
              options={pozisyonOptions}
              {...field}
              placeholder={t("jobDetails.placeholders.selectRoles")}
              isDisabled={departmanlar.length === 0}
              error={errors.jobDetails?.departmanPozisyonlari}
              isMulti
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
              options={programOptions}
              {...field}
              placeholder={t("jobDetails.placeholders.selectProgram")}
              isDisabled={departmanlar.length === 0}
              error={errors.jobDetails?.programlar}
              isMulti
            />
          )}
        />

        {/* Oyunlar */}
        <Controller
          name="jobDetails.kagitOyunlari"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.cardGames")}
              options={oyunOptions}
              {...field}
              placeholder={t("jobDetails.placeholders.selectCardGame")}
              isDisabled={!isLiveGameSelected}
              error={errors.jobDetails?.kagitOyunlari}
              isMulti
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
            render={({ field }) => (
              <SelectField
                label={t("jobDetails.labels.housing")}
                options={lojmanOptions}
                {...field}
                value={lojmanOptions.find((o) => o.value === field.value)}
                onChange={(opt) => field.onChange(opt ? opt.value : "")}
                placeholder={t("jobDetails.placeholders.selectHousing")}
                error={errors.jobDetails?.lojman}
                isMulti={false}
              />
            )}
          />
        </div>

        {/* Tercih Nedeni */}
        <div className="lg:col-span-10">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("jobDetails.labels.whyUs")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            maxLength={500}
            placeholder={t("jobDetails.placeholders.whyUs")}
            {...register("jobDetails.tercihNedeni")}
            className={`w-full rounded-lg px-4 py-2 border ${
              errors.jobDetails?.tercihNedeni
                ? "border-red-500"
                : "border-gray-300"
            } focus:outline-none focus:border-black resize-none`}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-red-600">
              {errors.jobDetails?.tercihNedeni?.message}
            </span>
            <span className="text-gray-400">{tercihNedeni.length}/500</span>
          </div>
        </div>
      </div>

      {/* Önizleme */}
      <PreviewSection
        t={t}
        data={{
          subeler,
          alanlar,
          departmanlar,
          departmanPozisyonlari,
          programlar,
          kagitOyunlari,
          lojman,
        }}
      />
    </div>
  );
}

// --- Yardımcı Bileşenler ---

function SelectField({ label, error, ...props }) {
  let errorMessage = null;
  if (error) {
    if (typeof error === "string") {
      errorMessage = error;
    } else if (typeof error === "object" && error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = "Geçersiz seçim.";
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm sm:text-[15px] font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <Select
        styles={customStyles}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        menuPosition="fixed"
        {...props}
      />
      {errorMessage && (
        <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
}

function PreviewSection({ t, data }) {
  const items = [
    {
      icon: faBuilding,
      label: t("jobDetails.preview.branches"),
      val: data.subeler,
    },
    {
      icon: faLayerGroup,
      label: t("jobDetails.preview.areas"),
      val: data.alanlar,
    },
    {
      icon: faBriefcase,
      label: t("jobDetails.preview.departments"),
      val: data.departmanlar,
    },
    {
      icon: faBriefcase,
      label: t("jobDetails.preview.roles"),
      val: data.departmanPozisyonlari,
    },
    {
      icon: faComputer,
      label: t("jobDetails.preview.programs"),
      val: data.programlar,
    },
    {
      icon: faClapperboard,
      label: t("jobDetails.preview.cardGames"),
      val: data.kagitOyunlari,
    },
  ];

  return (
    <div className="mt-10 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon={faEye} className="text-red-600" />
        {t("jobDetails.preview.title")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 p-2 hover:bg-gray-50 rounded-md">
            <FontAwesomeIcon icon={item.icon} className="text-gray-400 mt-1" />
            <div>
              <strong>{item.label}:</strong>
              <div className="text-gray-900">
                {Array.isArray(item.val) && item.val.length > 0
                  ? item.val.map((v) => v.label).join(", ")
                  : "—"}
              </div>
            </div>
          </div>
        ))}
        <div className="flex gap-2 p-2 hover:bg-gray-50 rounded-md">
          <FontAwesomeIcon icon={faHouseUser} className="text-gray-400 mt-1" />
          <div>
            <strong>{t("jobDetails.preview.housing")}:</strong>
            <div className="text-gray-900">{data.lojman || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
