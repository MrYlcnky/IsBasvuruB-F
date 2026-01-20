// src/auth/session.js
import { dbLogin } from "../api/staticDB"; // staticDB'den login'i import et

const AUTH_KEY = "authUser";

export const getAuthUser = () => {
  try {
    const data = sessionStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to parse auth user from session storage", error);
    return null;
  }
};

export const login = (username, password) => {
  // Statik kullanıcılar yerine DB'yi çağır
  const user = dbLogin(username, password);
  
  if (user) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }
  
  return null; // Hatalı giriş
};

export const logout = () => {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = "/login"; // Logine yönlendir
};