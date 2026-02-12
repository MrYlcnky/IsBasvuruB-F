import axiosClient from "../api/axiosClient";

export const authService = {
  // --- BÖLÜM 1: ADMİN PANEL GİRİŞ İŞLEMLERİ ---
  /**
   * Admin Login İşlemi
   * Backend DTO: AdminLoginDto { kullaniciAdi, kullaniciSifre }
   */
  login: async (username, password) => {
    const loginPayload = {
      kullaniciAdi: username,
      kullaniciSifre: password,
    };

    try {
      const response = await axiosClient.post(
        "/KimlikDogrulama/login",
        loginPayload,
      );
      const apiResponse = response.data;

      if (apiResponse.success && apiResponse.data) {
        const { token, userInfo } = apiResponse.data;

        if (token) {
          sessionStorage.setItem("authToken", token);
          sessionStorage.setItem("authUser", JSON.stringify(userInfo));
          return userInfo;
        }
      }

      throw new Error(apiResponse.message || "Giriş başarısız oldu.");
    } catch (error) {
      console.error("AuthService Login Error:", error);
      throw error;
    }
  },

  logout: () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    window.location.href = "/login";
  },

  // --- BÖLÜM 2: ADAY BAŞVURU DOĞRULAMA İŞLEMLERİ (YENİ) ---

  /**
   * Doğrulama Kodu Gönder (Backend: /api/KimlikDogrulama/kod-gonder)
   * @param {string} eposta
   */
  sendCode: async (eposta) => {
    // Backend, KodGonderDto { Eposta } bekliyor
    const response = await axiosClient.post("/KimlikDogrulama/kod-gonder", {
      Eposta: eposta,
    });
    return response.data; // { success: true, message: "..." } döner
  },

  /**
   * Kodu Doğrula (Backend: /api/KimlikDogrulama/kod-dogrula)
   * @param {string} eposta
   * @param {string} kod
   */
  verifyCode: async (eposta, kod) => {
    // Backend, KodDogrulaDto { Eposta, Kod } bekliyor
    const response = await axiosClient.post("/KimlikDogrulama/kod-dogrula", {
      Eposta: eposta,
      Kod: kod,
    });
    return response.data; // { success: true, data: { token: ... } } döner
  },
};
