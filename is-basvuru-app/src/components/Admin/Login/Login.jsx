import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../../services/authService"; 
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Servisi çağırıyoruz
      const userInfo = await authService.login(username, password);

      // Başarılı senaryo
      toast.success(`Hoşgeldiniz, ${userInfo.adi || userInfo.kullaniciAdi}. `);
      
      // Yönlendirme
      navigate("/admin/panel");

    } catch (err) {
      // Hata senaryosu
      // Backend'den gelen detaylı hata mesajını yakalamaya çalışıyoruz
      const errorMessage = err.response?.data?.message || err.message || "Giriş başarısız. Bilgilerinizi kontrol edin.";
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Return kısmındaki JSX kodları aynı kalabilir) ...
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <img
              src="/images/group.png" 
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
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Kullanıcı adınız"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-900/50 p-3 text-center text-sm font-medium text-red-200 border border-red-800">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center gap-2 items-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <span>İşleniyor...</span>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faRightToBracket} />
                    <span>Giriş Yap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}