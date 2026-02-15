import axiosClient from "../api/axiosClient";

export const authService = {
  login: async (username, password) => {
    const loginPayload = {
      kullaniciAdi: username,
      kullaniciSifre: password,
    };

    try {
      // URL: /api/Auth/login (Zaten doğruydu)
      const response = await axiosClient.post("/Auth/login", loginPayload);
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

  sendCode: async (eposta) => {
    // URL Güncellendi: /api/KimlikDogrulama/kod-gonder
    const response = await axiosClient.post("/KimlikDogrulama/kod-gonder", {
      Eposta: eposta,
    });
    return response.data;
  },

  verifyCode: async (eposta, kod) => {
    // URL Güncellendi: /api/KimlikDogrulama/kod-dogrula
    const response = await axiosClient.post("/KimlikDogrulama/kod-dogrula", {
      Eposta: eposta,
      Kod: kod,
    });
    return response.data;
  },
};
