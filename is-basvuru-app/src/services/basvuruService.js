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

  // 3. Yeni Başvuru Yap (Kullanıcı Formu için)
  // Backend Endpoint: POST /api/MasterBasvuru
  create: async (payload, config) => {
    const response = await axiosClient.post("/Personel/", payload, config);
    return response.data;
  },

  // 4. Durum Güncelle (Onayla / Reddet butonları için)
  // Backend Endpoint: PUT /api/MasterBasvuru/durum-guncelle/{id} (Backend yapınıza göre burayı güncelleyebiliriz)
  updateStatus: async (id, statusData) => {
    const response = await axiosClient.put(
      `/MasterBasvuru/durum-guncelle/${id}`,
      statusData,
    );
    return response.data;
  },
  testPersonal: async (formData) => {
    const response = await axiosClient.post(
      "/Personel/test-personal",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};
