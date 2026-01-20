import React, { useMemo, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faGavel,
  faXmark,
  faCheckCircle,
  faBan,
  faInfoCircle,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import ReadOnlyApplicationView from "./ReadOnlyApplicationView";
import HistoryAndChanges from "./HistoryAndChanges";
import Swal from "sweetalert2";
// YENİ EKLENDİ: Tarih formatlayıcı
import { formatDate } from "../../../utils/dateFormatter";

// --- Akış Tanımları ---
const STAGES = [
  { key: "departman_muduru", label: "Departman Müdürü", role: "dm" },
  { key: "genel_mudur", label: "Genel Müdür", role: "gm" },
  { key: "ik", label: "İnsan Kaynakları", role: "ik" },
];

const STAGES_MAP = {
  departman_muduru: { role: "dm", next: "genel_mudur" },
  genel_mudur: { role: "gm", next: "ik" },
  ik: { role: "ik", next: "tamamlandi" },
  tamamlandi: { role: null, next: null },
};

const getAuthRoleForCheck = (role) => {
  if (role === "admin" || role === "ik_spv" || role === "ik_user") return "ik";
  return role;
};

const isIKSupervisor = (role) => {
  return role === "admin" || role === "ik_spv";
};

export default function ApplicationModal({
  data,
  auth,
  onClose,
  onAction,
  currentStage = "departman_muduru",
}) {
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  // ESC ile kapatma
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const { stageIndex, approvalNotes } = useMemo(() => {
    const stageIndex = Math.max(
      0,
      STAGES.findIndex((s) => s.key === currentStage)
    );
    const approvalNotes = (data.notes || []).filter(
      (n) => n.action === "ONAYLANDI"
    );
    return { stageIndex, approvalNotes };
  }, [currentStage, data.notes]);

  const validateNote = () => {
    if (!note || note.trim().length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Açıklama Zorunlu",
        text: `İşlemi tamamlamak için lütfen 'Açıklama Notu' alanını doldurun.`,
        background: "#1F2937",
        color: "#E5E7EB",
        confirmButtonColor: "#3B82F6",
      });
      return false;
    }
    return true;
  };

  const handleApprovalClick = (actionType) => {
    const userRoleStage = getAuthRoleForCheck(auth?.role);
    const currentStageLabel =
      STAGES.find((s) => s.key === currentStage)?.label || "Bilinmeyen Aşama";

    if (userRoleStage !== STAGES_MAP[currentStage].role) {
      Swal.fire({
        icon: "error",
        title: "İşlem Yetkiniz Yok",
        text: `Bu başvuru şu anda "${currentStageLabel}" aşamasında onay bekliyor.`,
        background: "#1F2937",
        color: "#E5E7EB",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }
    if (!validateNote()) return;
    onAction?.(actionType, note);
  };

  const handleRevisionRequestClick = () => {
    if (!validateNote()) return;
    onAction?.("request_revision", note);
  };

  const handleRevisionDecisionClick = (actionType) => {
    if (!validateNote()) return;
    onAction?.(actionType, note);
  };

  const canTakeAction =
    data.status === "Bekleyen" &&
    getAuthRoleForCheck(auth?.role) === STAGES_MAP[currentStage]?.role;

  const canRequestRevision =
    data.status === "Onaylanan" || data.status === "Reddedilen";

  const canDecideRevision =
    data.status === "Revize Talebi" && isIKSupervisor(auth?.role);

  const showRevisionSection =
    canRequestRevision || canDecideRevision || data.status === "Revize Talebi";

  // Ortak Buton Stili
  const baseBtnStyle =
    "group relative h-12 w-full flex items-center justify-center gap-3 rounded-xl border font-medium transition-all duration-300 active:scale-[0.98]";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center sm:p-4 p-0">
      <div
        className="absolute inset-0 bg-black/70 "
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-6xl h-full sm:h-auto sm:max-h-[95vh] flex flex-col bg-gray-900 sm:rounded-2xl shadow-2xl overflow-hidden border sm:border-gray-700 border-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-semibold text-white truncate">
              {data.name}
            </h3>
            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
              <span className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-600">
                {data.id}
              </span>
              <span>•</span>
              {/* GÜNCELLENDİ: Tarih Formatı */}
              <span>{formatDate(data.date)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 sm:w-auto sm:h-10 sm:px-4 flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="sm:mr-2" />
            <span className="hidden sm:inline">Kapat</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 overflow-x-auto no-scrollbar">
            <TabButton
              icon={faGavel}
              label="Özet & Karar"
              isActive={activeTab === "summary"}
              onClick={() => setActiveTab("summary")}
            />
            {/* YENİ SEKME: Geçmiş & Değişiklikler */}
            <TabButton
              icon={faClockRotateLeft}
              label="Geçmiş & Değişiklikler"
              isActive={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            />
            <TabButton
              icon={faFileLines}
              label="Tüm Başvuru Formu"
              isActive={activeTab === "details"}
              onClick={() => setActiveTab("details")}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-900/50">
          {/* TAB 1: ÖZET & KARAR */}
          <div
            className={activeTab === "summary" ? "block space-y-6" : "hidden"}
          >
            {/* Onay Akışı */}
            <Section title="Onay Akışı">
              <ol className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-4">
                {STAGES.map((s, i) => {
                  const approverNote = approvalNotes[i];
                  const isCompleted = i < stageIndex;
                  const isActive =
                    i === stageIndex && data.status === "Bekleyen";
                  const isRevision = data.status === "Revize Talebi";

                  return (
                    <li key={s.key} className="flex-1 relative">
                      {i !== STAGES.length - 1 && (
                        <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-gray-700 lg:hidden"></div>
                      )}

                      <div
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          isActive
                            ? "bg-gray-800/80 border-sky-500/50 shadow-lg shadow-sky-900/10"
                            : isCompleted
                            ? "bg-gray-800/40 border-emerald-500/30"
                            : "bg-gray-800/20 border-gray-700"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-bold z-10
                          ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-400 text-white"
                              : isActive
                              ? "bg-sky-500 border-sky-400 text-white animate-pulse"
                              : isRevision
                              ? "bg-indigo-500 border-indigo-400 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-400"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-200 text-sm">
                            {s.label}
                          </div>
                          {isCompleted && approverNote ? (
                            <div className="text-xs text-emerald-400 mt-0.5 truncate">
                              Onay: {approverNote.user}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {isActive
                                ? "Sıra Burada"
                                : isRevision
                                ? "Revize Bekleniyor"
                                : "Bekliyor"}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Section>

            {/* Karar Alanı */}
            <Section title="Karar & Açıklama">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Açıklama Notu <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="İşlem için açıklama giriniz..."
                    className="w-full min-h-[140px] rounded-xl bg-gray-800/50 border border-gray-700 p-4 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none hover:border-gray-600"
                  />
                </div>

                <div className="lg:col-span-1 flex flex-col gap-3">
                  <label className="block text-sm font-medium text-gray-300">
                    İşlemler
                  </label>

                  {canTakeAction ? (
                    <div className="grid grid-cols-1 gap-3 h-full">
                      <button
                        onClick={() => handleApprovalClick("approve")}
                        className={`${baseBtnStyle} border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white cursor-pointer hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]`}
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-lg"
                        />
                        <span>Onayla</span>
                      </button>

                      <button
                        onClick={() => handleApprovalClick("reject")}
                        className={`${baseBtnStyle} border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white cursor-pointer hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)]`}
                      >
                        <FontAwesomeIcon icon={faBan} className="text-lg" />
                        <span>Reddet</span>
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-4 rounded-xl border border-gray-700 bg-gray-800/50 text-center">
                      <p className="text-sm text-gray-400 flex flex-col items-center gap-2">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-xl text-gray-500"
                        />
                        {data.status === "Onaylanan"
                          ? "Başvuru onaylanmıştır."
                          : data.status === "Reddedilen"
                          ? "Başvuru reddedilmiştir."
                          : data.status === "Revize Talebi" &&
                            !canDecideRevision
                          ? "Revize onayı bekleniyor."
                          : "Şu an işlem yapma sırası sizde değil."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Revize Bölümü */}
            {showRevisionSection && (
              <Section title="Revize İşlemleri">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto p-2">
                  {canRequestRevision && (
                    <div className="w-full space-y-4">
                      <p className="text-sm text-gray-400">
                        Verilen kararı değiştirmek istiyorsanız revize talebi
                        oluşturabilirsiniz.
                      </p>

                      <button
                        onClick={handleRevisionRequestClick}
                        className={`${baseBtnStyle} cursor-pointer w-auto px-10 mx-auto border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]`}
                      >
                        <FontAwesomeIcon
                          icon={faClockRotateLeft}
                          className="text-lg"
                        />
                        <span>Revize Talebi Oluştur</span>
                      </button>
                    </div>
                  )}

                  {canDecideRevision && (
                    <div className="w-full space-y-4">
                      <p className="text-sm text-gray-400">
                        Revize talebini değerlendiriniz.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() =>
                            handleRevisionDecisionClick("approve_revision")
                          }
                          className={`${baseBtnStyle} cursor-pointer border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]`}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} /> Onayla
                        </button>

                        <button
                          onClick={() =>
                            handleRevisionDecisionClick("reject_revision")
                          }
                          className={`${baseBtnStyle} cursor-pointer border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)]`}
                        >
                          <FontAwesomeIcon icon={faBan} /> Reddet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Notlar & Özet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section title="Başvuru Özeti">
                <div className="space-y-3">
                  <Row label="Şubeler" value={data.branches.join(", ")} />
                  <Row label="Alanlar" value={data.areas.join(", ")} />
                  <Row
                    label="Departmanlar"
                    value={data.departments.join(", ")}
                  />
                  <Row label="Pozisyonlar" value={data.roles.join(", ")} />
                </div>
              </Section>

              <Section title="İşlem Geçmişi">
                <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {(data.notes || []).length > 0 ? (
                    [...data.notes].reverse().map((note, i) => (
                      <div
                        key={i}
                        className="pb-3 border-b border-gray-700/50 last:border-0"
                      >
                        <p className="text-sm text-gray-300 mb-1">
                          {note.note}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{note.user}</span>
                          <span>
                            {/* GÜNCELLENDİ: Tarih Formatı */}
                            {formatDate(note.date)} • {note.action}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      Henüz not bulunmuyor.
                    </p>
                  )}
                </div>
              </Section>
            </div>
          </div>

          {/* TAB 2: GEÇMİŞ & DEĞİŞİKLİKLER (YENİ) */}
          <div className={activeTab === "history" ? "block" : "hidden"}>
            <HistoryAndChanges
              currentData={data}
              previousData={data.previousVersion || null}
            />
          </div>

          {/* TAB 3: DETAYLI GÖRÜNÜM */}
          <div className={activeTab === "details" ? "block" : "hidden"}>
            <ReadOnlyApplicationView data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Alt Bileşenler ---

function TabButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-t-lg border-b-2 text-sm font-medium transition-all whitespace-nowrap
        ${
          isActive
            ? "border-sky-500 bg-gray-800 text-white"
            : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
        }`}
    >
      <FontAwesomeIcon icon={icon} />
      {label}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/30 overflow-hidden transition-all hover:border-gray-600">
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <h4 className="font-semibold text-gray-200 text-sm uppercase tracking-wide">
          {title}
        </h4>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
      <span className="text-xs uppercase tracking-wider font-medium text-gray-500">
        {label}
      </span>
      <span className="text-sm text-gray-200 font-medium text-right">
        {value}
      </span>
    </div>
  );
}
