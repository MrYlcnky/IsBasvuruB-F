import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import MuiDateStringField from "../Date/MuiDateStringField";
import SearchSelect from "../Selected/SearchSelect";

// --- Sabit Veriler ---
const TR_IL_ILCE = {
  İstanbul: [
    "Kadıköy",
    "Üsküdar",
    "Beşiktaş",
    "Bakırköy",
    "Sarıyer",
    "Kartal",
    "Maltepe",
    "Pendik",
    "Tuzla",
    "Beykoz",
    "Şile",
    "Çekmeköy",
    "Sancaktepe",
    "Sultanbeyli",
    "Ümraniye",
    "Ataşehir",
    "Adalar",
    "Arnavutköy",
    "Avcılar",
    "Bağcılar",
    "Bahçelievler",
    "Başakşehir",
    "Bayrampaşa",
    "Beylikdüzü",
    "Beyoğlu",
    "Büyükçekmece",
    "Çatalca",
    "Esenler",
    "Esenyurt",
    "Eyüpsultan",
    "Fatih",
    "Gaziosmanpaşa",
    "Güngören",
    "Kağıthane",
    "Küçükçekmece",
    "Silivri",
    "Sultangazi",
    "Şişli",
    "Zeytinburnu",
  ],
  Ankara: [
    "Çankaya",
    "Keçiören",
    "Yenimahalle",
    "Mamak",
    "Sincan",
    "Etimesgut",
    "Altındağ",
    "Pursaklar",
    "Gölbaşı",
    "Polatlı",
    "Çubuk",
    "Kahramankazan",
    "Beypazarı",
    "Elmadağ",
    "Şereflikoçhisar",
    "Akyurt",
    "Nallıhan",
    "Haymana",
    "Kızılcahamam",
    "Bala",
    "Kalecik",
    "Ayaş",
    "Güdül",
    "Çamlıdere",
    "Evren",
  ],
  İzmir: [
    "Konak",
    "Karşıyaka",
    "Bornova",
    "Buca",
    "Bayraklı",
    "Çiğli",
    "Gaziemir",
    "Balçova",
    "Narlıdere",
    "Güzelbahçe",
    "Urla",
    "Çeşme",
    "Seferihisar",
    "Menderes",
    "Torbalı",
    "Kemalpaşa",
    "Menemen",
    "Aliağa",
    "Foça",
    "Dikili",
    "Bergama",
    "Kınık",
    "Ödemiş",
    "Tire",
    "Bayındır",
    "Kiraz",
    "Beydağ",
  ],
  Çorum: [
    "Merkez",
    "Sungurlu",
    "Osmancık",
    "İskilip",
    "Uğurludağ",
    "Alaca",
    "Bayat",
    "Boğazkale",
    "Dodurga",
    "Kargı",
    "Laçin",
    "Mecitözü",
    "Oğuzlar",
    "Ortaköy",
  ],
  Kayseri: [
    "Kocasinan",
    "Melikgazi",
    "Talas",
    "Develi",
    "İncesu",
    "Bünyan",
    "Pınarbaşı",
    "Tomarza",
    "Yahyalı",
    "Yeşilhisar",
    "Akkışla",
    "Felahiye",
    "Hacılar",
    "Özvatan",
    "Sarız",
  ],
  Antalya: [
    "Muratpaşa",
    "Kepez",
    "Konyaaltı",
    "Alanya",
    "Manavgat",
    "Serik",
    "Aksu",
    "Döşemealtı",
    "Kemer",
    "Korkuteli",
    "Kumluca",
    "Finike",
    "Kaş",
    "Demre",
    "Elmalı",
    "Akseki",
    "Gündoğmuş",
    "İbradı",
  ],
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

const NATIONALITY_MAP = {
  Türkiye: "Türk",
  Türkmenistan: "Türkmen",
  Pakistan: "Pakistanlı",
  Azerbaycan: "Azerbaycanlı",
  Kazakistan: "Kazak",
  Kırgızistan: "Kırgız",
  Özbekistan: "Özbek",
  "Kuzey Kıbrıs (KKTC)": "Kıbrıslı Türk",
  Bangladeş: "Bangladeşli",
  Rusya: "Rus",
  Diğer: "Diğer",
};

const onlyLettersTR = (s) => s.replace(/[^a-zA-ZığüşöçİĞÜŞÖÇ\s]/g, "");

// --- ANA BİLEŞEN ---
export default function PersonalInformation() {
  const { t } = useTranslation();
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  // --- Anlık İzleme (Watch) ---
  // İl ve İlçe seçimi için gerekli verileri dinliyoruz
  const birthCountry = useWatch({ name: "personal.dogumUlke" });
  const birthCity = useWatch({ name: "personal.dogumSehir" }); // Türkiye ise 'İl'
  const birthDistrict = useWatch({ name: "personal.dogumIlce" }); // Türkiye ise 'İlçe'

  const resCountry = useWatch({ name: "personal.ikametUlke" });
  const resCity = useWatch({ name: "personal.ikametSehir" });
  const resDistrict = useWatch({ name: "personal.ikametIlce" });

  const nationality = useWatch({ name: "personal.uyruk" });
  const foto = useWatch({ name: "personal.foto" });

  // --- Seçenekler (Memoized) ---
  const genderOptions = useMemo(
    () => [
      { value: "", label: t("personal.placeholders.select") },
      {
        value: t("personal.options.gender.female"),
        label: t("personal.options.gender.female"),
      },
      {
        value: t("personal.options.gender.male"),
        label: t("personal.options.gender.male"),
      },
    ],
    [t]
  );

  const maritalOptions = useMemo(
    () => [
      { value: "", label: t("personal.placeholders.select") },
      {
        value: t("personal.options.marital.single"),
        label: t("personal.options.marital.single"),
      },
      {
        value: t("personal.options.marital.married"),
        label: t("personal.options.marital.married"),
      },
      {
        value: t("personal.options.marital.divorced"),
        label: t("personal.options.marital.divorced"),
      },
      {
        value: t("personal.options.marital.widowed"),
        label: t("personal.options.marital.widowed"),
      },
    ],
    [t]
  );

  const childOptions = useMemo(() => {
    const base = [{ value: "", label: t("personal.placeholders.select") }];
    for (let i = 0; i <= 6; i++)
      base.push({ value: String(i), label: String(i) });
    base.push({ value: "7+", label: t("personal.options.childrenMore") });
    return base;
  }, [t]);

  const countryOptionsList = useMemo(
    () =>
      [{ value: "", label: t("personal.placeholders.select") }].concat(
        COUNTRY_OPTIONS.map((c) => ({ value: c, label: c }))
      ),
    [t]
  );

  // Sadece İl Listesi (Türkiye için)
  const ilOptions = useMemo(
    () =>
      [{ value: "", label: t("personal.labels.selectProvince") }].concat(
        Object.keys(TR_IL_ILCE).map((il) => ({ value: il, label: il }))
      ),
    [t]
  );

  // --- İlçe Seçenekleri (Dinamik) ---
  const getIlceOptions = (selectedCity) => {
    if (!selectedCity || !TR_IL_ILCE[selectedCity]) return [];
    return [{ value: "", label: t("personal.labels.selectDistrict") }].concat(
      TR_IL_ILCE[selectedCity].map((ilce) => ({ value: ilce, label: ilce }))
    );
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024)
      return;
    const reader = new FileReader();
    reader.onloadend = () => setValue("personal.foto", reader.result);
    reader.readAsDataURL(file);
  };

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <div className="bg-gray-50 rounded-b-lg p-4 sm:p-6 lg:p-8 shadow-none overscroll-contain">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* --- Fotoğraf --- */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-4 border-gray-300 bg-gray-100 shadow-md flex items-center justify-center">
            {foto ? (
              <img
                src={foto}
                alt="Profil"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-400 text-sm text-center px-2">
                {t("personal.placeholders.noPhoto")}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="foto"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              {t("personal.labels.photo")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="foto"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 transition"
              >
                📤{" "}
                {foto
                  ? t("personal.placeholders.replace")
                  : t("personal.placeholders.upload")}
              </label>
              <input
                type="file"
                id="foto"
                accept="image/*"
                onChange={handleFotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* --- Temel Bilgiler --- */}
        <InputField
          name="personal.ad"
          label={t("personal.labels.firstName")}
          placeholder={t("personal.placeholders.firstName")}
          max={30}
          register={register}
          error={errors.personal?.ad}
        />
        <InputField
          name="personal.soyad"
          label={t("personal.labels.lastName")}
          placeholder={t("personal.placeholders.lastName")}
          max={30}
          register={register}
          error={errors.personal?.soyad}
        />
        <InputField
          name="personal.eposta"
          label={t("personal.labels.email")}
          placeholder={t("personal.placeholders.email")}
          register={register}
          error={errors.personal?.eposta}
        />
        <InputField
          name="personal.telefon"
          label={t("personal.labels.phone")}
          placeholder={t("personal.placeholders.phone")}
          register={register}
          error={errors.personal?.telefon}
        />
        <InputField
          name="personal.whatsapp"
          label={t("personal.labels.whatsapp")}
          placeholder={t("personal.placeholders.whatsapp")}
          register={register}
          error={errors.personal?.whatsapp}
        />
        <InputField
          name="personal.adres"
          label={t("personal.labels.address")}
          placeholder={t("personal.placeholders.address")}
          max={90}
          register={register}
          error={errors.personal?.adres}
        />

        {/* --- Tarih --- */}
        <div className="shadow-none outline-none">
          <Controller
            name="personal.dogumTarihi"
            control={control}
            render={({ field }) => (
              <MuiDateStringField
                label={t("personal.labels.birthDate")}
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.personal?.dogumTarihi?.message}
                min="1950-01-01"
                max="2025-12-31"
                size="small"
              />
            )}
          />
        </div>

        <SelectController
          name="personal.cinsiyet"
          label={t("personal.labels.gender")}
          options={genderOptions}
          control={control}
          placeholder={t("personal.placeholders.select")}
          error={errors.personal?.cinsiyet}
        />
        <SelectController
          name="personal.medeniDurum"
          label={t("personal.labels.marital")}
          options={maritalOptions}
          control={control}
          placeholder={t("personal.placeholders.select")}
          error={errors.personal?.medeniDurum}
        />
        <SelectController
          name="personal.cocukSayisi"
          label={t("personal.labels.children")}
          options={childOptions}
          control={control}
          placeholder={t("personal.placeholders.select")}
          error={errors.personal?.cocukSayisi}
        />

        {/* --- Uyruk --- */}
        <div className="lg:col-span-1 mt-1">
          <label className="block text-sm font-bold text-gray-700">
            {t("personal.labels.nationality")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              name="personal.uyruk"
              control={control}
              render={({ field }) => (
                <SearchSelect
                  name={field.name}
                  value={
                    Object.values(NATIONALITY_MAP).includes(field.value)
                      ? field.value
                      : field.value
                      ? "Diğer"
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Diğer") field.onChange("");
                    else field.onChange(val);
                  }}
                  options={[
                    { value: "", label: t("personal.placeholders.select") },
                    ...Object.values(NATIONALITY_MAP).map((n) => ({
                      value: n,
                      label: n,
                    })),
                    { value: "Diğer", label: "Diğer" },
                  ]}
                  placeholder={t("personal.placeholders.select")}
                  menuPortalTarget={portalTarget}
                />
              )}
            />
            <input
              type="text"
              placeholder={t("personal.placeholders.countryOther")}
              className={`block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none transition ${
                !Object.values(NATIONALITY_MAP).includes(nationality)
                  ? "bg-white border-gray-300"
                  : "bg-gray-200 border-gray-300 cursor-not-allowed"
              }`}
              disabled={
                Object.values(NATIONALITY_MAP).includes(nationality) &&
                nationality !== ""
              }
              value={
                !Object.values(NATIONALITY_MAP).includes(nationality)
                  ? nationality
                  : ""
              }
              onChange={(e) =>
                setValue("personal.uyruk", onlyLettersTR(e.target.value))
              }
            />
          </div>
          {errors.personal?.uyruk && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.personal.uyruk.message}
            </p>
          )}
        </div>

        {/* --- Doğum Yeri (Ülke / İl / İlçe) --- */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {t("personal.labels.birthCountry")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              name="personal.dogumUlke"
              control={control}
              render={({ field }) => (
                <SearchSelect
                  value={
                    COUNTRY_OPTIONS.includes(field.value)
                      ? field.value
                      : field.value
                      ? "Diğer"
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Diğer") field.onChange("");
                    else {
                      field.onChange(val);
                      // Ülke değişince alt alanları temizle
                      setValue("personal.dogumSehir", "");
                      setValue("personal.dogumIlce", "");
                    }
                  }}
                  options={countryOptionsList}
                  placeholder={t("personal.placeholders.countrySearch")}
                  menuPortalTarget={portalTarget}
                />
              )}
            />
            <input
              type="text"
              placeholder={t("personal.placeholders.countryOther")}
              className={`block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none transition ${
                !COUNTRY_OPTIONS.includes(birthCountry)
                  ? "bg-white border-gray-300"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
              disabled={
                COUNTRY_OPTIONS.includes(birthCountry) && birthCountry !== ""
              }
              value={
                !COUNTRY_OPTIONS.includes(birthCountry) ? birthCountry : ""
              }
              onChange={(e) =>
                setValue("personal.dogumUlke", onlyLettersTR(e.target.value))
              }
            />
          </div>
          {errors.personal?.dogumUlke && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.personal.dogumUlke.message}
            </p>
          )}
        </div>

        {/* Doğum Şehir ve İlçe */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {t("personal.labels.birthCity")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* İl Seçimi */}
            {birthCountry === "Türkiye" ? (
              <Controller
                name="personal.dogumSehir"
                control={control}
                render={({ field }) => (
                  <SearchSelect
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue("personal.dogumIlce", ""); // İl değişince ilçeyi sıfırla
                    }}
                    options={ilOptions}
                    placeholder={t("personal.labels.selectProvince")}
                    menuPortalTarget={portalTarget}
                  />
                )}
              />
            ) : (
              <input
                type="text"
                placeholder={t("personal.placeholders.cityState")}
                className="block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none bg-white border-gray-300 hover:border-black"
                value={birthCity || ""}
                onChange={(e) =>
                  setValue("personal.dogumSehir", onlyLettersTR(e.target.value))
                }
              />
            )}

            {/* İlçe Seçimi (Sadece Türkiye ise) */}
            {birthCountry === "Türkiye" ? (
              <Controller
                name="personal.dogumIlce"
                control={control}
                render={({ field }) => (
                  <SearchSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={getIlceOptions(birthCity)}
                    placeholder={t("personal.labels.selectDistrict")}
                    isDisabled={!birthCity} // İl seçilmeden ilçe seçilemez
                    menuPortalTarget={portalTarget}
                  />
                )}
              />
            ) : (
              <input
                type="text"
                placeholder={t("personal.placeholders.districtRegion")}
                className="block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none bg-white border-gray-300 hover:border-black"
                value={birthDistrict || ""}
                onChange={(e) =>
                  setValue("personal.dogumIlce", onlyLettersTR(e.target.value))
                }
              />
            )}
          </div>
          {(errors.personal?.dogumSehir || errors.personal?.dogumIlce) && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.personal?.dogumSehir?.message ||
                errors.personal?.dogumIlce?.message}
            </p>
          )}
        </div>

        {/* --- İkamet Yeri (Ülke / İl / İlçe) --- */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {t("personal.labels.resCountry")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              name="personal.ikametUlke"
              control={control}
              render={({ field }) => (
                <SearchSelect
                  value={
                    COUNTRY_OPTIONS.includes(field.value)
                      ? field.value
                      : field.value
                      ? "Diğer"
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Diğer") field.onChange("");
                    else {
                      field.onChange(val);
                      setValue("personal.ikametSehir", "");
                      setValue("personal.ikametIlce", "");
                    }
                  }}
                  options={countryOptionsList}
                  placeholder={t("personal.placeholders.countrySearch")}
                  menuPortalTarget={portalTarget}
                />
              )}
            />
            <input
              type="text"
              placeholder={t("personal.placeholders.countryOther")}
              className={`block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none transition ${
                !COUNTRY_OPTIONS.includes(resCountry)
                  ? "bg-white border-gray-300"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
              disabled={
                COUNTRY_OPTIONS.includes(resCountry) && resCountry !== ""
              }
              value={!COUNTRY_OPTIONS.includes(resCountry) ? resCountry : ""}
              onChange={(e) =>
                setValue("personal.ikametUlke", onlyLettersTR(e.target.value))
              }
            />
          </div>
          {errors.personal?.ikametUlke && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.personal.ikametUlke.message}
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {t("personal.labels.resCity")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resCountry === "Türkiye" ? (
              <Controller
                name="personal.ikametSehir"
                control={control}
                render={({ field }) => (
                  <SearchSelect
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue("personal.ikametIlce", "");
                    }}
                    options={ilOptions}
                    placeholder={t("personal.labels.selectProvince")}
                    menuPortalTarget={portalTarget}
                  />
                )}
              />
            ) : (
              <input
                type="text"
                placeholder={t("personal.placeholders.cityState")}
                className="block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none bg-white border-gray-300 hover:border-black"
                value={resCity || ""}
                onChange={(e) =>
                  setValue(
                    "personal.ikametSehir",
                    onlyLettersTR(e.target.value)
                  )
                }
              />
            )}

            {resCountry === "Türkiye" ? (
              <Controller
                name="personal.ikametIlce"
                control={control}
                render={({ field }) => (
                  <SearchSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={getIlceOptions(resCity)}
                    placeholder={t("personal.labels.selectDistrict")}
                    isDisabled={!resCity}
                    menuPortalTarget={portalTarget}
                  />
                )}
              />
            ) : (
              <input
                type="text"
                placeholder={t("personal.placeholders.districtRegion")}
                className="block w-full h-[43px] rounded-lg border px-3 py-2 focus:outline-none bg-white border-gray-300 hover:border-black"
                value={resDistrict || ""}
                onChange={(e) =>
                  setValue("personal.ikametIlce", onlyLettersTR(e.target.value))
                }
              />
            )}
          </div>
          {(errors.personal?.ikametSehir || errors.personal?.ikametIlce) && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.personal?.ikametSehir?.message ||
                errors.personal?.ikametIlce?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
function InputField({
  label,
  name,
  placeholder,
  type = "text",
  register,
  error,
  max,
}) {
  return (
    <div className="mt-0.5">
      <label htmlFor={name} className="block text-sm font-bold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        id={name}
        placeholder={placeholder}
        maxLength={max}
        {...register(name)}
        className="block w-full h-[43px] rounded-lg border mt-0.5 px-3 py-2 bg-white text-gray-900 focus:outline-none transition border-gray-300 hover:border-black"
      />
      <div className="mt-1 flex justify-between min-h-[1rem]">
        {error && (
          <p className="text-xs text-red-600 font-medium">{error.message}</p>
        )}
        {max && <p className="text-xs text-gray-400">Max: {max}</p>}
      </div>
    </div>
  );
}

function SelectController({
  name,
  label,
  options,
  control,
  placeholder,
  error,
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
          <SearchSelect
            name={name}
            value={field.value}
            options={options}
            onChange={field.onChange}
            placeholder={placeholder}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
          />
        )}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium">{error.message}</p>
      )}
    </div>
  );
}
