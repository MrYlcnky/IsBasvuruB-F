// components/Users/Selected/CountryCitySelect.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import Select from "react-select";
import countriesData from "../../../json/country_city_nationality.json";

export default function CountryCitySelect({
  countryLabel = "Ülke",
  cityLabel = "Şehir",
  countryId = "country",
  cityId = "city",
  onChange,
  defaultCountry = "",
  defaultCity = "",
  className = "",
  countryPlaceholder = "Seçiniz",
  cityPlaceholder = "Seçiniz",
}) {
  // Tek seferlik index: ülke->şehir haritası + ülke seçenekleri
  const { countryOptions, statesMap } = useMemo(() => {
    const map = new Map();
    const names = [];
    for (const c of countriesData || []) {
      const name = c?.name;
      if (!name) continue;
      if (!map.has(name)) {
        map.set(name, []);
        names.push(name);
      }
      const states = (c?.states || [])
        .map((s) => (typeof s === "string" ? s : s?.name))
        .filter(Boolean);
      if (states.length) {
        const prev = map.get(name);
        for (const s of states) if (!prev.includes(s)) prev.push(s);
      }
    }
    names.sort((a, b) => a.localeCompare(b, "tr"));
    for (const [k, arr] of map) {
      arr.sort((a, b) => a.localeCompare(b, "tr"));
      map.set(k, arr);
    }
    const opts = names.map((n) => ({ value: n, label: n }));
    return { countryOptions: opts, statesMap: map };
  }, []);

  // State
  const [country, setCountry] = useState(
    defaultCountry ? { value: defaultCountry, label: defaultCountry } : null
  );
  const [city, setCity] = useState(
    defaultCity ? { value: defaultCity, label: defaultCity } : null
  );
  const [touched, setTouched] = useState({ country: false, city: false });

  // Şehir seçenekleri (ülke değişince hesaplanır)
  const cityOptions = useMemo(() => {
    if (!country) return [];
    const list = statesMap.get(country.value) || [];
    if (list.length === 0) return [{ value: "none", label: "Şehri Yok" }];
    return list.map((s) => ({ value: s, label: s }));
  }, [country?.value, statesMap]);

  // Ülke değişince şehir reset kuralı
  useEffect(() => {
    if (!country) {
      setCity(null);
      return;
    }
    if (defaultCity) {
      const hit = cityOptions.find((o) => o.value === defaultCity);
      setCity(hit ?? null);
    } else {
      if (cityOptions.length === 1 && cityOptions[0].value === "none") {
        setCity(cityOptions[0]);
      } else {
        setCity(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country?.value]);

  // Parent'a bildir
  useEffect(() => {
    onChange?.({ country: country?.value || "", city: city?.value || "" });
  }, [country, city, onChange]);

  // Stabil callback'ler
  const handleCountryChange = useCallback((opt) => {
    setCountry(opt);
    setCity(null);
  }, []);
  const handleCityChange = useCallback((opt) => {
    setCity(opt);
  }, []);
  const markCountryTouched = useCallback(
    () => setTouched((t) => ({ ...t, country: true })),
    []
  );
  const markCityTouched = useCallback(
    () => setTouched((t) => ({ ...t, city: true })),
    []
  );

  // react-select görsel sınıfları
  const rsClassNames = {
    container: () => "w-full",
    control: ({ isFocused, isDisabled }) =>
      [
        "w-full h-[43px] rounded-lg bg-white border px-3 shadow-none",
        isDisabled
          ? "opacity-60 cursor-not-allowed bg-gray-100 border-gray-200"
          : "cursor-pointer",
        isFocused
          ? "border-gray-400"
          : "border-gray-300 hover:border-gray-400 focus:border-gray-400",
        "transition-colors duration-150 focus:outline-none",
      ].join(" "),
    valueContainer: () => "py-1 gap-1",
    placeholder: () => "text-gray-400",
    singleValue: () => "text-gray-900",
    input: () => "text-gray-900",
    indicatorsContainer: () => "gap-1",
    indicatorSeparator: () => "hidden",
    dropdownIndicator: () => "text-gray-500 hover:text-gray-700 transition",
    clearIndicator: () => "text-gray-500 hover:text-red-500 transition",
    menu: () =>
      "mt-1 border border-gray-200 rounded-md bg-white shadow-none overflow-hidden",
    menuList: () => "max-h-56 overflow-auto shadow-none",
    option: ({ isFocused, isSelected }) =>
      [
        "px-3 py-2 cursor-pointer select-none",
        isSelected
          ? "bg-gray-200 text-gray-900"
          : isFocused
          ? "bg-gray-100"
          : "bg-white",
      ].join(" "),
    noOptionsMessage: () => "px-3 py-2 text-gray-500",
  };

  const rsStyles = useMemo(
    () => ({
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }),
    []
  );

  const sharedProps = useMemo(
    () => ({
      unstyled: true,
      classNames: rsClassNames,
      styles: rsStyles,
      menuPortalTarget: typeof document !== "undefined" ? document.body : null,
      maxMenuHeight: 200,
      isSearchable: true,
      // NOT: Virtualized MenuList kaldırıldı → ekstra bağımlılık yok
    }),
    [rsStyles]
  );

  return (
    <>
      {/* Ülke */}
      <div className={`w-full ${className}`}>
        <label
          htmlFor={countryId}
          className="block text-sm font-bold text-gray-700 mb-1"
        >
          {countryLabel} <span className="text-red-500">*</span>
        </label>
        <Select
          inputId={countryId}
          options={countryOptions}
          value={country}
          required
          onChange={handleCountryChange}
          onBlur={markCountryTouched}
          placeholder={countryPlaceholder}
          isClearable
          {...sharedProps}
        />
        {touched.country && !country && (
          <p className="text-xs text-red-600 mt-1 font-medium">
            Zorunlu alan, lütfen seçim yapınız.
          </p>
        )}
      </div>

      {/* Şehir */}
      <div className={`w-full ${className}`}>
        <label
          htmlFor={cityId}
          className="block text-sm font-bold text-gray-700 mb-1"
        >
          {cityLabel} <span className="text-red-500">*</span>
        </label>
        <Select
          inputId={cityId}
          options={cityOptions}
          value={city}
          required
          onChange={handleCityChange}
          onBlur={markCityTouched}
          placeholder={
            !country
              ? `Önce ${countryLabel.toLowerCase()} seçin`
              : cityPlaceholder
          }
          isDisabled={!country || cityOptions.length === 0}
          isClearable
          {...sharedProps}
        />
        {touched.city && !city && (
          <p className="text-xs text-red-600 mt-1 font-medium">
            Zorunlu alan, lütfen seçim yapınız.
          </p>
        )}
      </div>
    </>
  );
}
