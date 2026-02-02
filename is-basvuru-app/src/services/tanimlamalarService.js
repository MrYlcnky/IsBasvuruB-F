import axiosClient from "../api/axiosClient";

/**
 * API bazı endpoint'lerde:
 *   - response.data
 * bazı endpoint'lerde:
 *   - response.data.data
 * döndürebilir.
 * Bu helper ikisini de normalize eder.
 */
const unwrap = (response) => {
  const d = response?.data;
  if (d == null) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.data)) return d.data;
  return d.data ?? d; // object dönerse de bozmayalım
};

const toNum = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const eqId = (a, b) => {
  const na = toNum(a);
  const nb = toNum(b);
  if (na == null || nb == null) return false;
  return na === nb;
};

const tanimlamaService = {
  // --- Coğrafi Veriler ---

  // ✅ Ülkeler
  getUlkeler: async () => {
    const response = await axiosClient.get("/Ulke");
    return unwrap(response);
  },

  // ✅ Şehirler (tümü)  -> JobApplicationForm bunu isterse direkt kullanabilir
  getSehirler: async () => {
    const response = await axiosClient.get("/Sehir");
    return unwrap(response);
  },

  // ✅ Şehirler (ülkeye göre)
  getSehirlerByUlkeId: async (ulkeId) => {
    const tumSehirler = await tanimlamaService.getSehirler();
    const ulkeNum = toNum(ulkeId);

    if (ulkeNum == null) return tumSehirler;

    return tumSehirler.filter((s) =>
      eqId(s.ulkeId ?? s.UlkeId ?? s.ulke_id, ulkeNum),
    );
  },

  // Alias (senin eski kullanımın)
  getSehirlerByUlke: async (ulkeId) => {
    return tanimlamaService.getSehirlerByUlkeId(ulkeId);
  },

  // ✅ İlçeler (tümü) -> JobApplicationForm.jsx bunu çağırdığı için şart!
  getIlceler: async () => {
    const response = await axiosClient.get("/Ilce");
    return unwrap(response);
  },

  // ✅ İlçeler (şehre göre)
  getIlcelerBySehirId: async (sehirId) => {
    const tumIlceler = await tanimlamaService.getIlceler();
    const sehirNum = toNum(sehirId);

    if (sehirNum == null) return tumIlceler;

    return tumIlceler.filter((i) =>
      eqId(i.sehirId ?? i.SehirId ?? i.sehir_id, sehirNum),
    );
  },

  // Alias (senin eski kullanımın)
  getIlcelerBySehir: async (sehirId) => {
    return tanimlamaService.getIlcelerBySehirId(sehirId);
  },

  // --- Diğer Tanımlar ---

  getUyruklar: async () => {
    const response = await axiosClient.get("/Uyruk");
    return unwrap(response);
  },

  getDepartmanlar: async () => {
    const response = await axiosClient.get("/Departman");
    return unwrap(response);
  },

  // Not: sen JobApplicationForm'da getPozisyonlar veya getDepartmanPozisyonlari gibi
  // farklı isim kullanıyorsan alias da ekleyebilirsin.
  getPozisyonlar: async () => {
    const response = await axiosClient.get("/DepartmanPozisyon");
    return unwrap(response);
  },

  getSubeler: async () => {
    const response = await axiosClient.get("/Sube");
    return unwrap(response);
  },

  getEhliyetTurleri: async () => {
    const response = await axiosClient.get("/EhliyetTuru");
    return unwrap(response);
  },

  getDiller: async () => {
    const response = await axiosClient.get("/Dil");
    return unwrap(response);
  },
  getSubeAlanlar: async () => {
    const response = await axiosClient.get("/SubeAlan");
    return unwrap(response);
  },
  getProgramlar: async () => {
    const response = await axiosClient.get("/ProgramBilgisi");
    return unwrap(response);
  },
  getOyunlar: async () => {
    const response = await axiosClient.get("/OyunBilgisi");
    return unwrap(response);
  },
};

// Çift Export
export { tanimlamaService };
export default tanimlamaService;
