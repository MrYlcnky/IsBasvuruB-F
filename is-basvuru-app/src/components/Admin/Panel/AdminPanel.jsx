import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  faEye,
  faMagnifyingGlass,
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faUser,
  faSliders,
  faXmarkCircle,
  faSearch,
  faFilePdf,
  faUserTie,
  faFlagCheckered,
  faArrowRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ApplicationModal from "./ApplicationModal";

// --- API SERVİSİ ---
import { basvuruService } from "../../../services/basvuruService";
import CVViewModal from "./CVViewModal";
import { formatDate } from "../../../utils/dateFormatter";

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

// --- SAYFALAMA MANTIĞI ---
const getPaginationRange = (currentPage, totalPages, siblingCount = 1) => {
  currentPage = currentPage + 1;
  const totalPageNumbers = siblingCount + 5;
  if (totalPageNumbers >= totalPages)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [firstPageIndex, "...", ...rightRange];
  }
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = [];
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      middleRange.push(i);
    }
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

/* -------------------- Yardımcı UI Bileşenleri -------------------- */
function StatusBadge({ status }) {
  const map = {
    Onaylanan: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Onaylandı: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Reddedilen: "bg-rose-100 text-rose-800 border-rose-300",
    Reddedildi: "bg-rose-100 text-rose-800 border-rose-300",
    Bekleyen: "bg-amber-100 text-amber-800 border-amber-300",
    "Beklemede": "bg-amber-100 text-amber-800 border-amber-300",
    "Revize Talebi": "bg-blue-100 text-blue-800 border-blue-300",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border  ${
        map[status] || "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      {status || "Bilinmiyor"}
    </span>
  );
}

function CurrentStageBadge({ stage, status }) {
  if (
    status === "Onaylanan" ||
    status === "Onaylandı" ||
    status === "Reddedilen" ||
    status === "Reddedildi"
  )
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <FontAwesomeIcon icon={faFlagCheckered} className="text-emerald-500" />{" "}
        Süreç Tamamlandı
      </span>
    );
  if (status === "Revize Talebi")
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
        <FontAwesomeIcon icon={faUserTie} /> İK (Revize)
      </span>
    );

  const stageMap = {
    departman_muduru: {
      label: "Departman Müdürü",
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    genel_mudur: {
      label: "Genel Müdür",
      color: "text-orange-700 bg-orange-50 border-orange-200",
    },
    ik: {
      label: "İnsan Kaynakları",
      color: "text-sky-700 bg-sky-50 border-sky-200",
    },
    tamamlandi: { label: "Tamamlandı", color: "text-gray-500" },
  };

  const info = stageMap[stage] || {
    label: stage || "Başlangıç",
    color: "text-gray-500",
  };

  return (
    <span
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-bold whitespace-nowrap ${info.color}`}
    >
      <FontAwesomeIcon icon={faUserTie} /> {info.label}
    </span>
  );
}

function ListCell({ items = [], max = 2 }) {
  const visible = items.slice(0, max);
  const extra = Math.max(0, items.length - max);
  const title = items.join(", ");
  return (
    <div className="flex items-center gap-1 flex-wrap" title={title}>
      {visible.map((it, idx) => (
        <span
          key={idx}
          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
        >
          {it}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
          +{extra}
        </span>
      )}
    </div>
  );
}

const initialFilterState = {
  ageMin: "",
  ageMax: "",
  branch: "all",
  area: "all",
  department: "all",
  role: "all",
  education: "all",
  gender: "all",
};

export default function AdminPanel() {
  const location = useLocation();

  // Auth state
  const auth = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("authUser");
      return raw
        ? JSON.parse(raw)
        : { name: "Admin", role: "admin", email: "admin@example.com" };
    } catch {
      return null;
    }
  }, []);

  const isAllAccess = useMemo(
    () => ["ik_spv", "ik_user", "admin", "IT"].includes(auth?.role || "admin"),
    [auth]
  );

  const userBranch = useMemo(
    () => (!isAllAccess ? auth?.branch : "all"),
    [auth, isAllAccess]
  );

  const canSeeRevisionTab = useMemo(
    () => ["ik_spv", "admin", "IT"].includes(auth?.role || "admin"),
    [auth]
  );

  const allBranches = ["Girne", "Prestige"];

  const [globalFilter, setGlobalFilter] = useState("");
  const [tab, setTab] = useState("all");
  const [pageInput, setPageInput] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state && location.state.targetTab) {
      setTab(location.state.targetTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterPanelRef = useRef(null);
  const [filters, setFilters] = useState({
    ...initialFilterState,
    branch: userBranch,
  });
  const [activeFilters, setActiveFilters] = useState({
    ...initialFilterState,
    branch: userBranch,
  });

  useOutsideAlerter(filterPanelRef, () => setIsFilterOpen(false));

  const [openModal, setOpenModal] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [applicationData, setApplicationData] = useState([]);

  // --- API VERİ ÇEKME FONKSİYONU ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await basvuruService.getAll();

      // Backend response yapısına göre düzenleme
      const rawData = response.data || response || [];
      const dataArray = Array.isArray(rawData) ? rawData : rawData.data || [];

      const mappedData = dataArray.map((item) => ({
        id: item.id,
        name: item.personel
          ? `${item.personel.ad} ${item.personel.soyad}`
          : "İsimsiz",
        personal: {
          foto: item.personel?.fotografUrl || null,
          cinsiyet: item.personel?.cinsiyet || "Belirtilmemiş",
          // Yaş hesabı için dogumTarihi eklenebilir
          dogumTarihi: item.personel?.dogumTarihi || null,
        },
        date: item.basvuruTarihi,
        status: item.basvuruDurum || "Beklemede",
        approvalStage: item.onayAsamasi || "ik",
        branches: item.basvuruDetay?.subeler || [],
        areas: item.basvuruDetay?.alanlar || [],
        roles: item.basvuruDetay?.pozisyonlar || [],
        departments: item.basvuruDetay?.departmanlar || [],
        education: item.egitimBilgileri || [],
        originalData: item,
      }));

      setApplicationData(mappedData);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      toast.error("Başvurular yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleUpdateSignal = () => fetchData();
    window.addEventListener("applicationsUpdated", handleUpdateSignal);
    return () => {
      window.removeEventListener("applicationsUpdated", handleUpdateSignal);
    };
  }, []);

  const allDeptRolePairs = useMemo(
    () =>
      applicationData.flatMap((d) => d.jobDetails?.departmanPozisyonlari || []),
    [applicationData]
  );
  const dynamicDepartments = useMemo(
    () => [...new Set(allDeptRolePairs.map((p) => p.dept))].sort(),
    [allDeptRolePairs]
  );
  const dynamicRolesForSelectedDept = useMemo(() => {
    if (filters.department === "all")
      return [...new Set(allDeptRolePairs.map((p) => p.label))].sort();
    return [
      ...new Set(
        allDeptRolePairs
          .filter((p) => p.dept === filters.department)
          .map((p) => p.label)
      ),
    ].sort();
  }, [filters.department, allDeptRolePairs]);
  const dynamicEducationLevels = useMemo(
    () =>
      [
        ...new Set(
          applicationData.flatMap(
            (d) => d.education?.map((e) => e.seviye) || []
          )
        ),
      ].sort(),
    [applicationData]
  );

  const handleViewDetails = (row) => {
    setActiveRow(row);
    setOpenModal(true);
  };
  const handleViewCV = () => {
    setIsCVModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Başvuru No",
        cell: (info) => (
          <span className="font-medium text-gray-900">#{info.getValue()}</span>
        ),
      },
      {
        id: "profile",
        header: "Profil",
        meta: {
          thClassName: "w-24 px-4 text-center",
          tdClassName: "w-24 px-4",
        },
        cell: ({ row }) => {
          const fotoUrl = row.original.personal?.foto;
          return (
            <div className="flex items-center justify-center w-10 h-10">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={row.original.name}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer transition-transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage(fotoUrl);
                  }}
                />
              ) : (
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-500">
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Ad Soyad",
        cell: (info) => (
          <div
            className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => handleViewDetails(info.row.original)}
            title="Başvuru detayını aç"
          >
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "branches",
        header: "Şubeler",
        cell: (info) => <ListCell items={info.getValue()} />,
      },
      {
        accessorKey: "areas",
        header: "Alanlar",
        cell: (info) => <ListCell items={info.getValue()} />,
      },
      {
        accessorKey: "roles",
        header: "Pozisyonlar",
        cell: (info) => <ListCell items={info.getValue()} max={1} />,
      },
      {
        accessorKey: "date",
        header: "Tarih",
        cell: (info) => (
          <span className="text-gray-600 whitespace-nowrap">
            {formatDate(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Durum",
        meta: { thClassName: "w-32 px-4", tdClassName: "w-32 px-4" },
        cell: (info) => <StatusBadge status={info.getValue()} />,
      },
      {
        id: "currentStage",
        header: "Onay Sırası",
        sortingFn: (rowA, rowB, columnId) => {
          const stageOrder = {
            departman_muduru: 1,
            genel_mudur: 2,
            ik: 3,
            tamamlandi: 4,
          };
          return (
            (stageOrder[rowA.getValue(columnId)] || 99) -
            (stageOrder[rowB.getValue(columnId)] || 99)
          );
        },
        cell: ({ row }) => (
          <CurrentStageBadge
            stage={row.original.approvalStage}
            status={row.original.status}
          />
        ),
      },
      {
        id: "actions",
        header: "İşlemler",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => handleViewCV()}
              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
            >
              <FontAwesomeIcon icon={faFilePdf} />
            </button>
            <button
              onClick={() => handleViewDetails(row.original)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 transition-all"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "department") setFilters((prev) => ({ ...prev, role: "all" }));
  };
  const handleApplyFilters = () => {
    setActiveFilters(filters);
    setIsFilterOpen(false);
  };
  const clearFilters = () => {
    setFilters({ ...initialFilterState, branch: userBranch });
    setActiveFilters({ ...initialFilterState, branch: userBranch });
    setIsFilterOpen(false);
  };

  const preFilteredData = useMemo(() => {
    const isDefault =
      JSON.stringify(activeFilters) ===
      JSON.stringify({ ...initialFilterState, branch: userBranch });
    let dataToFilter = applicationData;

    if (!isAllAccess) {
      dataToFilter = dataToFilter.filter((app) =>
        (app.branches || []).includes(auth.branch)
      );
    }

    if (isDefault && tab === "all") return dataToFilter;

    return dataToFilter.filter((row) => {
      // DÜZELTME: ageMin ve ageMax kullanılmadığı için buradan kaldırıldı
      const {
        branch,
        area,
        department,
        role,
        education,
        gender,
      } = activeFilters;

      if (tab !== "all") {
        const statusMap = {
          pending: ["Bekleyen", "Beklemede"],
          approved: ["Onaylanan", "Onaylandı"],
          rejected: ["Reddedilen", "Reddedildi"],
          revision: ["Revize Talebi"],
        };
        if (!statusMap[tab]?.includes(row.status)) return false;
      }
      if (branch !== "all" && !row.branches?.includes(branch)) return false;
      if (area !== "all" && !row.areas?.includes(area)) return false;
      if (department !== "all" && !row.departments?.includes(department))
        return false;
      if (role !== "all" && !row.roles?.includes(role)) return false;
      if (gender !== "all" && row.personal?.cinsiyet !== gender) return false;
      if (
        education !== "all" &&
        !row.education?.some((e) => e.seviye === education)
      )
        return false;

      // Yaş filtresi eklenecekse burada birthDate üzerinden hesaplanıp kontrol edilebilir.
      return true;
    });
  }, [
    applicationData,
    activeFilters,
    tab,
    isAllAccess,
    auth.branch,
    userBranch,
  ]);

  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([{ id: "date", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: preFilteredData,
    columns,
    state: { globalFilter, columnFilters, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // DÜZELTME: Gereksiz useEffect bloğu kaldırıldı (Error 3 & 4 Fixed)

  // Input State Güncelleme
  useEffect(() => {
    setPageInput(pagination.pageIndex + 1);
    // DÜZELTME: Bağımlılık dizisi düzeltildi (Error 5 & 6 Fixed)
  }, [pagination.pageIndex]);

  const handleGoToPage = () => {
    const page = pageInput ? Number(pageInput) - 1 : 0;
    if (page >= 0 && page < table.getPageCount()) {
      table.setPageIndex(page);
    } else {
      setPageInput(table.getState().pagination.pageIndex + 1);
    }
  };

  const handleModalAction = async (actionType, note) => {
    if (!activeRow) return;

    toast.info("İşlem gerçekleştiriliyor...");

    try {
      const result = await basvuruService.updateStatus(activeRow.id, {
        action: actionType,
        note: note,
        user: auth.name,
      });

      if (result || result.success) {
        let title = "İşlem Başarılı";
        let icon = "success";

        if (actionType === "approve") title = "Başvuru Onaylandı";
        else if (actionType === "reject") {
          title = "Başvuru Reddedildi";
          icon = "error";
        }

        Swal.fire({
          title: title,
          text: "İşlem başarıyla kaydedildi.",
          icon: icon,
          timer: 1500,
          showConfirmButton: false,
          background: "#1F2937",
          color: "#E5E7EB",
        });

        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "İşlem sırasında bir hata oluştu: " +
          (error.response?.data?.message || error.message)
      );
    }

    setOpenModal(false);
    setActiveRow(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="3x"
            className="text-blue-600 mb-4"
          />
          <p className="text-gray-600 font-medium">Veriler Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <style>{`input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>

        {/* ÜST PANEL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                Başvuru Yönetimi
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Toplam {preFilteredData.length} başvuru görüntüleniyor
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-1 bg-gray-100/80 p-1.5 rounded-xl ">
              {[
                { id: "all", label: "Tümü", show: true },
                { id: "pending", label: "Bekleyen", show: true },
                {
                  id: "revision",
                  label: "Revize Talebi",
                  show: canSeeRevisionTab,
                },
                { id: "approved", label: "Onaylanan", show: true },
                { id: "rejected", label: "Reddedilen", show: true },
              ]
                .filter((t) => t.show)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`grow px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                      tab === t.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Hızlı ara (isim, no...)"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none transition-all hover:border-black focus:border-black focus:ring-0"
              />
            </div>
            <div className="relative" ref={filterPanelRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full lg:w-auto px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faSliders} />
                <span>Gelişmiş Filtrele</span>
              </button>
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-full lg:w-120 z-50 bg-white border border-gray-300 rounded-xl shadow-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-500 border-b border-gray-200 pb-2">
                        Pozisyon Bilgileri
                      </h4>
                      <FilterInput
                        label="Şube"
                        name="branch"
                        value={filters.branch}
                        onChange={handleFilterChange}
                        type="select"
                        disabled={!isAllAccess}
                      >
                        {isAllAccess && (
                          <option value="all">Tüm Şubeler</option>
                        )}
                        {allBranches.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </FilterInput>
                      <FilterInput
                        label="Alan"
                        name="area"
                        value={filters.area}
                        onChange={handleFilterChange}
                        type="select"
                      >
                        <option value="all">Tüm Alanlar</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Casino">Casino</option>
                      </FilterInput>
                      <FilterInput
                        label="Departman"
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                        type="select"
                      >
                        <option value="all">Tüm Departmanlar</option>
                        {dynamicDepartments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </FilterInput>
                      <FilterInput
                        label="Pozisyon"
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                        type="select"
                      >
                        <option value="all">Tüm Pozisyonlar</option>
                        {dynamicRolesForSelectedDept.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </FilterInput>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-500 border-b border-gray-200 pb-2">
                        Aday Bilgileri
                      </h4>
                      <div className="flex gap-2">
                        <FilterInput
                          label="Min Yaş"
                          name="ageMin"
                          value={filters.ageMin}
                          onChange={handleFilterChange}
                          type="number"
                          placeholder="Örn: 25"
                        />
                        <FilterInput
                          label="Maks Yaş"
                          name="ageMax"
                          value={filters.ageMax}
                          onChange={handleFilterChange}
                          type="number"
                          placeholder="Örn: 40"
                        />
                      </div>
                      <FilterInput
                        label="Cinsiyet"
                        name="gender"
                        value={filters.gender}
                        onChange={handleFilterChange}
                        type="select"
                      >
                        <option value="all">Tümü</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                      </FilterInput>
                      <FilterInput
                        label="Eğitim Seviyesi"
                        name="education"
                        value={filters.education}
                        onChange={handleFilterChange}
                        type="select"
                      >
                        <option value="all">Tümü</option>
                        {dynamicEducationLevels.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </FilterInput>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faXmarkCircle} />
                      Temizle
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faSearch} />
                      Ara
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABLO ALANI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/75 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`py-4 text-[13px] font-semibold text-gray-600 uppercase tracking-wider select-none whitespace-nowrap ${
                          header.column.columnDef.meta?.thClassName || "px-6"
                        }`}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-2 ${
                              header.column.getCanSort()
                                ? "cursor-pointer hover:text-gray-900"
                                : ""
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <FontAwesomeIcon icon={faSortUp} />,
                              desc: <FontAwesomeIcon icon={faSortDown} />,
                            }[header.column.getIsSorted()] ??
                              (header.column.getCanSort() ? (
                                <FontAwesomeIcon
                                  icon={faSort}
                                  className="text-gray-300 opacity-0 group-hover:opacity-100"
                                />
                              ) : null)}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Filtre ile eşleşen kayıt bulunamadı.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="even:bg-gray-50/60 hover:bg-gray-100 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`py-4 text-sm text-gray-600 ${
                            cell.column.columnDef.meta?.tdClassName || "px-6"
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- MODERN PAGINATION --- */}
          {table.getRowModel().rows.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 order-2 sm:order-1">
                Toplam{" "}
                <strong>{table.getFilteredRowModel().rows.length}</strong> kayıt
              </div>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="w-9 h-9 flex items-center justify-center text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FontAwesomeIcon icon={faChevronLeft} size="xs" />
                </button>

                {getPaginationRange(
                  table.getState().pagination.pageIndex,
                  table.getPageCount()
                ).map((page, index) => {
                  const isCurrent =
                    page === table.getState().pagination.pageIndex + 1;
                  if (page === "...")
                    return (
                      <span
                        key={index}
                        className="w-9 h-9 flex items-center justify-center text-sm font-medium text-gray-400"
                      >
                        ...
                      </span>
                    );
                  return (
                    <button
                      key={index}
                      onClick={() => table.setPageIndex(page - 1)}
                      className={`w-9 h-9 flex items-center justify-center text-sm font-medium border rounded-lg transition-all ${
                        isCurrent
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="w-9 h-9 flex items-center justify-center text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FontAwesomeIcon icon={faChevronRight} size="xs" />
                </button>

                {/* Hızlı Git (Input + Buton) */}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-400 transition-all shadow-sm group">
                    <input
                      type="number"
                      min="1"
                      max={table.getPageCount()}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleGoToPage();
                      }}
                      placeholder="#"
                      className="w-8 h-7 text-center text-xs font-semibold text-gray-700 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-300"
                    />
                    <button
                      onClick={handleGoToPage}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-all active:scale-95 cursor-pointer"
                      title="Git"
                    >
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="w-3 h-3"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 order-3">
                <span className="text-xs text-gray-500 hidden sm:inline">
                  Göster:
                </span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="text-xs bg-white border border-gray-300 text-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer shadow-sm"
                >
                  {[5, 10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {openModal && activeRow && (
        <ApplicationModal
          data={activeRow}
          auth={auth}
          currentStage={activeRow.approvalStage}
          onClose={() => {
            setOpenModal(false);
            setActiveRow(null);
          }}
          onAction={handleModalAction}
        />
      )}
      {isCVModalOpen && <CVViewModal onClose={() => setIsCVModalOpen(false)} />}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Profil Fotoğrafı Büyütülmüş"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function FilterInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  children,
  ...props
}) {
  const commonClasses =
    "w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none transition-all hover:border-black focus:border-black focus:ring-0";
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-xs font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={commonClasses + " cursor-pointer"}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={commonClasses}
          {...props}
        />
      )}
    </div>
  );
}