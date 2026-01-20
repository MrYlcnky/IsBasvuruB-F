// src/components/Admin/Login/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../auth/session"; // Session'dan login'i al
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    setError("");
    setIsLoading(true);

    // GÜNCELLEME: session.js'teki login fonksiyonunu çağır
    const user = login(username, password);

    // Simüle gecikme
    setTimeout(() => {
      setIsLoading(false);
      if (user) {
        console.log("Giriş başarılı:", user);
        Swal.fire({
          icon: "success",
          title: `Hoşgeldiniz, ${user.name}`,
          text: "Panele yönlendiriliyorsunuz...",
          timer: 1500,
          showConfirmButton: false,
          background: "#1F2937",
          color: "#E5E7EB",
        });
        navigate("/admin/panel");
      } else {
        setError("Kullanıcı adı veya şifre hatalı.");
      }
    }, 500); // 0.5 saniye gecikme
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <img
              src="/src/images/group.png" // Bu yolu /src/assets/group.png olarak da değiştirebilirsin
              alt="Chamada Group"
              className="w-32 mx-auto"
            />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
              Admin Paneli
            </h1>
            <p className="text-sm text-gray-400">
              Giriş yapmak için bilgilerinizi girin.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300"
              >
                Kullanıcı Adı (ik_spv, ik_user, it_girne, it_prestige, gm_gire)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Kullanıcı adınız"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-m-medium text-gray-300"
              >
                Şifre (tümü: 123)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-center text-sm font-medium text-red-400">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center gap-2 items-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faRightToBracket} />
                {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
