import axios from 'axios';

// Postman'de doğruladığımız çalışan adres
const BASE_URL = 'https://localhost:7000/api'; 

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Geliştirme ortamında SSL sertifika hatalarını yok saymak için (Gerekirse)
  // httpsAgent: new https.Agent({ rejectUnauthorized: false }) 
});

// REQUEST INTERCEPTOR (İstek Atılırken)
// Her giden isteğin çantasına (header) Token koyuyoruz.
axiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR (Yanıt Gelince)
// Backend'den dönen yanıtı veya hatayı standartlaştırıyoruz.
axiosClient.interceptors.response.use(
  (response) => {
    // Backend standardına göre "success" true ise datayı dön, değilse hata fırlat
    // Sizin backend yapınızda: response.data.data içinde asıl veri var.
    return response; 
  },
  (error) => {
    if (error.response) {
      // 401: Yetkisiz Giriş -> Kullanıcıyı login'e atabiliriz
      if (error.response.status === 401) {
        // sessionStorage.clear();
        // window.location.href = '/login';
      }
      console.error("API Error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;