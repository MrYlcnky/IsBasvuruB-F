import axiosClient from "../api/axiosClient";

/**
 * API Helper: Veriyi normalize eder.
 */
const unwrap = (response) => {
  const d = response?.data;
  if (d == null) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.data)) return d.data;
  return d.data ?? d;
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

  getUlkeler: async () => {
    const response = await axiosClient.get("/Ulke");
    return unwrap(response);
  },

  getSehirler: async () => {
    const response = await axiosClient.get("/Sehir");
    return unwrap(response);
  },

  getSehirlerByUlkeId: async (ulkeId) => {
    const tumSehirler = await tanimlamaService.getSehirler();
    const ulkeNum = toNum(ulkeId);
    if (ulkeNum == null) return tumSehirler;
    return tumSehirler.filter((s) =>
      eqId(s.ulkeId ?? s.UlkeId ?? s.ulke_id, ulkeNum),
    );
  },

  getSehirlerByUlke: async (ulkeId) => {
    return tanimlamaService.getSehirlerByUlkeId(ulkeId);
  },

  getIlceler: async () => {
    const response = await axiosClient.get("/Ilce");
    return unwrap(response);
  },

  getIlcelerBySehirId: async (sehirId) => {
    const tumIlceler = await tanimlamaService.getIlceler();
    const sehirNum = toNum(sehirId);
    if (sehirNum == null) return tumIlceler;
    return tumIlceler.filter((i) =>
      eqId(i.sehirId ?? i.SehirId ?? i.sehir_id, sehirNum),
    );
  },

  getIlcelerBySehir: async (sehirId) => {
    return tanimlamaService.getIlcelerBySehirId(sehirId);
  },

  // --- Diğer Tanımlar ---

  getUyruklar: async () => {
    const response = await axiosClient.get("/Uyruk");
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

  // --- ŞİRKET YAPISI (Mevcut İlişkisel Tablolar) ---
  getSubeler: async () => {
    const response = await axiosClient.get("/Sube");
    return unwrap(response);
  },
  getSubeAlanlar: async () => {
    const response = await axiosClient.get("/SubeAlan");
    return unwrap(response);
  },
  getDepartmanlar: async () => {
    const response = await axiosClient.get("/Departman");
    return unwrap(response);
  },
  getPozisyonlar: async () => {
    const response = await axiosClient.get("/DepartmanPozisyon");
    return unwrap(response);
  },

  // 1. Master Alanları Getir (Örn: Casino, Hotel)
  getMasterAlanlar: async () => {
    const response = await axiosClient.get("/MasterAlan");
    return unwrap(response);
  },

  // 2. Master Departmanları Getir (Örn: IT, Mutfak)
  getMasterDepartmanlar: async () => {
    const response = await axiosClient.get("/MasterDepartman");
    return unwrap(response);
  },

  // 3. Master Pozisyonları Getir (Örn: Müdür, Garson)
  getMasterPozisyonlar: async () => {
    const response = await axiosClient.get("/MasterPozisyon");
    return unwrap(response);
  },
  // ============================================================

  getProgramlar: async () => {
    const response = await axiosClient.get("/ProgramBilgisi");
    return unwrap(response);
  },
  getOyunlar: async () => {
    const response = await axiosClient.get("/OyunBilgisi");
    return unwrap(response);
  },
  getKktcBelgeler: async () => {
    const response = await axiosClient.get("/KktcBelge");
    return response.data;
  },
};

export { tanimlamaService };
export default tanimlamaService;
