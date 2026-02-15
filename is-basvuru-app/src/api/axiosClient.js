import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL_API;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// İSTEK KONTROLÜ (INTERCEPTOR)
axiosClient.interceptors.request.use(
  (config) => {
    // KRİTİK DÜZELTME: authService'de localStorage.setItem("token", ...) kullanmıştık.
    // Burayı da localStorage ve "token" anahtarına göre güncelledik.
    const token = localStorage.getItem("token");

    if (token) {
      // Token varsa Authorization header'ına ekle
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// YANIT KONTROLÜ (INTERCEPTOR)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Eğer backend 401 (Yetkisiz) dönerse
    if (error.response && error.response.status === 401) {
      console.warn("Yetkisiz erişim: Oturumunuz sonlanmış olabilir (401).");

      // Opsiyonel: Oturumu temizleyip login'e yönlendirmek istersen burayı açabilirsin:
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
