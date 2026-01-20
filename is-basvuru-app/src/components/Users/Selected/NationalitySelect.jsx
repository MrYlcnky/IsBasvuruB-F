import { useMemo, useEffect, useState } from "react";
import Select from "react-select";
import nationalityData from "../../../json/country_city_nationality.json";

export default function NationalitySelect({
  label = "Uyruğu",
  id = "nationality",
  name = "nationality",
  defaultValue = "",
  onChange,
  className = "",
  placeholder = "Örn. T.C.",
}) {
  // Seçenekleri oluştur
  const options = useMemo(() => {
    const items = (nationalityData || [])
      .map((n) =>
        typeof n === "string"
          ? n
          : n?.code && n?.nationality
          ? `${n.code} (${n.nationality})`
          : n?.name
      )
      .filter(Boolean);
    const uniq = [...new Set(items)].sort((a, b) => a.localeCompare(b, "tr"));
    return uniq.map((n) => ({ value: n, label: n }));
  }, []);

  const [selected, setSelected] = useState(
    defaultValue ? { value: defaultValue, label: defaultValue } : null
  );

  // Dokunulma (blur) kontrolü
  const [touched, setTouched] = useState(false);

  // Parent'a bildir
  useEffect(() => {
    onChange?.(selected?.value || "");
  }, [selected, onChange]);

  // ---- React-Select görünümü: CountryCitySelect ile aynı ----
  const rsClassNames = {
    container: () => "w-full",
    control: ({ isFocused, isDisabled }) =>
      [
        "w-full h-[43px] rounded-lg bg-white border border-gray-300 px-3 shadow-none",
        isDisabled
          ? "opacity-60 cursor-not-allowed bg-gray-100"
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

  const rsStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const sharedProps = {
    unstyled: true,
    classNames: rsClassNames,
    styles: rsStyles,
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    maxMenuHeight: 200,
    isSearchable: true,
  };

  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-bold text-gray-700 mb-1"
      >
        {label} <span className="text-red-500">*</span>
      </label>

      <Select
        inputId={id}
        name={name}
        options={options}
        value={selected}
        required
        onChange={setSelected}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        {...sharedProps}
      />

      {/* Uyarı mesajı */}
      {touched && !selected && (
        <p className="text-xs text-red-600 mt-1 font-medium">
          Zorunlu alan, lütfen seçim yapınız.
        </p>
      )}
    </div>
  );
}
