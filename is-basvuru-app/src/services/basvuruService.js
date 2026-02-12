import axiosClient from "../api/axiosClient";

export const basvuruService = {
  // 1. Yeni Başvuru Oluştur (POST)
  create: async (formData) => {
    const response = await axiosClient.post("/Personel", formData, {
      // Bu ayar, axiosClient içindeki varsayılan 'application/json' başlığını temizler.
      // Böylece tarayıcı, doğru 'multipart/form-data; boundary=...' başlığını kendisi koyar.
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 2. Mevcut Başvuruyu Güncelle (PUT)
  update: async (id, formData) => {
    // BURASI KRİTİK: ID URL'de yok, Body'de FormData olarak gidiyor.
    const response = await axiosClient.put("/Personel", formData, {
      // Varsayılan JSON header'ını ezmek için bunu ekliyoruz.
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 3. E-posta ile Başvuru Bilgilerini Getir (GET)
  getByEmail: async (email) => {
    const response = await axiosClient.get("/Personel/basvurumu-getir", {
      params: { email },
    });
    return response.data;
  },
};
