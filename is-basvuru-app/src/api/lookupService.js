import axiosClient from "../api/axiosClient";

// Ortak unwrap fonksiyonu
const unwrap = (response) => response?.data?.data ?? [];

export const getCountries = async () => {
  // Yeni URL: /api/Ulke/GetAll
  const response = await axiosClient.get("/Ulke/GetAll");
  return unwrap(response);
};

export const getNationalities = async () => {
  // Yeni URL: /api/Uyruk/GetAll
  const response = await axiosClient.get("/Uyruk/GetAll");
  return unwrap(response);
};

export const getCitiesByCountry = async (countryId) => {
  if (!countryId) return [];
  // Yeni URL: /api/Sehir/GetByUlkeId/{id}
  const response = await axiosClient.get(`/Sehir/GetByUlkeId/${countryId}`);
  return unwrap(response);
};

export const getDistrictsByCity = async (cityId) => {
  if (!cityId) return [];
  // Yeni URL: /api/Ilce/GetAll (Filtreleme gerekirse backend'e GetByCityId eklenebilir)
  // Şimdilik swagger'daki GetAll'a göre:
  const response = await axiosClient.get("/Ilce/GetAll");
  const allDistricts = unwrap(response);
  return allDistricts.filter((d) => d.sehirId === Number(cityId));
};
