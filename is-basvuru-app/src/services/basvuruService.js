import axiosClient from "../api/axiosClient";

export const basvuruService = {
  // 1. Tüm başvuruları listele (Admin Paneli Tablosu için)
  // Backend Endpoint: GET /api/MasterBasvuru
  getAll: async () => {
    const response = await axiosClient.get("/MasterBasvuru");
    return response.data;
  },

  // 2. Tek bir başvurunun detayını getir (Göz ikonuna basınca açılan Modal için)
  // Backend Endpoint: GET /api/MasterBasvuru/{id}
  getById: async (id) => {
    const response = await axiosClient.get(`/MasterBasvuru/${id}`);
    return response.data;
  },

  // 3. Yeni Başvuru Yap (Kullanıcı Formu - Ana Gönderim)
  // Backend Endpoint: POST /api/Personel
  // Not: Payload "FormData" olduğu için Axios otomatik olarak 'multipart/form-data' ayarlar.
  create: async (payload) => {
    const response = await axiosClient.post("/Personel", payload);
    return response.data;
  },

  // 4. Test Amaçlı Başvuru (Sadece verileri loglar veya test eder)
  // Backend Endpoint: POST /api/Personel/test-personal
  /*testPersonal: async (formData) => {
    const response = await axiosClient.post(
      "/Personel/test-personal",
      formData,
    );
    return response.data;
  },*/
  testPersonal: async (formData) => {
    return await axiosClient.post("/Personel/test-personal", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 5. Durum Güncelle (Onayla / Reddet butonları için)
  // Backend Endpoint: PUT /api/MasterBasvuru/durum-guncelle/{id}
  updateStatus: async (id, statusData) => {
    const response = await axiosClient.put(
      `/MasterBasvuru/durum-guncelle/${id}`,
      statusData,
    );
    return response.data;
  },

  // --- Alt Tablo Ekleme Servisleri (Gerekirse Tekil Ekleme İçin) ---

  // Eğitim Bilgisi Ekle
  createEgitim: async (payload) => {
    const response = await axiosClient.post("/EgitimBilgisi", payload);
    return response.data;
  },

  // Sertifika Bilgisi Ekle
  createSertifika: async (payload) => {
    const response = await axiosClient.post("/SertifikaBilgisi", payload);
    return response.data;
  },

  // Bilgisayar Bilgisi Ekle
  createBilgisayar: async (payload) => {
    const response = await axiosClient.post("/BilgisayarBilgisi", payload);
    return response.data;
  },

  // Yabancı Dil Bilgisi Ekle
  createYabanciDil: async (payload) => {
    const response = await axiosClient.post("/YabanciDilBilgisi", payload);
    return response.data;
  },

  // İş Deneyimi Ekle
  createIsDeneyimi: async (payload) => {
    const response = await axiosClient.post("/IsDeneyimi", payload);
    return response.data;
  },

  // Referans Ekle
  createReferans: async (payload) => {
    const response = await axiosClient.post("/ReferansBilgisi", payload);
    return response.data;
  },

  // DigerKisilerBilgiler Ekle
  createDigerKisilerBilgiler: async (payload) => {
    const response = await axiosClient.post("/DigerKisilerBilgiler", payload);
    return response.data;
  },
};
