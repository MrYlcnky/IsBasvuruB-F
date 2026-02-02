import axiosClient from '../api/axiosClient';

export const authService = {
  /**
   * Admin Login İşlemi
   * Backend DTO: AdminLoginDto { kullaniciAdi, kullaniciSifre }
   */
  login: async (username, password) => {
    // 1. DTO Uyumlu Payload Hazırlama
    const loginPayload = {
      kullaniciAdi: username,
      kullaniciSifre: password // Backend 'sifre' değil 'kullaniciSifre' bekliyor
    };

    try {
      // 2. API İsteği
      const response = await axiosClient.post('/KimlikDogrulama/login', loginPayload);

      // 3. Yanıtı İşleme (Postman çıktısına göre)
      // Response yapısı: { data: { data: { token: "...", userInfo: {...} }, success: true } }
      const apiResponse = response.data;

      if (apiResponse.success && apiResponse.data) {
        const { token, userInfo } = apiResponse.data;

        if (token) {
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('authUser', JSON.stringify(userInfo));
          return userInfo;
        }
      }
      
      // Success false ise veya token yoksa
      throw new Error(apiResponse.message || "Giriş başarısız oldu.");

    } catch (error) {
      console.error("AuthService Login Error:", error);
      throw error; // Hatayı UI component'e fırlat
    }
  },

  logout: () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    window.location.href = "/login";
  }
};