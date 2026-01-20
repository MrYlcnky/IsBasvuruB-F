// src/components/Layouts/AdminLayout/ChangePasswordModal.jsx

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faXmark } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { dbChangePassword } from "../../../api/staticDB";

export default function ChangePasswordModal({ auth, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // 1. Doğrulamalar
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Tüm alanlar zorunludur.");
      return;
    }
    if (newPassword.length < 3) {
      setError("Yeni şifre en az 3 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    // 2. API'yi (staticDB) çağır
    const result = dbChangePassword(auth.username, oldPassword, newPassword);

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Başarılı",
        text: result.message,
        background: "#1F2937",
        color: "#E5E7EB",
        confirmButtonColor: "#3B82F6",
      });
      onClose(); // Modalı kapat
    } else {
      // Hata (örn: eski şifre yanlış)
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Arka plan overlay */}
      <div
        className="absolute inset-0 bg-black/60 "
        aria-hidden
        onClick={onClose}
      />

      {/* Modal İçeriği */}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900/90 shadow-2xl overflow-hidden">
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faKey} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Şifre Değiştir</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-700/60 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormInput
            label="Eski Şifre"
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <FormInput
            label="Yeni Şifre"
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <FormInput
            label="Yeni Şifre (Tekrar)"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <div className="text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Form elemanı için yardımcı bileşen
function FormInput({ label, id, type, value, onChange }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl bg-gray-800/60 border border-gray-700 p-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
