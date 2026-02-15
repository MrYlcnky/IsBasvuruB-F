import React, { useState, useEffect, useCallback, useMemo } from "react";
import { tanimlamalarService } from "../../../services/tanimlamalarService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faLayerGroup,
  faMapMarkerAlt,
  faArrowLeft,
  faBriefcase,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faEdit,
  faSortAmountDown,
  faSortAmountUp,
  faFilter,
  faLink,
  faTags,
  faSitemap,
  faGamepad,
  faLaptopCode,
  faSave,
  faArrowRight,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function CompanyOrganization() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sirket");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Veri Listeleri
  const [sirketList, setSirketList] = useState([]);
  const [oyunList, setOyunList] = useState([]);
  const [programList, setProgramList] = useState([]);

  // Lookup (Referans) Verileri
  const [lookups, setLookups] = useState({
    subeler: [],
    masterAlanlar: [],
    masterDepartmanlar: [],
    masterPozisyonlar: [],
    subeAlanlar: [],
    departmanlar: [],
    masterOyunlar: [],
    masterProgramlar: [],
  });

  // Seçim State'leri
  const [selections, setSelections] = useState({
    subeId: "",
    subeAlanId: "",
    departmanId: "", // Şirket
    orgSubeId: "",
    orgDepartmanId: "",
    orgMasterId: "", // Oyun/Program
  });

  // Tablo Filtreleme
  const [filters, setFilters] = useState({
    sube: "",
    alan: "",
    departman: "",
    pozisyon: "",
    durum: "",
  });

  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  // --- SAYFALAMA STATE'LERİ ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- TAB TANIMLARI ---
  const tabs = [
    {
      id: "sirket",
      name: "Şirket Hiyerarşisi",
      icon: faSitemap,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-600",
      ring: "focus:ring-rose-500",
      btn: "bg-rose-600",
    },
    {
      id: "oyun",
      name: "Oyun Dağıtımı",
      icon: faGamepad,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-600",
      ring: "focus:ring-purple-500",
      btn: "bg-purple-600",
    },
    {
      id: "program",
      name: "Program Dağıtımı",
      icon: faLaptopCode,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-600",
      ring: "focus:ring-cyan-500",
      btn: "bg-cyan-600",
    },
  ];

  const currentTabInfo = tabs.find((t) => t.id === activeTab);

  const getSafeVal = (obj, key) => {
    if (!obj) return false;
    return obj[key] !== undefined
      ? obj[key]
      : obj[key.charAt(0).toLowerCase() + key.slice(1)];
  };

  // --- VERİ ÇEKME ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, ma, md, mp, sa, d, dp, mo, mprog, ob, pb] = await Promise.all([
        tanimlamalarService.getSubeler(),
        tanimlamalarService.getMasterAlanlar(),
        tanimlamalarService.getMasterDepartmanlar(),
        tanimlamalarService.getMasterPozisyonlar(),
        tanimlamalarService.getSubeAlanlar(),
        tanimlamalarService.getDepartmanlar(),
        tanimlamalarService.getDepartmanPozisyonlar(),
        tanimlamalarService.getAllMasterOyuns(),
        tanimlamalarService.getAllMasterPrograms(),
        tanimlamalarService.getOyunlar(),
        tanimlamalarService.getProgramlar(),
      ]);

      const loadedDepartmanlar = d.data || [];

      setLookups({
        subeler: s.data || [],
        masterAlanlar: ma.data || [],
        masterDepartmanlar: md.data || [],
        masterPozisyonlar: mp.data || [],
        subeAlanlar: sa.data || [],
        departmanlar: loadedDepartmanlar,
        masterOyunlar: mo.data || [],
        masterProgramlar: mprog.data || [],
      });

      // 1. Şirket Listesi
      const flatSirket = [];
      (sa.data || []).forEach((saItem) => {
        const ilgiliDeps = loadedDepartmanlar.filter(
          (dep) => (dep.SubeAlanId || dep.subeAlanId) === saItem.id,
        );
        if (ilgiliDeps.length === 0) {
          flatSirket.push(formatRowSirket(saItem));
        } else {
          ilgiliDeps.forEach((depItem) => {
            const ilgiliPozs = (dp.data || []).filter(
              (poz) => (poz.DepartmanId || poz.departmanId) === depItem.id,
            );
            if (ilgiliPozs.length === 0) {
              flatSirket.push(formatRowSirket(saItem, depItem));
            } else {
              ilgiliPozs.forEach((pozItem) => {
                flatSirket.push(formatRowSirket(saItem, depItem, pozItem));
              });
            }
          });
        }
      });
      setSirketList(flatSirket);

      // Helper
      const findSubeAdiByDeptId = (deptId) => {
        const dept = loadedDepartmanlar.find((d) => d.id === deptId);
        if (!dept) return "-";
        const subeAlan = (sa.data || []).find(
          (sa) => sa.id === (dept.SubeAlanId || dept.subeAlanId),
        );
        if (!subeAlan) return dept.SubeAdi || dept.subeAdi || "-";
        const sube = (s.data || []).find(
          (s) => s.id === (subeAlan.SubeId || subeAlan.subeId),
        );
        return sube ? sube.SubeAdi || sube.subeAdi : "-";
      };

      // 2. Oyun Listesi
      const enrichedOyunList = (ob.data || []).map((item) => ({
        ...item,
        subeAdi: findSubeAdiByDeptId(item.departmanId || item.DepartmanId),
      }));
      setOyunList(enrichedOyunList);

      // 3. Program Listesi
      const enrichedProgramList = (pb.data || []).map((item) => ({
        ...item,
        subeAdi: findSubeAdiByDeptId(item.departmanId || item.DepartmanId),
      }));
      setProgramList(enrichedProgramList);
    } catch (err) {
      console.error(err);
      toast.error("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const formatRowSirket = (sa, dep = null, poz = null) => {
    const sName = sa.SubeAdi || sa.subeAdi || "-";
    const aName =
      sa.AlanAdi || sa.alanAdi || sa.MasterAlanAdi || sa.masterAlanAdi || "-";
    const dName = dep ? dep.DepartmanAdi || dep.departmanAdi || "-" : "-";
    const pName = poz ? poz.PozisyonAdi || poz.pozisyonAdi || "-" : "-";

    const saStatus = getSafeVal(sa, "SubeAlanAktifMi") ?? true;
    const depStatus = dep
      ? (getSafeVal(dep, "DepartmanAktifMi") ?? true)
      : true;
    const pozStatus = poz
      ? (getSafeVal(poz, "DepartmanPozisyonAktifMi") ?? true)
      : true;

    return {
      id: poz?.id || dep?.id || sa.id,
      type: poz ? "Pozisyon" : dep ? "Departman" : "SubeAlan",
      rawIds: { saId: sa.id, depId: dep?.id, pozId: poz?.id },
      subeAdi: sName,
      alanAdi: aName,
      departmanAdi: dName,
      pozisyonAdi: pName,
      status: { sa: saStatus, dep: depStatus, poz: pozStatus },
      aktifMi: saStatus && depStatus && pozStatus,
      searchContent: `${sName} ${aName} ${dName} ${pName}`.toLowerCase(),
    };
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CRUD: DÜZENLEME ---
  const handleEditStatus = async (item) => {
    // 1. Şirket Sekmesi
    if (activeTab === "sirket") {
      const pozOptions = Object.fromEntries(
        lookups.masterPozisyonlar.map((x) => [
          x.id,
          x.MasterPozisyonAdi || x.masterPozisyonAdi,
        ]),
      );
      const { value: formValues } = await Swal.fire({
        title: '<span class="text-xl font-black">BAĞLANTIYI DÜZENLE</span>',
        html: `
            <div class="space-y-4 p-4 text-left bg-gray-50 rounded-2xl border border-gray-100">
              ${
                item.rawIds.pozId
                  ? `
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-gray-400 uppercase">Pozisyon Değiştir</label>
                  <select id="swal-poz-id" class="w-full p-2 border rounded-xl text-sm font-bold bg-white outline-none">
                    ${Object.entries(pozOptions)
                      .map(
                        ([id, name]) =>
                          `<option value="${id}" ${item.pozisyonAdi === name ? "selected" : ""}>${name}</option>`,
                      )
                      .join("")}
                  </select>
                </div>`
                  : ""
              }
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase">Hiyerarşik Aktiflik</label>
                <div class="flex justify-between items-center p-2 bg-white rounded border"><span>1. Şube-Alan</span><input type="checkbox" id="sa-status" class="w-5 h-5 accent-rose-600" ${item.status.sa ? "checked" : ""}></div>
                ${item.rawIds.depId ? `<div class="flex justify-between items-center p-2 bg-white rounded border"><span>2. Departman</span><input type="checkbox" id="dep-status" class="w-5 h-5 accent-emerald-600" ${item.status.dep ? "checked" : ""}></div>` : ""}
                ${item.rawIds.pozId ? `<div class="flex justify-between items-center p-2 bg-white rounded border"><span>3. Pozisyon</span><input type="checkbox" id="poz-status" class="w-5 h-5 accent-indigo-600" ${item.status.poz ? "checked" : ""}></div>` : ""}
              </div>
            </div>`,
        showCancelButton: true,
        confirmButtonText: "Güncelle",
        confirmButtonColor: "#2563eb",
        preConfirm: () => ({
          newPozId: document.getElementById("swal-poz-id")?.value,
          sa: document.getElementById("sa-status").checked,
          dep: document.getElementById("dep-status")?.checked,
          poz: document.getElementById("poz-status")?.checked,
        }),
      });
      if (formValues) {
        try {
          setLoading(true);
          if (item.rawIds.pozId && formValues.newPozId)
            await tanimlamalarService.updateDepartmanPozisyon({
              id: item.rawIds.pozId,
              DepartmanId: item.rawIds.depId,
              MasterPozisyonId: parseInt(formValues.newPozId),
              DepartmanPozisyonAktifMi: formValues.poz,
            });
          if (formValues.sa !== item.status.sa)
            await tanimlamalarService.updateSubeAlan({
              id: item.rawIds.saId,
              SubeAlanAktifMi: formValues.sa,
            });
          if (item.rawIds.depId && formValues.dep !== item.status.dep)
            await tanimlamalarService.updateDepartman({
              id: item.rawIds.depId,
              DepartmanAktifMi: formValues.dep,
            });
          toast.success("Güncelleme başarılı.");
          fetchData();
        } catch {
          toast.error("Güncelleme hatası.");
        } finally {
          setLoading(false);
        }
      }
    }
    // 2. Oyun ve Program Sekmesi
    else {
      const isProgram = activeTab === "program";
      const currentStatus =
        item.oyunAktifMi === true ||
        item.programAktifMi === true ||
        item.oyunAktifMi === 1 ||
        item.programAktifMi === 1;

      const { value: result } = await Swal.fire({
        title: `<span class="text-xl font-black">DURUMU GÜNCELLE</span>`,
        html: `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div class="flex flex-col text-left">
                        <span class="font-bold text-gray-700">Kayıt Aktifliği</span>
                        <span class="text-[10px] text-gray-400">Bu kaydın sistemde görünürlüğünü değiştirir.</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="swal-org-status" ${currentStatus ? "checked" : ""} class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            `,
        showCancelButton: true,
        confirmButtonText: "Kaydet",
        confirmButtonColor: "#2563eb",
        preConfirm: () => {
          const checkbox = document.getElementById("swal-org-status");
          return { checked: checkbox ? checkbox.checked : false };
        },
      });

      if (result) {
        const newStatus = result.checked;
        try {
          setLoading(true);
          const payload = {
            id: item.id,
            departmanId: item.departmanId || item.DepartmanId,
            [isProgram ? "masterProgramId" : "masterOyunId"]: isProgram
              ? item.masterProgramId || item.MasterProgramId
              : item.masterOyunId || item.MasterOyunId,
            [isProgram ? "programAdi" : "oyunAdi"]: isProgram
              ? item.programAdi || item.ProgramAdi
              : item.oyunAdi || item.OyunAdi,
            [isProgram ? "programAktifMi" : "oyunAktifMi"]: newStatus,
          };

          const res = isProgram
            ? await tanimlamalarService.updateProgramBilgisi(payload)
            : await tanimlamalarService.updateOyunBilgisi(payload);

          if (res.success) {
            toast.success("Durum güncellendi.");
            fetchData();
          } else {
            toast.error(res.message || "Güncelleme başarısız.");
          }
        } catch (err) {
          toast.error("Hata oluştu.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // --- CRUD: KAYDETME ---
  const handleSaveOrgItem = async () => {
    const { orgDepartmanId, orgMasterId } = selections;
    if (!orgDepartmanId || !orgMasterId) {
      toast.warning("Eksik seçim yaptınız.");
      return;
    }

    const isProgram = activeTab === "program";
    const masterIdKey = isProgram ? "MasterProgramId" : "MasterOyunId";
    const masterList = isProgram
      ? lookups.masterProgramlar
      : lookups.masterOyunlar;
    const selectedMaster = masterList.find((m) => m.id == orgMasterId);
    const masterName = selectedMaster
      ? selectedMaster.MasterProgramAdi ||
        selectedMaster.MasterOyunAdi ||
        selectedMaster.masterProgramAdi ||
        selectedMaster.masterOyunAdi
      : "";

    try {
      setLoading(true);
      const payload = {
        DepartmanId: parseInt(orgDepartmanId),
        [masterIdKey]: parseInt(orgMasterId),
        [isProgram ? "ProgramAdi" : "OyunAdi"]: masterName,
        [isProgram ? "ProgramAktifMi" : "OyunAktifMi"]: true,
      };
      const res = isProgram
        ? await tanimlamalarService.createProgramBilgisi(payload)
        : await tanimlamalarService.createOyunBilgisi(payload);
      if (res.success) {
        toast.success("Atama başarılı.");
        setSelections((prev) => ({ ...prev, orgMasterId: "" }));
        fetchData();
      } else {
        toast.error(res.message || "Hata");
      }
    } catch {
      toast.error("Hata");
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD: ŞİRKET BAĞLANTISI ---
  const handleAddRelation = async (type) => {
    let title,
      inputOptions,
      serviceFunc,
      payloadBuilder,
      existingIds = [];
    if (type === "SubeAlan") {
      title = "Şubeye Alan Bağla";
      existingIds = lookups.subeAlanlar
        .filter((x) => (x.SubeId || x.subeId) == selections.subeId)
        .map((x) => x.MasterAlanId || x.masterAlanId);
      inputOptions = Object.fromEntries(
        lookups.masterAlanlar.map((x) => [
          x.id,
          `${x.MasterAlanAdi || x.masterAlanAdi} ${existingIds.includes(x.id) ? "✔️" : ""}`,
        ]),
      );
      serviceFunc = "createSubeAlan";
      payloadBuilder = (val) => ({
        SubeId: parseInt(selections.subeId),
        MasterAlanId: parseInt(val),
        SubeAlanAktifMi: true,
      });
    } else if (type === "Departman") {
      title = "Alana Departman Bağla";
      existingIds = lookups.departmanlar
        .filter((x) => (x.SubeAlanId || x.subeAlanId) == selections.subeAlanId)
        .map((x) => x.MasterDepartmanId || x.masterDepartmanId);
      inputOptions = Object.fromEntries(
        lookups.masterDepartmanlar.map((x) => [
          x.id,
          `${x.MasterDepartmanAdi || x.masterDepartmanAdi} ${existingIds.includes(x.id) ? "✔️" : ""}`,
        ]),
      );
      serviceFunc = "createDepartman";
      payloadBuilder = (val) => ({
        SubeAlanId: parseInt(selections.subeAlanId),
        MasterDepartmanId: parseInt(val),
        DepartmanAktifMi: true,
      });
    } else {
      title = "Departmana Pozisyon Bağla";
      existingIds = sirketList
        .filter(
          (x) => x.rawIds.depId == selections.departmanId && x.rawIds.pozId,
        )
        .map((x) => {
          const poz = lookups.masterPozisyonlar.find(
            (p) =>
              (p.MasterPozisyonAdi || p.masterPozisyonAdi) === x.pozisyonAdi,
          );
          return poz?.id;
        });
      inputOptions = Object.fromEntries(
        lookups.masterPozisyonlar.map((x) => [
          x.id,
          `${x.MasterPozisyonAdi || x.masterPozisyonAdi} ${existingIds.includes(x.id) ? "✔️" : ""}`,
        ]),
      );
      serviceFunc = "createDepartmanPozisyon";
      payloadBuilder = (val) => ({
        DepartmanId: parseInt(selections.departmanId),
        MasterPozisyonId: parseInt(val),
        DepartmanPozisyonAktifMi: true,
      });
    }
    const { value: selectedId } = await Swal.fire({
      title,
      input: "select",
      inputOptions,
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
    });
    if (selectedId && !existingIds.includes(parseInt(selectedId))) {
      try {
        const res = await tanimlamalarService[serviceFunc](
          payloadBuilder(selectedId),
        );
        if (res.success) {
          toast.success("Başarılı.");
          fetchData();
        }
      } catch {
        toast.error("Hata!");
      }
    } else if (selectedId) toast.info("Zaten bağlı.");
  };

  // --- CRUD: SİLME (DÜZELTİLMİŞ) ---
  const handleDelete = async (item) => {
    if (activeTab === "sirket") {
      const { value: level } = await Swal.fire({
        title:
          '<span class="text-2xl font-black text-gray-800">SİLME KAPSAMI</span>',
        html: `
          <div class="flex flex-col gap-3 p-2 text-left">
            ${item.rawIds.pozId ? `<label class="group relative flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-rose-500 hover:bg-rose-50/30 transition-all shadow-sm"><input type="radio" name="delete-level" value="poz" class="hidden peer"><div class="flex flex-col"><span class="text-xs font-black uppercase text-rose-600 tracking-wider">Seviye 3</span><span class="font-bold text-gray-700">Sadece Pozisyonu Sil</span></div><div class="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-rose-500 flex items-center justify-center"><div class="w-3 h-3 rounded-full bg-rose-500 scale-0 transition-transform duration-200"></div></div></label>` : ""}
            ${item.rawIds.depId ? `<label class="group relative flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-rose-500 hover:bg-rose-50/30 transition-all shadow-sm"><input type="radio" name="delete-level" value="dep" class="hidden peer"><div class="flex flex-col"><span class="text-xs font-black uppercase text-orange-600 tracking-wider">Seviye 2</span><span class="font-bold text-gray-700">Departman ve Altını Sil</span></div><div class="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-rose-500 flex items-center justify-center"><div class="w-3 h-3 rounded-full bg-rose-500 scale-0 transition-transform duration-200"></div></div></label>` : ""}
            <label class="group relative flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-rose-500 hover:bg-rose-50/30 transition-all shadow-sm"><input type="radio" name="delete-level" value="sa" class="hidden peer"><div class="flex flex-col"><span class="text-xs font-black uppercase text-gray-500 tracking-wider">Seviye 1</span><span class="font-bold text-gray-700">Tüm Zinciri Sil</span></div><div class="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-rose-500 flex items-center justify-center"><div class="w-3 h-3 rounded-full bg-rose-500 scale-0 transition-transform duration-200"></div></div></label>
          </div>
          <style>input[name="delete-level"]:checked + div + .w-6 { border-color: #e11d48 !important; } input[name="delete-level"]:checked + div + .w-6 div { scale: 1 !important; } label:has(input:checked) { border-color: #e11d48 !important; background-color: #fff1f2 !important; }</style>`,
        showCancelButton: true,
        confirmButtonText: "Seçileni Sil",
        confirmButtonColor: "#e11d48",
        preConfirm: () =>
          document.querySelector('input[name="delete-level"]:checked')?.value,
      });

      if (level) {
        const confirm = await Swal.fire({
          title: "Emin misiniz?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Evet",
          confirmButtonColor: "#e11d48",
        });

        if (confirm.isConfirmed) {
          try {
            setLoading(true);
            let res;
            if (level === "poz")
              res = await tanimlamalarService.deleteDepartmanPozisyon(
                item.rawIds.pozId,
              );
            else if (level === "dep")
              res = await tanimlamalarService.deleteDepartman(
                item.rawIds.depId,
              );
            else if (level === "sa")
              res = await tanimlamalarService.deleteSubeAlan(item.rawIds.saId);

            // DÜZELTME: API'den gelen cevap ne olursa olsun (hata fırlatılmadıysa) başarı kabul et ve yenile
            if (!res || res.success !== false) {
              toast.success("Başarıyla silindi.");
              setTimeout(() => {
                fetchData();
              }, 100);
            } else {
              toast.error(res.message || "Silinemedi.");
            }
          } catch (error) {
            console.error(error);
            toast.error("Hata: İşlem gerçekleştirilemedi.");
          } finally {
            setLoading(false);
          }
        }
      }
    } else {
      const isProgram = activeTab === "program";
      const confirm = await Swal.fire({
        title: "Atamayı Sil?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sil",
        confirmButtonColor: "#e11d48",
      });

      if (confirm.isConfirmed) {
        try {
          const res = isProgram
            ? await tanimlamalarService.deleteProgramBilgisi(item.id)
            : await tanimlamalarService.deleteOyunBilgisi(item.id);

          if (res.success) {
            toast.success("Silindi");
            fetchData();
          } else {
            toast.error(res.message);
          }
        } catch {
          toast.error("Hata");
        }
      }
    }
  };

  // --- SIRALAMA & FİLTRELEME ---
  const processedList = useMemo(() => {
    let sourceList =
      activeTab === "sirket"
        ? sirketList
        : activeTab === "oyun"
          ? oyunList
          : programList;
    let filtered = sourceList.filter((item) => {
      const searchContent =
        activeTab === "sirket"
          ? item.searchContent
          : `${item.subeAdi} ${item.departmanAdi} ${item.oyunAdi || item.programAdi}`.toLowerCase();
      const matchSearch = searchContent.includes(searchTerm.toLowerCase());
      if (activeTab === "sirket") {
        return (
          matchSearch &&
          (filters.sube === "" || item.subeAdi === filters.sube) &&
          (filters.alan === "" || item.alanAdi === filters.alan) &&
          (filters.departman === "" ||
            item.departmanAdi === filters.departman) &&
          (filters.pozisyon === "" || item.pozisyonAdi === filters.pozisyon) &&
          (filters.durum === "" ||
            (filters.durum === "Aktif" ? item.aktifMi : !item.aktifMi))
        );
      } else {
        return (
          matchSearch &&
          (filters.sube === "" || item.subeAdi === filters.sube) &&
          (filters.departman === "" ||
            item.departmanAdi === filters.departman) &&
          (filters.durum === "" ||
            (filters.durum === "Aktif"
              ? item.oyunAktifMi || item.programAktifMi
              : !(item.oyunAktifMi || item.programAktifMi)))
        );
      }
    });
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key],
          valB = b[sortConfig.key];
        if (sortConfig.key === "aktifMi") {
          valA =
            activeTab === "sirket"
              ? a.aktifMi
              : a.oyunAktifMi || a.programAktifMi;
          valB =
            activeTab === "sirket"
              ? b.aktifMi
              : b.oyunAktifMi || b.programAktifMi;
        }
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [
    sirketList,
    oyunList,
    programList,
    activeTab,
    searchTerm,
    filters,
    sortConfig,
  ]);

  const paginatedItems = processedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(processedList.length / itemsPerPage);
  const requestSort = (key) =>
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });

  const getSelectedMasterName = () => {
    if (!selections.orgMasterId) return "";
    const list =
      activeTab === "program"
        ? lookups.masterProgramlar
        : lookups.masterOyunlar;
    const item = list.find((x) => x.id == selections.orgMasterId);
    return item
      ? item.MasterProgramAdi ||
          item.MasterOyunAdi ||
          item.masterProgramAdi ||
          item.masterOyunAdi
      : "";
  };

  const isMasterAssigned = (masterId) => {
    const list = activeTab === "program" ? programList : oyunList;
    const key = activeTab === "program" ? "masterProgramId" : "masterOyunId";
    const PascalKey =
      activeTab === "program" ? "MasterProgramId" : "MasterOyunId";
    return list.some(
      (item) =>
        (item.departmanId == selections.orgDepartmanId ||
          item.DepartmanId == selections.orgDepartmanId) &&
        (item[key] == masterId || item[PascalKey] == masterId),
    );
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey)
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="text-[10px] text-gray-300 opacity-50"
        />
      );
    return (
      <FontAwesomeIcon
        icon={
          sortConfig.direction === "asc" ? faSortAmountUp : faSortAmountDown
        }
        className={`text-[10px] ${currentTabInfo.color}`}
      />
    );
  };

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* BAŞLIK & ARAMA */}
      <div
        className={`bg-white rounded-3xl shadow-sm border p-6 border-b-4 ${currentTabInfo.border} flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/panel")}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-800 hover:text-white transition-all border shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
            Organizasyon <span className={currentTabInfo.color}>Yönetimi</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate("/admin/definitions")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 font-black text-[10px] uppercase tracking-widest shadow-sm group"
          >
            <FontAwesomeIcon
              icon={faTags}
              className="group-hover:scale-110 transition-transform"
            />{" "}
            Şirket Tanımları
          </button>
          <div className="relative group flex-1 md:flex-none">
            <FontAwesomeIcon
              icon={faSearch}
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:${currentTabInfo.color}`}
            />
            <input
              type="text"
              placeholder="Hızlı ara..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 ${currentTabInfo.ring} transition-all w-full md:w-64 font-bold`}
            />
          </div>
        </div>
      </div>

      {/* TABLAR */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
              setSearchTerm("");
              setFilters({
                sube: "",
                alan: "",
                departman: "",
                pozisyon: "",
                durum: "",
              });
              setSelections({
                subeId: "",
                subeAlanId: "",
                departmanId: "",
                orgSubeId: "",
                orgDepartmanId: "",
                orgMasterId: "",
              });
            }}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === tab.id ? `${tab.bg} ${tab.color} shadow-sm scale-105` : "text-gray-400 hover:bg-gray-50"}`}
          >
            <FontAwesomeIcon icon={tab.icon} /> {tab.name}
          </button>
        ))}
      </div>

      {/* --- EKLEME PANELLERİ --- */}
      {activeTab === "sirket" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> 1. Şubeye Alan Bağla
            </div>
            <select
              value={selections.subeId}
              onChange={(e) =>
                setSelections({
                  ...selections,
                  subeId: e.target.value,
                  subeAlanId: "",
                  departmanId: "",
                })
              }
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500"
            >
              <option value="">Şube Seçiniz</option>
              {lookups.subeler.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.SubeAdi || s.subeAdi}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleAddRelation("SubeAlan")}
              disabled={!selections.subeId}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg disabled:opacity-30 active:scale-95 transition-all"
            >
              <FontAwesomeIcon icon={faLink} className="mr-2" /> Bağlantı Kur
            </button>
          </div>
          <div
            className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4 ${!selections.subeId && "opacity-40 grayscale pointer-events-none"}`}
          >
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              <FontAwesomeIcon icon={faLayerGroup} /> 2. Alana Departman Bağla
            </div>
            <select
              value={selections.subeAlanId}
              onChange={(e) =>
                setSelections({
                  ...selections,
                  subeAlanId: e.target.value,
                  departmanId: "",
                })
              }
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none focus:border-emerald-500"
            >
              <option value="">Bağlantılı Alan Seçiniz</option>
              {lookups.subeAlanlar
                .filter((x) => (x.SubeId || x.subeId) == selections.subeId)
                .map((sa) => (
                  <option key={sa.id} value={sa.id}>
                    {sa.AlanAdi || sa.alanAdi}
                  </option>
                ))}
            </select>
            <button
              onClick={() => handleAddRelation("Departman")}
              disabled={!selections.subeAlanId}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg disabled:opacity-30 active:scale-95 transition-all"
            >
              <FontAwesomeIcon icon={faLink} className="mr-2" /> Bağlantı Kur
            </button>
          </div>
          <div
            className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4 ${!selections.subeAlanId && "opacity-40 grayscale pointer-events-none"}`}
          >
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <FontAwesomeIcon icon={faBriefcase} /> 3. Departmana Pozisyon
              Bağla
            </div>
            <select
              value={selections.departmanId}
              onChange={(e) =>
                setSelections({ ...selections, departmanId: e.target.value })
              }
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none focus:border-indigo-500"
            >
              <option value="">Bağlantılı Departman Seçiniz</option>
              {lookups.departmanlar
                .filter(
                  (x) =>
                    (x.SubeAlanId || x.subeAlanId) == selections.subeAlanId,
                )
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.DepartmanAdi || d.departmanAdi}
                  </option>
                ))}
            </select>
            <button
              onClick={() => handleAddRelation("Pozisyon")}
              disabled={!selections.departmanId}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg disabled:opacity-30 active:scale-95 transition-all"
            >
              <FontAwesomeIcon icon={faLink} className="mr-2" /> Bağlantı Kur
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4">
            <div
              className={`text-[10px] font-black ${currentTabInfo.color} uppercase tracking-widest flex items-center gap-2`}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} /> 1. Hedef Belirle
            </div>
            <select
              value={selections.orgSubeId}
              onChange={(e) =>
                setSelections({
                  ...selections,
                  orgSubeId: e.target.value,
                  orgDepartmanId: "",
                })
              }
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none focus:border-purple-500"
            >
              <option value="">Şube Seçiniz...</option>
              {lookups.subeler.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.SubeAdi || s.subeAdi}
                </option>
              ))}
            </select>
            <select
              value={selections.orgDepartmanId}
              onChange={(e) =>
                setSelections({ ...selections, orgDepartmanId: e.target.value })
              }
              disabled={!selections.orgSubeId}
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none focus:border-purple-500 disabled:opacity-50"
            >
              <option value="">Departman Seçiniz...</option>
              {lookups.departmanlar
                .filter((d) => {
                  const subeyeAitAlanIds = lookups.subeAlanlar
                    .filter(
                      (sa) => (sa.SubeId || sa.subeId) == selections.orgSubeId,
                    )
                    .map((sa) => sa.id);
                  const isHierarchyValid = subeyeAitAlanIds.includes(
                    d.SubeAlanId || d.subeAlanId,
                  );

                  // KISITLAMA: Oyun sekmesindeyse sadece 'Canlı Oyun' içeren departmanlar
                  if (activeTab === "oyun") {
                    const depName = (
                      d.DepartmanAdi ||
                      d.departmanAdi ||
                      ""
                    ).toLowerCase();
                    return isHierarchyValid && depName.includes("canlı oyun");
                  }
                  return isHierarchyValid;
                })
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.DepartmanAdi || d.departmanAdi}
                  </option>
                ))}
            </select>
          </div>
          <div
            className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4 ${!selections.orgDepartmanId && "opacity-40 grayscale pointer-events-none"}`}
          >
            <div
              className={`text-[10px] font-black ${currentTabInfo.color} uppercase tracking-widest flex items-center gap-2`}
            >
              <FontAwesomeIcon
                icon={activeTab === "program" ? faLaptopCode : faGamepad}
              />{" "}
              2. Master {activeTab === "program" ? "Program" : "Oyun"} Seçimi
            </div>
            <select
              value={selections.orgMasterId}
              onChange={(e) =>
                setSelections({ ...selections, orgMasterId: e.target.value })
              }
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none focus:border-purple-500"
            >
              <option value="">Havuzdan Seçiniz...</option>
              {(activeTab === "program"
                ? lookups.masterProgramlar
                : lookups.masterOyunlar
              ).map((m) => {
                const isAdded = isMasterAssigned(m.id);
                return (
                  <option key={m.id} value={m.id} disabled={isAdded}>
                    {m.MasterProgramAdi ||
                      m.MasterOyunAdi ||
                      m.masterProgramAdi ||
                      m.masterOyunAdi}{" "}
                    {isAdded ? "(✔ Eklendi)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div
            className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4 flex flex-col justify-between ${!selections.orgMasterId && "opacity-40 grayscale pointer-events-none"}`}
          >
            <div
              className={`text-[10px] font-black ${currentTabInfo.color} uppercase tracking-widest flex items-center gap-2`}
            >
              <FontAwesomeIcon icon={faCheckCircle} /> 3. Onay ve Kayıt
            </div>
            {selections.orgMasterId ? (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 font-bold">
                <span className="block text-gray-400 text-[10px] uppercase mb-1">
                  Eklenecek Kayıt:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800">
                    {getSelectedMasterName()}
                  </span>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="text-gray-400 text-[10px]"
                  />
                  <span className={`${currentTabInfo.color}`}>
                    {lookups.departmanlar.find(
                      (d) => d.id == selections.orgDepartmanId,
                    )?.DepartmanAdi || "Departman"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 text-center">
                Seçim bekleniyor...
              </div>
            )}
            <button
              onClick={handleSaveOrgItem}
              disabled={!selections.orgMasterId}
              className={`w-full ${currentTabInfo.btn} text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all disabled:opacity-50`}
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" /> Atamayı Kaydet
            </button>
          </div>
        </div>
      )}

      {/* TABLO ALANI */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Filtreler */}
        <div className="p-4 bg-gray-50/50 border-b flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase mr-2">
            <FontAwesomeIcon icon={faFilter} /> Filtreler:
          </div>
          <select
            value={filters.sube}
            onChange={(e) => setFilters({ ...filters, sube: e.target.value })}
            className="bg-white border rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none shadow-sm"
          >
            <option value="">Tüm Şubeler</option>
            {[
              ...new Set(
                (activeTab === "sirket"
                  ? sirketList
                  : activeTab === "oyun"
                    ? oyunList
                    : programList
                ).map((i) => i.subeAdi),
              ),
            ]
              .filter(Boolean)
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
          <select
            value={filters.departman}
            onChange={(e) =>
              setFilters({ ...filters, departman: e.target.value })
            }
            className="bg-white border rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none shadow-sm"
          >
            <option value="">Tüm Departmanlar</option>
            {[...new Set(processedList.map((i) => i.departmanAdi))]
              .filter(Boolean)
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>
          {activeTab === "sirket" && (
            <>
              <select
                value={filters.alan}
                onChange={(e) =>
                  setFilters({ ...filters, alan: e.target.value })
                }
                className="bg-white border rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none shadow-sm"
              >
                <option value="">Tüm Alanlar</option>
                {[...new Set(sirketList.map((i) => i.alanAdi))].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                value={filters.pozisyon}
                onChange={(e) =>
                  setFilters({ ...filters, pozisyon: e.target.value })
                }
                className="bg-white border rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none shadow-sm"
              >
                <option value="">Tüm Pozisyonlar</option>
                {[...new Set(sirketList.map((i) => i.pozisyonAdi))]
                  .filter((x) => x !== "-")
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </select>
            </>
          )}
          <select
            value={filters.durum}
            onChange={(e) => setFilters({ ...filters, durum: e.target.value })}
            className="bg-white border rounded-lg px-3 py-1.5 text-[10px] font-bold text-rose-600 shadow-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
          </select>
          <button
            onClick={() =>
              setFilters({
                sube: "",
                alan: "",
                departman: "",
                pozisyon: "",
                durum: "",
              })
            }
            className="ml-auto text-[10px] font-black text-gray-400 hover:text-rose-600 transition-colors uppercase"
          >
            Temizle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b">
              <tr>
                {activeTab === "sirket" ? (
                  <>
                    <th
                      onClick={() => requestSort("subeAdi")}
                      className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Şube {getSortIcon("subeAdi")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("alanAdi")}
                      className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Sektörel Alan {getSortIcon("alanAdi")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("departmanAdi")}
                      className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Departman {getSortIcon("departmanAdi")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("pozisyonAdi")}
                      className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Pozisyon {getSortIcon("pozisyonAdi")}
                      </div>
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      onClick={() => requestSort("subeAdi")}
                      className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Şube {getSortIcon("subeAdi")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("departmanAdi")}
                      className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Departman {getSortIcon("departmanAdi")}
                      </div>
                    </th>
                    <th
                      onClick={() =>
                        requestSort(
                          activeTab === "program"
                            ? "masterProgramAdi"
                            : "masterOyunAdi",
                        )
                      }
                      className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {activeTab === "program" ? "Program Adı" : "Oyun Adı"}{" "}
                        {getSortIcon(
                          activeTab === "program"
                            ? "masterProgramAdi"
                            : "masterOyunAdi",
                        )}
                      </div>
                    </th>
                  </>
                )}
                <th
                  onClick={() => requestSort("aktifMi")}
                  className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase cursor-pointer text-center hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    Durum {getSortIcon("aktifMi")}
                  </div>
                </th>
                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase text-right">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && processedList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-20 text-center text-xs font-black text-gray-300 uppercase tracking-widest"
                  >
                    Kayıt Bulunamadı
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => (
                  <tr
                    key={`${item.id}-${idx}`}
                    className="hover:bg-gray-50 transition-all group"
                  >
                    {activeTab === "sirket" ? (
                      <>
                        <td className="py-4 px-6 text-sm font-black text-gray-800">
                          {item.subeAdi}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-amber-600 uppercase">
                          {item.alanAdi}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-emerald-600 uppercase">
                          {item.departmanAdi}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-indigo-600 uppercase">
                          {item.pozisyonAdi}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.aktifMi ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                          >
                            {item.aktifMi ? (
                              <FontAwesomeIcon icon={faCheckCircle} />
                            ) : (
                              <FontAwesomeIcon icon={faTimesCircle} />
                            )}{" "}
                            {item.aktifMi ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-6 text-sm font-bold text-gray-600">
                          {item.subeAdi}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-emerald-600 uppercase">
                          {item.departmanAdi}
                        </td>
                        <td className="py-4 px-6 text-sm font-black text-gray-800">
                          {activeTab === "program"
                            ? item.masterProgramAdi
                            : item.masterOyunAdi}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.oyunAktifMi || item.programAktifMi ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                          >
                            {item.oyunAktifMi || item.programAktifMi
                              ? "Aktif"
                              : "Pasif"}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="py-4 px-8 text-right space-x-2">
                      <button
                        onClick={() => handleEditStatus(item)}
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
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

        {/* PAGINATION */}
        <div className="p-6 bg-gray-50/50 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400 uppercase">
              Göster:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border rounded-lg px-2 py-1 text-xs font-bold outline-none shadow-sm cursor-pointer hover:border-rose-300"
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
              className="px-4 py-2 bg-white border rounded-xl text-xs font-black hover:bg-rose-600 hover:text-white transition-all disabled:opacity-30"
            >
              Geri
            </button>
            <span className="flex items-center px-4 text-xs font-black text-rose-600 bg-rose-50 rounded-xl shadow-inner">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 bg-white border rounded-xl text-xs font-black hover:bg-rose-600 hover:text-white transition-all disabled:opacity-30"
            >
              İleri
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
