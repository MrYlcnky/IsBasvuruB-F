import React, { useState, useEffect, useCallback, useMemo } from "react";
import { tanimlamalarService } from "../../../services/tanimlamalarService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faArrowLeft,
  faSearch,
  faEdit,
  faSortAmountDown,
  faSortAmountUp,
  faGlobe,
  faCity,
  faMapSigns,
  faLanguage,
  faPassport,
  faIdCard,
  faShieldAlt,
  faSort,
  faEye,
  faFilter,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function FormDefinitions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("uyruk");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtreleme State'leri
  const [filterUlkeId, setFilterUlkeId] = useState(""); // Ülke filtresi
  const [filterSehirId, setFilterSehirId] = useState(""); // Şehir filtresi

  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [lookups, setLookups] = useState({ ulkeler: [], sehirler: [] });

  const upperCaseTabs = [
    "uyruk",
    "ulke",
    "sehir",
    "ilce",
    "dil",
    "ehliyet",
    "kktc",
  ];

  const tabs = [
    {
      id: "uyruk",
      name: "Uyruklar",
      single: "Uyruk",
      icon: faPassport,
      key: "UyrukAdi",
    },
    {
      id: "ulke",
      name: "Ülkeler",
      single: "Ülke",
      icon: faGlobe,
      key: "UlkeAdi",
    },
    {
      id: "sehir",
      name: "Şehirler",
      single: "Şehir",
      icon: faCity,
      key: "SehirAdi",
    },
    {
      id: "ilce",
      name: "İlçeler",
      single: "İlçe",
      icon: faMapSigns,
      key: "IlceAdi",
    },
    {
      id: "dil",
      name: "Yabancı Diller",
      single: "Dil",
      icon: faLanguage,
      key: "DilAdi",
    },
    {
      id: "kktc",
      name: "KKTC Belgeleri",
      single: "Belge",
      icon: faIdCard,
      key: "BelgeAdi",
    },
    {
      id: "ehliyet",
      name: "Ehliyet Türleri",
      single: "Ehliyet",
      icon: faIdCard,
      key: "EhliyetTuruAdi",
    },
    {
      id: "kvkk",
      name: "KVKK Metinleri",
      single: "KVKK",
      icon: faShieldAlt,
      key: "KvkkVersiyon",
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab);

  const truncateText = (text, maxLength = 40) =>
    !text
      ? "-"
      : text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;

  const getValue = (item, key) => {
    if (!item) return "-";
    if (item[key] !== undefined) return item[key];
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    if (item[camelKey] !== undefined) return item[camelKey];
    if (activeTab === "kktc" && item["belgeAdi"]) return item["belgeAdi"];
    return "-";
  };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case "uyruk":
          res = await tanimlamalarService.getUyruklar();
          break;
        case "ulke":
          res = await tanimlamalarService.getUlkeler();
          break;
        case "sehir":
          res = await tanimlamalarService.getSehirler();
          break;
        case "ilce":
          res = await tanimlamalarService.getIlceler();
          break;
        case "dil":
          res = await tanimlamalarService.getDiller();
          break;
        case "kktc":
          res = await tanimlamalarService.getKktcBelgeler();
          break;
        case "ehliyet":
          res = await tanimlamalarService.getEhliyetTurleri();
          break;
        case "kvkk":
          res = await tanimlamalarService.getKvkkList();
          break;
        default:
          res = { success: false };
      }
      if (res && res.success) setList(res.data || []);
      else setList([]);
    } catch {
      toast.error("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchList();
    setFilterUlkeId("");
    setFilterSehirId("");
    setSearchTerm("");
    setCurrentPage(1);
  }, [fetchList, activeTab]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const resUlke = await tanimlamalarService.getUlkeler();
        const resSehir = await tanimlamalarService.getSehirler();
        setLookups({
          ulkeler: resUlke.success ? resUlke.data : [],
          sehirler: resSehir.success ? resSehir.data : [],
        });
      } catch (err) {
        console.error(err);
      }
    };
    loadLookups();
  }, []);

  const handleAdd = async () => {
    if (activeTab === "kvkk") return await showKvkkModal();

    const addedCountryIds =
      activeTab === "uyruk"
        ? list.map((item) => item.ulkeId || item.UlkeId)
        : [];

    const ulkelerOptions = lookups.ulkeler
      .map((u) => {
        const id = u.id || u.Id;
        const isAdded = addedCountryIds.includes(id);
        return `<option value="${id}" ${isAdded ? "disabled" : ""}>${u.UlkeAdi || u.ulkeAdi} ${isAdded ? "(Zaten Ekli)" : ""}</option>`;
      })
      .join("");

    let htmlContent = "";
    const labelClass =
      "text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5";
    const inputClass =
      "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 outline-none transition-all text-sm font-bold text-gray-700 uppercase";

    if (["dil", "kktc", "ehliyet", "ulke"].includes(activeTab)) {
      htmlContent = `<div class="text-left"><label class="${labelClass}">Tanım Adı</label><input id="swal-name" class="${inputClass}" placeholder="Adı yazınız..."></div>`;
    } else if (["uyruk", "sehir"].includes(activeTab)) {
      htmlContent = `
        <div class="text-left space-y-4">
            <div><label class="${labelClass}">Bağlı Olduğu Ülke</label><select id="swal-ulke" class="${inputClass} cursor-pointer shadow-none"><option value="" disabled selected>Ülke Seçiniz...</option>${ulkelerOptions}</select></div>
            <div><label class="${labelClass}">Tanım Adı</label><input id="swal-name" class="${inputClass}" placeholder="Adı yazınız..."></div>
        </div>`;
    } else if (activeTab === "ilce") {
      htmlContent = `
        <div class="text-left space-y-4">
            <div class="grid grid-cols-2 gap-3">
                <div><label class="${labelClass}">1. Ülke</label><select id="swal-ulke" class="${inputClass} cursor-pointer shadow-none"><option value="" disabled selected>Seçiniz...</option>${ulkelerOptions}</select></div>
                <div><label class="${labelClass}">2. Şehir</label><select id="swal-sehir" class="${inputClass} cursor-pointer disabled:opacity-50 shadow-none" disabled><option value="" disabled selected>Önce Ülke...</option></select></div>
            </div>
            <div><label class="${labelClass}">Tanım Adı</label><input id="swal-name" class="${inputClass}" placeholder="İlçe adını yazınız..."></div>
        </div>`;
    }

    const { value: formValues } = await Swal.fire({
      title: `<span class="text-xl font-black text-gray-800 uppercase tracking-tighter">${currentTab.single} EKLE</span>`,
      html: `<div class="mt-4">${htmlContent}</div>`,
      showCancelButton: true,
      confirmButtonText: "Ekle",
      confirmButtonColor: "#10b981",
      cancelButtonText: "İptal",
      customClass: {
        popup: "rounded-[2rem]",
        confirmButton:
          "px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest",
        cancelButton:
          "px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest",
      },
      didOpen: (popup) => {
        const input = popup.querySelector("#swal-name");
        if (input && upperCaseTabs.includes(activeTab)) {
          input.addEventListener(
            "input",
            (e) => (e.target.value = e.target.value.toLocaleUpperCase("tr-TR")),
          );
        }
        if (activeTab === "ilce") {
          const ulkeSelect = popup.querySelector("#swal-ulke");
          const sehirSelect = popup.querySelector("#swal-sehir");
          ulkeSelect.addEventListener("change", (e) => {
            const selectedUlkeId = parseInt(e.target.value);
            const filteredSehirler = lookups.sehirler.filter(
              (s) => (s.UlkeId || s.ulkeId) === selectedUlkeId,
            );
            sehirSelect.innerHTML =
              `<option value="" disabled selected>Şehir Seçiniz...</option>` +
              filteredSehirler
                .map(
                  (s) =>
                    `<option value="${s.id || s.Id}">${s.SehirAdi || s.sehirAdi}</option>`,
                )
                .join("");
            sehirSelect.disabled = false;
          });
        }
      },
      preConfirm: () => {
        const text = document.getElementById("swal-name").value;
        const ulkeId = document.getElementById("swal-ulke")?.value;
        const sehirId = document.getElementById("swal-sehir")?.value;
        if (!text)
          return Swal.showValidationMessage("Lütfen bir isim giriniz!");
        if (["uyruk", "sehir"].includes(activeTab) && !ulkeId)
          return Swal.showValidationMessage("Lütfen ülke seçiniz!");
        if (activeTab === "ilce" && !sehirId)
          return Swal.showValidationMessage("Lütfen şehir seçiniz!");
        return { text, ulkeId, sehirId };
      },
    });

    if (formValues) {
      const finalText = upperCaseTabs.includes(activeTab)
        ? formValues.text.toLocaleUpperCase("tr-TR")
        : formValues.text;
      const payload = { [currentTab.key]: finalText };
      if (activeTab === "uyruk" || activeTab === "sehir")
        payload.UlkeId = parseInt(formValues.ulkeId);
      if (activeTab === "ilce") payload.SehirId = parseInt(formValues.sehirId);

      try {
        let res;
        switch (activeTab) {
          case "uyruk":
            res = await tanimlamalarService.createUyruk(payload);
            break;
          case "ulke":
            res = await tanimlamalarService.createUlke(payload);
            break;
          case "sehir":
            res = await tanimlamalarService.createSehir(payload);
            break;
          case "ilce":
            res = await tanimlamalarService.createIlce(payload);
            break;
          case "dil":
            res = await tanimlamalarService.createDil(payload);
            break;
          case "kktc":
            res = await tanimlamalarService.createKktcBelge(payload);
            break;
          case "ehliyet":
            res = await tanimlamalarService.createEhliyetTuru(payload);
            break;
        }
        if (res?.success) {
          toast.success("Başarıyla eklendi.");
          fetchList();
        } else toast.error(res?.message || "Hata oluştu.");
      } catch {
        toast.error("İşlem sırasında bir hata oluştu.");
      }
    }
  };

  const handleEdit = async (item) => {
    if (activeTab === "kvkk") return await showKvkkModal(item);
    const currentVal = getValue(item, currentTab.key);
    const { value: newText } = await Swal.fire({
      title: `<span class="text-xl font-black text-gray-800 uppercase tracking-tighter">DÜZENLE</span>`,
      input: "text",
      inputValue: currentVal,
      showCancelButton: true,
      confirmButtonText: "Güncelle",
      confirmButtonColor: "#f59e0b",
      customClass: {
        popup: "rounded-[2rem]",
        input: "swal2-modern-input uppercase font-bold",
      },
      didOpen: (popup) => {
        const input = popup.querySelector(".swal2-input");
        if (input && upperCaseTabs.includes(activeTab)) {
          input.addEventListener(
            "input",
            (e) => (e.target.value = e.target.value.toLocaleUpperCase("tr-TR")),
          );
        }
      },
    });

    if (newText && newText !== currentVal) {
      const finalText = upperCaseTabs.includes(activeTab)
        ? newText.toLocaleUpperCase("tr-TR")
        : newText;
      const payload = { id: item.id, [currentTab.key]: finalText };
      if (activeTab === "uyruk" || activeTab === "sehir")
        payload.UlkeId = item.UlkeId || item.ulkeId;
      if (activeTab === "ilce") payload.SehirId = item.SehirId || item.sehirId;
      try {
        let res;
        switch (activeTab) {
          case "uyruk":
            res = await tanimlamalarService.updateUyruk(payload);
            break;
          case "ulke":
            res = await tanimlamalarService.updateUlke(payload);
            break;
          case "sehir":
            res = await tanimlamalarService.updateSehir(payload);
            break;
          case "ilce":
            res = await tanimlamalarService.updateIlce(payload);
            break;
          case "dil":
            res = await tanimlamalarService.updateDil(payload);
            break;
          case "kktc":
            res = await tanimlamalarService.updateKktcBelge(payload);
            break;
          case "ehliyet":
            res = await tanimlamalarService.updateEhliyetTuru(payload);
            break;
        }
        if (res?.success) {
          toast.success("Güncellendi");
          fetchList();
        } else toast.error(res?.message);
      } catch {
        toast.error("Hata.");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Silinsin mi?",
      text: "Bu işlem geri alınamaz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Evet, Sil",
      customClass: { popup: "rounded-[2rem]" },
    });
    if (result.isConfirmed) {
      try {
        let res;
        switch (activeTab) {
          case "uyruk":
            res = await tanimlamalarService.deleteUyruk(id);
            break;
          case "ulke":
            res = await tanimlamalarService.deleteUlke(id);
            break;
          case "sehir":
            res = await tanimlamalarService.deleteSehir(id);
            break;
          case "ilce":
            res = await tanimlamalarService.deleteIlce(id);
            break;
          case "dil":
            res = await tanimlamalarService.deleteDil(id);
            break;
          case "kktc":
            res = await tanimlamalarService.deleteKktcBelge(id);
            break;
          case "ehliyet":
            res = await tanimlamalarService.deleteEhliyetTuru(id);
            break;
          case "kvkk":
            res = await tanimlamalarService.deleteKvkk(id);
            break;
        }
        if (res?.success) {
          toast.success("Silindi.");
          fetchList();
        } else toast.error(res?.message || "Silinemedi.");
      } catch {
        toast.error("Hata.");
      }
    }
  };

  const requestSort = (key) =>
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });

  const processedList = useMemo(() => {
    let filtered = list.filter((item) =>
      (getValue(item, currentTab.key) || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

    // Filtreleme Mantığı
    if (activeTab === "uyruk" || activeTab === "sehir") {
      if (filterUlkeId) {
        filtered = filtered.filter(
          (i) => (i.UlkeId || i.ulkeId) === parseInt(filterUlkeId),
        );
      }
    } else if (activeTab === "ilce") {
      // Önce seçili ülke varsa, o ülkeye ait tüm ilçeleri getir (Şehir filtresinden bağımsız)
      if (filterUlkeId) {
        // İlçe nesnesi içindeki Şehir bilgisini bulup onun UlkeId'sine bakıyoruz
        filtered = filtered.filter((i) => {
          const sehir = lookups.sehirler.find(
            (s) => s.id === (i.SehirId || i.sehirId),
          );
          return (
            sehir && (sehir.UlkeId || sehir.ulkeId) === parseInt(filterUlkeId)
          );
        });
      }
      // Eğer spesifik bir şehir de seçildiyse ona göre daralt
      if (filterSehirId) {
        filtered = filtered.filter(
          (i) => (i.SehirId || i.sehirId) === parseInt(filterSehirId),
        );
      }
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA =
          sortConfig.key === "name" ? getValue(a, currentTab.key) : a.id;
        let valB =
          sortConfig.key === "name" ? getValue(b, currentTab.key) : b.id;
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        return valA < valB
          ? sortConfig.direction === "asc"
            ? -1
            : 1
          : sortConfig.direction === "asc"
            ? 1
            : -1;
      });
    }
    return filtered;
  }, [
    list,
    searchTerm,
    sortConfig,
    currentTab,
    filterUlkeId,
    filterSehirId,
    activeTab,
    lookups.sehirler,
  ]);

  const paginatedList = processedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(processedList.length / itemsPerPage);
  const getSortIcon = (key) =>
    sortConfig.key !== key ? (
      <FontAwesomeIcon
        icon={faSort}
        className="text-gray-300 opacity-50 ml-1"
      />
    ) : (
      <FontAwesomeIcon
        icon={
          sortConfig.direction === "asc" ? faSortAmountUp : faSortAmountDown
        }
        className="text-emerald-600 ml-1"
      />
    );

  // Filtre Alanı Componenti
  const filterDropdown = useMemo(() => {
    const commonSelectClass =
      "pl-9 pr-8 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase text-gray-500 outline-none focus:ring-4 focus:ring-emerald-50 transition-all cursor-pointer appearance-none min-w-[180px]";

    if (activeTab === "ilce") {
      return (
        <div className="flex gap-2">
          {/* Ülke Filtresi */}
          <div className="relative flex items-center">
            <FontAwesomeIcon
              icon={faGlobe}
              className="absolute left-3 text-gray-400 z-10 text-[10px]"
            />
            <select
              value={filterUlkeId}
              onChange={(e) => {
                setFilterUlkeId(e.target.value);
                setFilterSehirId("");
              }}
              className={commonSelectClass}
            >
              <option value="">TÜM ÜLKELER</option>
              {lookups.ulkeler.map((u) => (
                <option key={u.id || u.Id} value={u.id || u.Id}>
                  {u.UlkeAdi || u.ulkeAdi}
                </option>
              ))}
            </select>
            {filterUlkeId && (
              <button
                onClick={() => {
                  setFilterUlkeId("");
                  setFilterSehirId("");
                }}
                className="absolute right-2 text-rose-500 bg-rose-50 w-5 h-5 rounded-full flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
              </button>
            )}
          </div>

          {/* Bağımlı Şehir Filtresi */}
          <div className="relative flex items-center">
            <FontAwesomeIcon
              icon={faCity}
              className="absolute left-3 text-gray-400 z-10 text-[10px]"
            />
            <select
              value={filterSehirId}
              onChange={(e) => setFilterSehirId(e.target.value)}
              className={commonSelectClass}
            >
              <option value="">TÜM ŞEHİRLER</option>
              {lookups.sehirler
                .filter(
                  (s) =>
                    !filterUlkeId ||
                    (s.UlkeId || s.ulkeId) === parseInt(filterUlkeId),
                )
                .map((s) => (
                  <option key={s.id || s.Id} value={s.id || s.Id}>
                    {s.SehirAdi || s.sehirAdi}
                  </option>
                ))}
            </select>
            {filterSehirId && (
              <button
                onClick={() => setFilterSehirId("")}
                className="absolute right-2 text-rose-500 bg-rose-50 w-5 h-5 rounded-full flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
              </button>
            )}
          </div>
        </div>
      );
    }

    if (["sehir", "uyruk"].includes(activeTab)) {
      return (
        <div className="relative flex items-center">
          <FontAwesomeIcon
            icon={faFilter}
            className="absolute left-3 text-gray-400 z-10 text-xs"
          />
          <select
            value={filterUlkeId}
            onChange={(e) => setFilterUlkeId(e.target.value)}
            className={commonSelectClass}
          >
            <option value="">TÜM ÜLKELER</option>
            {lookups.ulkeler.map((u) => (
              <option key={u.id || u.Id} value={u.id || u.Id}>
                {u.UlkeAdi || u.ulkeAdi}
              </option>
            ))}
          </select>
          {filterUlkeId && (
            <button
              onClick={() => setFilterUlkeId("")}
              className="absolute right-2 text-rose-500 bg-rose-50 w-5 h-5 rounded-full flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
            </button>
          )}
        </div>
      );
    }
    return null;
  }, [activeTab, filterUlkeId, filterSehirId, lookups]);

  const isAddDisabled = activeTab === "kvkk" && list.length > 0;

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-sm border p-6 border-b-4 border-b-emerald-600 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/panel")}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-emerald-600 hover:text-white transition-all border shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
              Form <span className="text-emerald-600">Tanımları</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Coğrafi & İdari Veriler
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {filterDropdown}
          <div className="relative group">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-50 transition-all font-bold w-64"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={isAddDisabled}
            className={`px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all ${isAddDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
          >
            <FontAwesomeIcon icon={faPlus} /> {currentTab.single} Ekle
          </button>
        </div>
      </div>

      <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? "bg-emerald-600 text-white shadow-xl shadow-emerald-100 scale-105" : "text-gray-400 hover:bg-gray-50"}`}
          >
            <FontAwesomeIcon icon={tab.icon} className="text-xs" /> {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-4xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b">
                <th
                  onClick={() => requestSort("id")}
                  className="py-5 px-10 text-[10px] font-black text-gray-400 uppercase w-24 cursor-pointer hover:text-emerald-600 transition-colors"
                >
                  ID {getSortIcon("id")}
                </th>
                {activeTab === "kvkk" ? (
                  <>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase">
                      Versiyon
                    </th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase">
                      Aydınlatma Metni
                    </th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase">
                      Doğruluk Beyanı
                    </th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase">
                      Referans
                    </th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase text-center">
                      Tarih
                    </th>
                  </>
                ) : (
                  <th
                    onClick={() => requestSort("name")}
                    className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:text-emerald-600 transition-colors"
                  >
                    Tanım Bilgisi {getSortIcon("name")}
                  </th>
                )}

                {/* Dinamik İlişki Başlıkları */}
                {activeTab === "uyruk" && (
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase">
                    <FontAwesomeIcon icon={faGlobe} className="mr-1" /> Bağlı
                    Ülke
                  </th>
                )}
                {activeTab === "sehir" && (
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase">
                    <FontAwesomeIcon icon={faGlobe} className="mr-1" /> Bağlı
                    Ülke
                  </th>
                )}
                {activeTab === "ilce" && (
                  <>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase">
                      <FontAwesomeIcon icon={faCity} className="mr-1" /> Bağlı
                      Şehir
                    </th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase">
                      <FontAwesomeIcon icon={faGlobe} className="mr-1" /> Bağlı
                      Ülke
                    </th>
                  </>
                )}

                <th className="py-5 px-10 text-[10px] font-black text-gray-400 uppercase text-right">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-20 text-center">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="p-20 text-center text-xs font-black text-gray-300 uppercase tracking-widest"
                  >
                    Kayıt Bulunamadı
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/30 transition-all group"
                  >
                    <td className="py-5 px-10">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100 font-mono">
                        #{item.id}
                      </span>
                    </td>
                    {activeTab === "kvkk" ? (
                      <>
                        <td className="py-5 px-6 text-sm font-black text-gray-800">
                          {item.KvkkVersiyon || item.kvkkVersiyon}
                        </td>
                        <td className="py-5 px-6 text-xs text-gray-600 max-w-xs">
                          {truncateText(item.KvkkAciklama || item.kvkkAciklama)}
                        </td>
                        <td className="py-5 px-6 text-xs text-gray-600 max-w-xs">
                          {truncateText(
                            item.DogrulukAciklama || item.dogrulukAciklama,
                          )}
                        </td>
                        <td className="py-5 px-6 text-xs text-gray-600 max-w-xs">
                          {truncateText(
                            item.ReferansAciklama || item.referansAciklama,
                          )}
                        </td>
                        <td className="py-5 px-6 text-xs font-black text-gray-400 text-center">
                          {item.GuncellemeTarihi || item.guncellemeTarihi
                            ? new Date(
                                item.GuncellemeTarihi || item.guncellemeTarihi,
                              ).toLocaleDateString("tr-TR")
                            : "-"}
                        </td>
                      </>
                    ) : (
                      <td className="py-5 px-6 text-sm font-black text-gray-800 uppercase tracking-tight">
                        {getValue(item, currentTab.key)}
                      </td>
                    )}

                    {/* İlişki Verileri */}
                    {activeTab === "uyruk" && (
                      <td className="py-5 px-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                          {item.UlkeAdi || item.ulkeAdi || "Belirsiz"}
                        </span>
                      </td>
                    )}
                    {activeTab === "sehir" && (
                      <td className="py-5 px-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                          {item.UlkeAdi || item.ulkeAdi || "-"}
                        </span>
                      </td>
                    )}
                    {activeTab === "ilce" && (
                      <>
                        <td className="py-5 px-6">
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase">
                            {item.SehirAdi || item.sehirAdi || "-"}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                            {(() => {
                              const sehir = lookups.sehirler.find(
                                (s) => s.id === (item.SehirId || item.sehirId),
                              );
                              if (sehir) {
                                const ulke = lookups.ulkeler.find(
                                  (u) =>
                                    u.id === (sehir.UlkeId || sehir.ulkeId),
                                );
                                return ulke
                                  ? ulke.UlkeAdi || ulke.ulkeAdi
                                  : "-";
                              }
                              return "-";
                            })()}
                          </span>
                        </td>
                      </>
                    )}

                    <td className="py-5 px-10 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        title="Düzenle"
                        className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                      >
                        <FontAwesomeIcon
                          icon={activeTab === "kvkk" ? faEye : faEdit}
                          className="text-xs"
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Sil"
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50/50 border-t flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-gray-400 uppercase">
              Göster:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold shadow-sm outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-[10px] text-gray-400 font-bold ml-2 hidden sm:inline uppercase tracking-widest">
              Toplam {processedList.length} Kayıt
            </span>
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 bg-white border rounded-xl text-[10px] font-black disabled:opacity-30 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
            >
              GERİ
            </button>
            <div className="flex items-center px-4 text-xs font-black text-emerald-600 bg-emerald-50 rounded-xl shadow-inner">
              {currentPage} / {totalPages || 1}
            </div>
            <button
              disabled={currentPage * itemsPerPage >= processedList.length}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 bg-white border rounded-xl text-[10px] font-black disabled:opacity-30 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
            >
              İLERİ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// KVKK Modal
const showKvkkModal = async (item = null) => {
  const isEdit = !!item;
  const { value: formValues } = await Swal.fire({
    title: isEdit ? "KVKK Düzenle" : "Yeni KVKK",
    width: "800px",
    html: `
        <div class="space-y-4 text-left p-2">
            <div><label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Aydınlatma Metni</label>
            <textarea id="kvkk-aciklama" class="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-sm font-medium">${item?.KvkkAciklama || item?.kvkkAciklama || ""}</textarea></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Doğruluk Beyanı</label>
                <textarea id="kvkk-dogruluk" class="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-sm font-medium">${item?.DogrulukAciklama || item?.dogrulukAciklama || ""}</textarea></div>
                <div><label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Referans</label>
                <textarea id="kvkk-referans" class="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all text-sm font-medium">${item?.ReferansAciklama || item?.referansAciklama || ""}</textarea></div>
            </div>
        </div>`,
    showCancelButton: true,
    confirmButtonText: "Kaydet",
    confirmButtonColor: "#3b82f6",
    cancelButtonText: "Vazgeç",
    customClass: { popup: "rounded-[2rem]" },
    preConfirm: () => {
      const aciklama = document.getElementById("kvkk-aciklama").value;
      const dogruluk = document.getElementById("kvkk-dogruluk").value;
      const referans = document.getElementById("kvkk-referans").value;
      if (!aciklama || !dogruluk || !referans) {
        Swal.showValidationMessage("Lütfen tüm alanları doldurunuz.");
        return false;
      }
      return {
        KvkkAciklama: aciklama,
        DogrulukAciklama: dogruluk,
        ReferansAciklama: referans,
      };
    },
  });

  if (formValues) {
    const res = isEdit
      ? await tanimlamalarService.updateKvkk({ ...formValues, Id: item.id })
      : await tanimlamalarService.createKvkk(formValues);
    if (res.success) {
      toast.success("İşlem başarılı.");
      return res;
    } else toast.error(res.message);
  }
};
