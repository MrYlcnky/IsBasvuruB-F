const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const fetchLookup = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Lookup request failed: ${path}`);
  }
  const payload = await response.json();
  return payload?.data ?? [];
};

export const getCountries = async () => fetchLookup("/api/Ulke");

export const getNationalities = async () => fetchLookup("/api/Uyruk");

export const getCitiesByCountry = async (countryId) =>
  fetchLookup(`/api/Sehir/ulke/${countryId}`);
