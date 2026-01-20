// components/Users/Selected/SearchSelect.jsx
import Select from "react-select";

export default function SearchSelect({
  label,
  name,
  value, // string
  options = [], // [{value,label}]
  onChange,
  placeholder = "Ara veya seç…",
  error,
  maxVisible = 4,
  itemHeight = 40,
  isDisabled = false,
  isClearable = false,
  className = "",
  menuPortalTarget, // genelde document.body
  zIndex = 99999, // <-- modalın üstünde olsun
}) {
  const rsValue =
    options.find((o) => String(o.value) === String(value)) || null;

  const handleChange = (opt) => {
    onChange?.({
      target: { name, value: opt ? opt.value : "" },
    });
  };

  const styles = {
    control: (base, state) => ({
      ...base,
      minHeight: 43,
      height: 43,
      borderRadius: 8,
      borderColor: "#d1d5db",
      boxShadow: "none",
      backgroundColor: state.isDisabled ? "#e5e7eb" : "white",
      cursor: state.isDisabled ? "not-allowed" : "text",
      ":hover": { borderColor: "#000" },
    }),
    valueContainer: (b) => ({
      ...b,
      height: 39,
      padding: "0 8px",
      overflowY: "auto",
    }),
    indicatorsContainer: (b) => ({ ...b, height: 39 }),
    dropdownIndicator: (b) => ({ ...b, padding: 8 }),
    clearIndicator: (b) => ({ ...b, padding: 8 }),
    placeholder: (b) => ({ ...b, color: "#9ca3af" }),
    // Menü portalı (body'ye taşınıyor) — en önemli kısım
    menuPortal: (base) => ({ ...base, zIndex }),
    // Menü kutusuna da yüksek z-index veriyoruz
    menu: (b) => ({ ...b, zIndex }),
    // Liste yüksekliği
    menuList: (b) => ({
      ...b,
      maxHeight: maxVisible * itemHeight,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    option: (base, state) => ({
      ...base,
      minHeight: itemHeight,
      lineHeight: `${itemHeight - 12}px`,
      paddingTop: 6,
      paddingBottom: 6,
      cursor: "pointer",
      backgroundColor: state.isSelected
        ? "#e5f2ff"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: "#111827",
    }),
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      <Select
        inputId={name}
        name={name}
        value={rsValue}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable
        openMenuOnFocus
        openMenuOnClick
        menuShouldScrollIntoView
        maxMenuHeight={maxVisible * itemHeight}
        menuPlacement="auto"
        menuPortalTarget={
          menuPortalTarget ??
          (typeof document !== "undefined" ? document.body : null)
        }
        menuPosition="fixed"
        styles={styles}
        autoComplete="off"
        classNamePrefix="rs" // olası global css çakışmalarını azaltır
      />

      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}
