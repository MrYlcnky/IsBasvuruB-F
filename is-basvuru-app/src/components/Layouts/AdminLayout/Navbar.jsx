// src/components/Layouts/AdminLayout/Navbar.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUserCircle,
  faSignOutAlt,
  faKey,
  faClipboardList,
  faUsers,
  faCaretDown,
  faChevronRight,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import {
  getApplications,
  getAuthRoleForCheck,
  updateApplicationStatus,
} from "../../../api/staticDB";
import { logout } from "../../../auth/session";
import ChangePasswordModal from "./ChangePasswordModal";
import ApplicationModal from "../../Admin/Panel/ApplicationModal";
import { formatDate } from "../../../utils/dateFormatter";
import Swal from "sweetalert2";

import logo from "../../../assets/group.png";

function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

export default function Navbar() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null);
  const [allApplications, setAllApplications] = useState([]);

  // State'ler
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogMenuOpen, setIsLogMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [selectedNotificationApp, setSelectedNotificationApp] = useState(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  // Ref'ler
  const bellRef = useRef(null);
  const userMenuRef = useRef(null);
  const logMenuRef = useRef(null);

  useOutsideAlerter(bellRef, () => setIsBellOpen(false));
  useOutsideAlerter(userMenuRef, () => setIsUserMenuOpen(false));
  useOutsideAlerter(logMenuRef, () => setIsLogMenuOpen(false));

  const refreshNotifications = () => {
    const data = getApplications();
    setAllApplications(data);
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("authUser");
      setAuth(raw ? JSON.parse(raw) : null);
    } catch {
      setAuth(null);
    }
    refreshNotifications();
    window.addEventListener("applicationsUpdated", refreshNotifications);
    return () => {
      window.removeEventListener("applicationsUpdated", refreshNotifications);
    };
  }, []);

  const notifications = useMemo(() => {
    if (!auth || !allApplications.length) return [];
    const userCheckRole = getAuthRoleForCheck(auth.role);
    const targetStage = { dm: "departman_muduru", gm: "genel_mudur", ik: "ik" }[
      userCheckRole
    ];
    if (!targetStage) return [];
    return allApplications.filter((app) => {
      if (app.status !== "Bekleyen") return false;
      if (app.approvalStage !== targetStage) return false;
      if (auth.role === "dm") {
        if (auth.department && !app.departments.includes(auth.department))
          return false;
        if (auth.branch && !app.branches.includes(auth.branch)) return false;
      }
      if (auth.role === "gm") {
        if (auth.branch && !app.branches.includes(auth.branch)) return false;
      }
      return true;
    });
  }, [allApplications, auth]);

  // --- GÜNCELLEME: LİMİTİ 4 YAPTIK ---
  const MAX_VISIBLE_NOTIFICATIONS = 3;
  const visibleNotifications = notifications.slice(
    0,
    MAX_VISIBLE_NOTIFICATIONS
  );
  const hiddenNotificationCount =
    notifications.length - MAX_VISIBLE_NOTIFICATIONS;

  const handleNotificationClick = (app) => {
    setSelectedNotificationApp(app);
    setIsAppModalOpen(true);
    setIsBellOpen(false);
  };

  const handleModalAction = (actionType, note) => {
    if (!selectedNotificationApp) return;
    const result = updateApplicationStatus(
      selectedNotificationApp.id,
      actionType,
      note,
      auth
    );
    if (result.success) {
      Swal.fire("İşlem Başarılı", result.message, "success");
      refreshNotifications();
      window.dispatchEvent(new CustomEvent("applicationsUpdated"));
    } else {
      Swal.fire("Hata", result.message, "error");
    }
    setIsAppModalOpen(false);
    setSelectedNotificationApp(null);
  };

  const canViewLogs = ["admin", "ik_spv", "ik_user"].includes(auth?.role);
  const dropdownBaseStyle =
    "absolute right-0 mt-3 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden transform transition-all duration-200 animate-in fade-in slide-in-from-top-2";

  return (
    <>
      <nav className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => navigate("/admin/panel")}
            >
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* LOG DROPDOWN MENÜSÜ */}
              {canViewLogs && (
                <div className="relative" ref={logMenuRef}>
                  <button
                    onClick={() => setIsLogMenuOpen(!isLogMenuOpen)}
                    className={`group flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 cursor-pointer ${
                      isLogMenuOpen
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                    }`}
                    title="Loglar"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isLogMenuOpen
                          ? "bg-sky-500/20 text-sky-400"
                          : "bg-gray-800 group-hover:bg-gray-700"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faClipboardList}
                        className="text-sm"
                      />
                    </div>
                    <span className="text-sm font-medium hidden md:block">
                      Loglar
                    </span>
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      className={`text-xs transition-transform duration-300 ${
                        isLogMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isLogMenuOpen && (
                    <div className={`${dropdownBaseStyle} w-72`}>
                      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Log Yönetimi
                        </span>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            navigate("/admin/logs");
                            setIsLogMenuOpen(false);
                          }}
                          className="group flex w-full items-start gap-4 px-4 py-3 rounded-xl hover:bg-sky-50 transition-colors cursor-pointer"
                        >
                          <div className="mt-1 w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
                            <FontAwesomeIcon icon={faClipboardList} />
                          </div>
                          <div className="text-left flex-1">
                            <span className="block text-sm font-bold text-gray-800">
                              İK İşlem Logları
                            </span>
                            <span className="text-xs text-gray-500">
                              Başvuru ve onay tarihçesi
                            </span>
                          </div>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-gray-300 group-hover:text-sky-500 mt-2 text-xs"
                          />
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/user-logs");
                            setIsLogMenuOpen(false);
                          }}
                          className="group flex w-full items-start gap-4 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                        >
                          <div className="mt-1 w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                            <FontAwesomeIcon icon={faUsers} />
                          </div>
                          <div className="text-left flex-1">
                            <span className="block text-sm font-bold text-gray-800">
                              Kullanıcı Logları
                            </span>
                            <span className="text-xs text-gray-500">
                              Giriş kayıtları ve yetkiler
                            </span>
                          </div>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-gray-300 group-hover:text-purple-500 mt-2 text-xs"
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BİLDİRİM ÇANI */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setIsBellOpen(!isBellOpen)}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isBellOpen
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faBell} className="text-lg" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-gray-900"></span>
                    </span>
                  )}
                </button>
                {isBellOpen && (
                  <div className={`${dropdownBaseStyle} w-80`}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                      <h3 className="font-bold text-gray-800">Bildirimler</h3>
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {notifications.length} Yeni
                      </span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <FontAwesomeIcon
                            icon={faBell}
                            className="text-3xl mb-2 opacity-20"
                          />
                          <p className="text-sm">Bekleyen işlem yok.</p>
                        </div>
                      ) : (
                        visibleNotifications.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => handleNotificationClick(app)}
                            className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                          >
                            <div className="mt-1 w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-sm font-semibold text-gray-800 truncate pr-2 group-hover:text-sky-600 transition-colors">
                                  {app.name}
                                </p>
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">
                                  {app.id}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <FontAwesomeIcon
                                  icon={faListUl}
                                  className="text-[10px]"
                                />
                                {app.roles.join(", ")}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {formatDate(app.date)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* GÜNCELLEME: "Tümünü Gör" butonu ile yönlendirme ve state gönderme */}
                    {hiddenNotificationCount > 0 && (
                      <div className="p-2 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => {
                            // Panele git ve 'Bekleyen' sekmesini açmasını söyle
                            navigate("/admin/panel", {
                              state: { targetTab: "pending" },
                            });
                            setIsBellOpen(false);
                          }}
                          className="w-full py-2 rounded-lg text-xs font-bold text-sky-600 hover:bg-sky-50 hover:text-sky-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>
                            Diğer {hiddenNotificationCount} bekleyen başvuruyu
                            gör
                          </span>
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KULLANICI MENÜSÜ */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-3 rounded-full pl-1 pr-3 py-1 transition-all duration-200 cursor-pointer border ${
                    isUserMenuOpen
                      ? "bg-gray-800 border-gray-700"
                      : "border-transparent hover:bg-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <FontAwesomeIcon icon={faUserCircle} className="text-lg" />
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-bold text-gray-200 leading-tight">
                      {auth ? auth.name : "Kullanıcı"}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                      {auth?.role === "ik_spv" ? "Yönetici" : "Personel"}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    className={`text-gray-500 text-xs transition-transform duration-300 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isUserMenuOpen && (
                  <div className={`${dropdownBaseStyle} w-60 right-0 mt-3`}>
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow">
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className="text-xl"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {auth?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {auth?.username || "kullanici"}
                        </p>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsChangePasswordModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon
                          icon={faKey}
                          className="text-gray-400"
                        />{" "}
                        Şifre Değiştir
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} /> Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {isChangePasswordModalOpen && auth && (
        <ChangePasswordModal
          auth={auth}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      )}
      {isAppModalOpen && selectedNotificationApp && (
        <ApplicationModal
          data={selectedNotificationApp}
          auth={auth}
          onClose={() => {
            setIsAppModalOpen(false);
            setSelectedNotificationApp(null);
          }}
          onAction={handleModalAction}
          currentStage={selectedNotificationApp.approvalStage}
        />
      )}
    </>
  );
}
