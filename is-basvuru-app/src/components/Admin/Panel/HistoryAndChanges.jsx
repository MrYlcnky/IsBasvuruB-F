import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeCommit,
  faChevronDown,
  faChevronUp,
  faCalendarDays,
  faUserPen,
  faCheck,
  faXmark,
  faInfoCircle,
  faArrowRight,
  faTableList,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { getDifferences } from "../../../utils/diffHelper";
// YENİ EKLENDİ: Tarih formatlayıcı import
import { formatDate } from "../../../utils/dateFormatter";

export default function HistoryAndChanges({ currentData }) {
  // 1. HOOK'LAR EN TEPEDE
  const [openIndex, setOpenIndex] = useState(0);

  const timelineData = useMemo(() => {
    if (!currentData) return [];
    const history = currentData.versionHistory || [];

    // En güncel veriyi (Canlı Data) timeline formatına uyduruyoruz
    const currentSnapshot = {
      version: history.length + 1,
      date: currentData.updatedAt || currentData.date || "Tarih Yok",
      status: currentData.status || "Belirsiz",
      updatedBy: "Aday (Son Düzenleme)",
      data: currentData, // Verinin kendisi
      logs: currentData.notes || [], // Notlar
    };

    // Güncel + Geçmiş birleştir ve tersten sırala (En yeni en üstte)
    return [currentSnapshot, ...history].sort(
      (a, b) => (b.version || 0) - (a.version || 0)
    );
  }, [currentData]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  // 2. GÜVENLİK KONTROLÜ
  if (!currentData) {
    return (
      <div className="p-6 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
        <FontAwesomeIcon icon={faInfoCircle} className="mb-2 text-xl" />
        <p>Görüntülenecek başvuru verisi bulunamadı.</p>
      </div>
    );
  }

  // --- RENDER YARDIMCISI: Liste Değişiklikleri İçin Tablo (Yeşil/Kırmızı Satırlar) ---
  const renderListChangeTable = (sectionName, changes) => {
    const headers = changes[0]?.fieldMap || [];

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-4">
        {/* Header */}
        <div className="bg-gray-800/90 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
            <FontAwesomeIcon icon={faTableList} className="text-sky-500" />
            {sectionName}
          </span>
          <span className="text-[10px] font-mono bg-gray-700 px-2 py-0.5 rounded text-gray-400">
            {changes.length} İşlem
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/50 text-gray-500 font-semibold border-b border-gray-700">
              <tr>
                <th className="px-4 py-2 w-16">Durum</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-2">
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {changes.map((change, idx) => {
                const isAdded = change.status === "added";
                return (
                  <tr
                    key={idx}
                    className={`transition-colors 
                    ${
                      isAdded
                        ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                        : "bg-rose-500/5 hover:bg-rose-500/10"
                    }`}
                  >
                    {/* Durum Badge */}
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border
                        ${
                          isAdded
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {isAdded ? "EKLENDİ" : "SİLİNDİ"}
                      </span>
                    </td>

                    {/* Veriler */}
                    {headers.map((h, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-4 py-2.5 font-medium
                        ${
                          isAdded
                            ? "text-emerald-300"
                            : "text-rose-300 line-through decoration-rose-500/40 opacity-70"
                        }`}
                      >
                        {change.data[h.key] || "-"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- RENDER YARDIMCISI: Normal Alan Değişiklikleri İçin ---
  const renderFieldChanges = (sectionName, changes) => {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-4">
        <div className="bg-gray-800/80 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-300 uppercase">
            {sectionName}
          </span>
          <span className="text-[10px] font-mono bg-gray-700 px-2 py-0.5 rounded text-gray-400">
            {changes.length} Değişiklik
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/30 text-gray-500 font-semibold border-b border-gray-700">
              <tr>
                <th className="px-4 py-2 w-1/4">Alan Adı</th>
                <th className="px-4 py-2 w-1/3 text-rose-400/80">Eski Değer</th>
                <th className="px-1 py-2 w-4"></th>
                <th className="px-4 py-2 w-1/3 text-emerald-400/80">
                  Yeni Değer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {changes.map((change, cIdx) => (
                <tr
                  key={cIdx}
                  className="hover:bg-gray-700/20 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-300 font-medium align-top border-r border-gray-700/30">
                    {change.field}
                  </td>
                  <td className="px-4 py-2.5 text-rose-300 align-top break-words">
                    <div className="line-through decoration-rose-500/30 opacity-70">
                      {change.oldVal}
                    </div>
                  </td>
                  <td className="px-1 py-2.5 text-center align-top text-gray-600">
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-[10px]"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-emerald-300 align-top break-words font-medium">
                    {change.newVal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-4 space-y-4">
      {/* BAŞLIK */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faCodeCommit} className="text-sky-500" />
            Başvuru Versiyon Geçmişi
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Toplam{" "}
            <span className="text-sky-400 font-bold">
              {timelineData.length}
            </span>{" "}
            versiyon kaydı.
          </p>
        </div>
      </div>

      {/* LISTE */}
      {timelineData.map((item, index) => {
        const prevItem = timelineData[index + 1];
        const changes = getDifferences(prevItem?.data, item.data) || [];
        const isOpen = openIndex === index;

        const groupedChanges = changes.reduce((acc, curr) => {
          if (!curr) return acc;
          if (!acc[curr.section]) acc[curr.section] = [];
          acc[curr.section].push(curr);
          return acc;
        }, {});

        // --- FİLTRELEME İŞLEMİ ---
        const itemLogs = (item.logs || []).filter((log) => {
          const user = log.user || "";
          return user !== "Sistem" && user !== "Aday";
        });

        return (
          <div
            key={item.version || index}
            className={`rounded-xl border transition-all duration-300 overflow-hidden
            ${
              isOpen
                ? "bg-gray-800/60 border-sky-500/50 shadow-lg shadow-sky-900/10"
                : "bg-gray-800/30 border-gray-700 hover:bg-gray-800/50"
            }`}
          >
            {/* HEADER */}
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer group outline-none"
              type="button"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border transition-colors
                  ${
                    isOpen
                      ? "bg-sky-600 text-white border-sky-500"
                      : "bg-gray-700 text-gray-400 border-gray-600 group-hover:border-gray-500"
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-75">
                    Ver.
                  </span>
                  <span className="text-xl font-bold">{item.version}</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-sm font-bold ${
                        isOpen ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {item.updatedBy || "Bilinmeyen"}
                    </span>
                    {index === 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        GÜNCEL
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase
                      ${
                        item.status === "Reddedilen"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : item.status === "Onaylanan"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {item.status || "Bekleyen"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarDays} />
                      {/* GÜNCELLENDİ: Tarih formatı uygulandı */}
                      {formatDate(item.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUserPen} />{" "}
                      {changes.length > 0
                        ? `${changes.length} Değişiklik`
                        : "Değişiklik Yok"}
                    </span>
                  </div>
                </div>
              </div>
              <FontAwesomeIcon
                icon={isOpen ? faChevronUp : faChevronDown}
                className={`text-gray-500 transition-transform duration-300 ${
                  isOpen ? "text-sky-400" : ""
                }`}
              />
            </button>

            {/* BODY */}
            {isOpen && (
              <div className="px-5 pb-5 pt-2 border-t border-gray-700/50 bg-gray-900/40">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">
                  {/* SOL TARAF: Değişiklikler */}
                  <div className="lg:col-span-2 space-y-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Veri Değişiklikleri
                    </h5>
                    {changes.length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(groupedChanges).map(
                          ([sectionName, sectionChanges], sIdx) => {
                            if (sectionChanges[0]?.type === "list-item") {
                              return (
                                <React.Fragment key={sIdx}>
                                  {renderListChangeTable(
                                    sectionName,
                                    sectionChanges
                                  )}
                                </React.Fragment>
                              );
                            }
                            return (
                              <React.Fragment key={sIdx}>
                                {renderFieldChanges(
                                  sectionName,
                                  sectionChanges
                                )}
                              </React.Fragment>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl border border-dashed border-gray-700 bg-gray-800/20 text-center">
                        <p className="text-sm text-gray-500">
                          Bu versiyonda veri değişikliği yapılmamıştır.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SAĞ TARAF: Yönetici İşlem Geçmişi */}
                  <div className="lg:col-span-1 border-l border-gray-700/50 lg:pl-6 pl-0 lg:border-t-0 border-t pt-4 lg:pt-0">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      Yönetici Kararları & Notları
                    </h5>
                    <div className="relative border-l border-gray-700 ml-2 space-y-6">
                      {itemLogs.length > 0 ? (
                        [...itemLogs].reverse().map((log, lIdx) => (
                          <div key={lIdx} className="mb-4 ml-6 relative">
                            <span
                              className={`absolute -left-[33px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-gray-900 
                              ${
                                log.action?.includes("ONAY")
                                  ? "bg-emerald-500"
                                  : log.action?.includes("RED")
                                  ? "bg-rose-500"
                                  : log.action?.includes("GÜNCELLEME")
                                  ? "bg-amber-500"
                                  : "bg-sky-500"
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  log.action?.includes("ONAY")
                                    ? faCheck
                                    : log.action?.includes("RED")
                                    ? faXmark
                                    : faUserTie
                                }
                                className="text-white text-[9px]"
                              />
                            </span>
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700/60 shadow-sm">
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="text-xs font-bold text-sky-400">
                                  {log.user}
                                </span>
                                {/* GÜNCELLENDİ: Tarih formatı uygulandı */}
                                <time className="text-[10px] text-gray-500 font-mono">
                                  {formatDate(log.date)}
                                </time>
                              </div>
                              <p className="text-xs text-gray-300 italic mb-2">
                                "{log.note}"
                              </p>
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-700 text-gray-300 uppercase tracking-wider">
                                {log.action}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 ml-4 italic">
                          Bu versiyonda yönetici notu bulunmuyor.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
