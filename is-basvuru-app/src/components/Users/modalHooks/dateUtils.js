// 🔹 Güvenli şekilde string → Date dönüşümü
export const toDateSafe = (v) => {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v;
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

// 🔹 "YYYY-MM-DD" (ISO format) → Date (timezone güvenli)
export const fromISODateString = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

// 🔹 Date → "YYYY-MM-DD" (input value için)
export const toISODate = (d) => {
  if (!(d instanceof Date) || isNaN(d)) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// 🔹 Tarihi “dd.MM.yyyy” formatına dönüştür (ör: 01.05.2024)
export const formatDate = (dateLike) => {
  const d = toDateSafe(dateLike);
  if (!d) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${dd}.${mm}.${y}`;
};


// 🔹 Bugünün ISO'su (YYYY-MM-DD) – lokal saat
export const todayISO = () => toISODate(new Date());

// 🔹 Dün’ün ISO'su (YYYY-MM-DD) – lokal saat
export const yesterdayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toISODate(d);
};
