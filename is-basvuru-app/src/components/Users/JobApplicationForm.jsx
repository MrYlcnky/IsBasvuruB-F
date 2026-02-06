import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGraduationCap,
  faPlus,
  faAward,
  faLaptopCode,
  faLanguage,
  faBriefcase,
  faPhoneVolume,
  faUserCog,
  faFileSignature,
  faCheckCircle,
  faCircleXmark,
  faInfoCircle,
  faGlobe,
  faRotateLeft,
  faShieldHalved,
  faEnvelope,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMainApplicationSchema } from "../../schemas/mainApplicationSchema";
import { createPersonalSchema } from "../../schemas/personalInfoSchema";
import { createOtherInfoSchema } from "../../schemas/otherInfoSchema";
import { createJobDetailsSchema } from "../../schemas/jobDetailsSchema";

import PersonalInformation from "./usersComponents/PersonalInformation";
import EducationTable from "./usersComponents/EducationTable";
import CertificateTable from "./usersComponents/CertificatesTable";
import ComputerInformationTable from "./usersComponents/ComputerInformationTable";
import LanguageTable from "./usersComponents/LanguageTable";
import JobExperiencesTable from "./usersComponents/JobExperiencesTable";
import ReferencesTable from "./usersComponents/ReferencesTable";
import OtherPersonalInformationTable from "./usersComponents/OtherPersonalInformationTable";
import JobApplicationDetails from "./usersComponents/JobApplicationDetails";
import ApplicationConfirmSection from "./usersComponents/ApplicationConfirmSection";

import { lockScroll } from "./modalHooks/scrollLock";
import LanguageSwitcher from "../LanguageSwitcher";
import { mockCVData } from "../../api/mockCVData";

import { basvuruService } from "../../services/basvuruService";
import { tanimlamaService } from "../../services/tanimlamalarService";
import { objectToFormData } from "../../utils/objectToFormData";
import { toISODate } from "./modalHooks/dateUtils";

const MySwal = withReactContent(Swal);

const swalSkyConfig = {
  background: "#1e293b",
  color: "#fff",
  confirmButtonColor: "#0ea5e9",
  cancelButtonColor: "#475569",
  customClass: {
    popup: "border border-slate-700 shadow-2xl rounded-xl",
    input:
      "bg-slate-800 border border-slate-600 text-white focus:border-sky-500 focus:ring-0 shadow-none outline-none rounded-lg px-4 py-2",
    confirmButton:
      "shadow-none focus:shadow-none rounded-lg px-5 py-2.5 font-medium",
    cancelButton:
      "shadow-none focus:shadow-none rounded-lg px-5 py-2.5 font-medium",
  },
};

const DEFAULT_VALUES = {
  personal: {
    ad: "",
    soyad: "",
    eposta: "",
    telefon: "",
    whatsapp: "",
    adres: "",
    cinsiyet: "",
    medeniDurum: "",
    dogumTarihi: "",
    cocukSayisi: "",
    foto: null,
    VesikalikDosyasi: null,
    DogumUlkeId: null,
    DogumUlkeAdi: "",
    DogumSehirId: null,
    DogumSehirAdi: "",
    DogumIlceId: null,
    DogumIlceAdi: "",
    IkametgahUlkeId: null,
    IkametgahUlkeAdi: "",
    IkametgahSehirId: null,
    IkametgahSehirAdi: "",
    IkametgahIlceId: null,
    IkametgahIlceAdi: "",
    UyrukId: null,
    UyrukAdi: "",
  },
  otherInfo: {
    kktcGecerliBelge: "",
    davaDurumu: "",
    davaNedeni: "",
    sigara: "",
    kaliciRahatsizlik: "",
    rahatsizlikAciklama: "",
    ehliyet: "",
    ehliyetTurleri: [],
    askerlik: "",
    boy: "",
    kilo: "",
  },
  jobDetails: {
    subeler: [],
    alanlar: [],
    departmanlar: [],
    programlar: [],
    departmanPozisyonlari: [],
    kagitOyunlari: [],
    lojman: "",
    tercihNedeni: "",
  },
  education: [],
  certificates: [],
  computer: [],
  languages: [],
  experience: [],
  references: [],
};

function normalizeLegacyPersonalToDto(p = {}) {
  const safeStr = (v) => (v == null ? "" : String(v));
  return {
    ...p,
    VesikalikDosyasi: null,
    DogumUlkeId: p.DogumUlkeId ?? null,
    DogumUlkeAdi: safeStr(p.DogumUlkeAdi ?? p.dogumUlke ?? ""),
    DogumSehirId: p.DogumSehirId ?? null,
    DogumSehirAdi: safeStr(p.DogumSehirAdi ?? p.dogumSehir ?? ""),
    DogumIlceId: p.DogumIlceId ?? null,
    DogumIlceAdi: safeStr(p.DogumIlceAdi ?? p.dogumIlce ?? ""),
    IkametgahUlkeId: p.IkametgahUlkeId ?? null,
    IkametgahUlkeAdi: safeStr(p.IkametgahUlkeAdi ?? p.ikametUlke ?? ""),
    IkametgahSehirId: p.IkametgahSehirId ?? null,
    IkametgahSehirAdi: safeStr(p.IkametgahSehirAdi ?? p.ikametSehir ?? ""),
    IkametgahIlceId: p.IkametgahIlceId ?? null,
    IkametgahIlceAdi: safeStr(p.IkametgahIlceAdi ?? p.ikametIlce ?? ""),
    UyrukId: p.UyrukId ?? null,
    UyrukAdi: safeStr(p.UyrukAdi ?? p.uyruk ?? ""),
  };
}

const isNil = (v) => v === null || v === undefined;

const toYmd = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const pickIdValue = (x) => {
  if (isNil(x)) return null;
  if (typeof x === "object" && x !== null) {
    if (!isNil(x.value)) return x.value;
    if (!isNil(x.id)) return x.id;
  }
  return x;
};

const toIntOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const mapArrayToIntList = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) => pickIdValue(x))
    .map((x) => (x === "" ? null : x))
    .map(toIntOrNull)
    .filter((x) => x !== null);
};

// ✅ ENUM GÜVENLİK FONKSİYONU
const safeEnum = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

// RHF Data -> PersonelCreateDto Payload
function buildPersonelCreateDtoPayload(t, data, testMode = false) {
  const p = data.personal ?? {};
  const oi = data.otherInfo ?? {};
  const jd = data.jobDetails ?? {};

  const pickFirstId = (arr) => {
    const first = Array.isArray(arr) && arr.length ? arr[0] : null;
    const v = first?.id ?? first?.value ?? first;
    const n = Number(v);
    return Number.isFinite(n) ? [n] : [];
  };

  // 1. EĞİTİM
  const educationList = (data.education || []).map((edu) => ({
    EgitimSeviye: Number(edu.seviye),
    OkulAdi: edu.okul,
    Bolum: edu.bolum,
    BaslangicTarihi: toYmd(edu.baslangic),
    BitisTarihi: edu.bitis ? toYmd(edu.bitis) : null,
    DiplomaDurum: Number(edu.diplomaDurum),
    NotSistemi: Number(edu.notSistemi),
    Gano: edu.gano ? Number(edu.gano) : null,
  }));

  // 2. SERTİFİKA
  const certificateList = (data.certificates || []).map((cert) => ({
    SertifikaAdi: cert.ad,
    KurumAdi: cert.kurum,
    Suresi: cert.sure,
    VerilisTarihi: toYmd(cert.verilisTarihi),
    GecerlilikTarihi: cert.gecerlilikTarihi
      ? toYmd(cert.gecerlilikTarihi)
      : null,
  }));

  // 3. BİLGİSAYAR
  const computerList = (data.computer || []).map((comp) => ({
    ProgramAdi: comp.programAdi,
    Yetkinlik: Number(comp.yetkinlik),
  }));

  // 4. YABANCI DİL
  const languageList = (data.languages || []).map((lang) => ({
    DilId: lang.dilId,
    DigerDilAdi: lang.digerDilAdi,
    KonusmaSeviyesi: Number(lang.konusma),
    YazmaSeviyesi: Number(lang.yazma),
    OkumaSeviyesi: Number(lang.okuma),
    DinlemeSeviyesi: Number(lang.dinleme),
    NasilOgrenildi: lang.ogrenilenKurum,
  }));

  // 5. İŞ DENEYİMİ
  const experienceList = (data.experience || []).map((exp) => ({
    SirketAdi: exp.isAdi,
    Departman: exp.departman,
    Pozisyon: exp.pozisyon,
    Gorev: exp.gorev,
    Ucret: Number(exp.ucret),
    BaslangicTarihi: toYmd(exp.baslangicTarihi),
    BitisTarihi: exp.bitisTarihi ? toYmd(exp.bitisTarihi) : null,
    AyrilisSebep: exp.ayrilisSebebi,
    UlkeId: exp.ulkeId,
    UlkeAdi: exp.ulkeAdi,
    SehirId: exp.sehirId,
    SehirAdi: exp.sehirAdi,
  }));

  // 6. REFERANS BİLGİSİ
  const referenceList = (data.references || []).map((ref) => ({
    CalistigiKurum: Number(ref.calistigiKurum),
    ReferansAdi: ref.referansAdi,
    ReferansSoyadi: ref.referansSoyadi,
    IsYeri: ref.referansIsYeri,
    Gorev: ref.referansGorevi,
    ReferansTelefon: ref.referansTelefon,
  }));

  const payload = {
    // --- BAŞVURU DETAYLARI ---
    SubeIds: mapArrayToIntList(jd.subeler),
    SubeAlanIds: mapArrayToIntList(jd.alanlar),
    DepartmanIds: mapArrayToIntList(jd.departmanlar),
    DepartmanPozisyonIds: mapArrayToIntList(jd.departmanPozisyonlari),
    ProgramIds: mapArrayToIntList(jd.programlar),
    OyunIds: mapArrayToIntList(jd.kagitOyunlari),
    NedenBiz: jd.tercihNedeni ?? "",

    VesikalikDosyasi:
      p.VesikalikDosyasi instanceof File ? p.VesikalikDosyasi : null,

    KisiselBilgiler: {
      Ad: p.ad ?? "",
      Soyadi: p.soyad ?? "",
      Email: p.eposta ?? "",
      Telefon: p.telefon ?? "",
      TelefonWhatsapp: p.whatsapp ?? "",
      Adres: p.adres ?? "",
      DogumTarihi: toYmd(p.dogumTarihi),
      Cinsiyet: safeEnum(p.cinsiyet),
      MedeniDurum: safeEnum(p.medeniDurum),
      CocukSayisi: p.cocukSayisi === "7+" ? 7 : toIntOrNull(p.cocukSayisi),
      VesikalikFotograf: "",
      DogumUlkeId: p.DogumUlkeId ?? null,
      DogumUlkeAdi: p.DogumUlkeAdi ?? "",
      DogumSehirId: p.DogumSehirId ?? null,
      DogumSehirAdi: p.DogumSehirAdi ?? "",
      DogumIlceId: p.DogumIlceId ?? null,
      DogumIlceAdi: p.DogumIlceAdi ?? "",
      IkametgahUlkeId: p.IkametgahUlkeId ?? null,
      IkametgahUlkeAdi: p.IkametgahUlkeAdi ?? "",
      IkametgahSehirId: p.IkametgahSehirId ?? null,
      IkametgahSehirAdi: p.IkametgahSehirAdi ?? "",
      IkametgahIlceId: p.IkametgahIlceId ?? null,
      IkametgahIlceAdi: p.IkametgahIlceAdi ?? "",
      UyrukId: p.UyrukId ?? null,
      UyrukAdi: p.UyrukAdi ?? "",
    },

    DigerKisiselBilgiler: {
      KktcBelgeId: safeEnum(oi.kktcGecerliBelge),
      DavaDurumu: safeEnum(oi.davaDurumu),
      DavaNedeni: oi.davaNedeni || null,
      SigaraKullanimi: safeEnum(oi.sigara),
      AskerlikDurumu: safeEnum(oi.askerlik),
      KaliciRahatsizlik: safeEnum(oi.kaliciRahatsizlik),
      KaliciRahatsizlikAciklama: oi.rahatsizlikAciklama || null,
      EhliyetDurumu: safeEnum(oi.ehliyet),
      Boy: Number(oi.boy) || 0,
      Kilo: Number(oi.kilo) || 0,
    },

    EgitimBilgileri: educationList,
    SertifikaBilgileri: certificateList,
    BilgisayarBilgileri: computerList,
    YabanciDilBilgileri: languageList,
    IsDeneyimleri: experienceList,
    ReferansBilgileri: referenceList,

    PersonelEhliyetler: (oi.ehliyetTurleri || []).map((id) => ({
      EhliyetTuruId: Number(id),
    })),
  };

  if (testMode) {
    payload.SubeIds = payload.SubeIds.length
      ? payload.SubeIds
      : pickFirstId(data.__defs?.subeler);
    payload.SubeAlanIds = payload.SubeAlanIds.length
      ? payload.SubeAlanIds
      : pickFirstId(data.__defs?.subeAlanlar);
    payload.DepartmanIds = payload.DepartmanIds.length
      ? payload.DepartmanIds
      : pickFirstId(data.__defs?.departmanlar);
    payload.DepartmanPozisyonIds = payload.DepartmanPozisyonIds.length
      ? payload.DepartmanPozisyonIds
      : pickFirstId(data.__defs?.pozisyonlar);
    payload.ProgramIds = payload.ProgramIds.length
      ? payload.ProgramIds
      : pickFirstId(data.__defs?.programlar);
    payload.OyunIds = payload.OyunIds.length
      ? payload.OyunIds
      : pickFirstId(data.__defs?.kagitOyunlari);

    // Test verisi atamaları
    payload.DigerKisiselBilgiler.Boy = payload.DigerKisiselBilgiler.Boy || 170;
    payload.DigerKisiselBilgiler.Kilo = payload.DigerKisiselBilgiler.Kilo || 70;
    payload.DigerKisiselBilgiler.KktcBelgeId =
      payload.DigerKisiselBilgiler.KktcBelgeId ||
      pickFirstId(data.__defs?.kktcBelgeler)[0] ||
      1;

    if (!payload.KisiselBilgiler.Cinsiyet) payload.KisiselBilgiler.Cinsiyet = 2; // Erkek
    if (!payload.KisiselBilgiler.MedeniDurum)
      payload.KisiselBilgiler.MedeniDurum = 1; // Bekar
  }

  return payload;
}

function formDataEntriesToList(fd) {
  const rows = [];
  for (const [k, v] of fd.entries()) {
    const isFile = v instanceof File;
    rows.push({
      key: k,
      value: isFile
        ? `[File] ${v.name} (${v.type || "unknown"}, ${v.size} bytes)`
        : String(v),
    });
  }
  return rows;
}

function filterPersonalFormDataRows(rows) {
  return rows.filter(
    (r) => r.key.startsWith("KisiselBilgiler.") || r.key === "VesikalikDosyasi",
  );
}

export default function JobApplicationForm() {
  const { t } = useTranslation();

  useEffect(() => {
    try {
      localStorage.removeItem("job_application_draft");
    } catch (err) {
      console.warn("Draft temizlenemedi:", err);
    }
  }, []);

  const educationTableRef = useRef(null);
  const certificatesTableRef = useRef(null);
  const computerInformationTableRef = useRef(null);
  const languageTableRef = useRef(null);
  const jobExperiencesTableRef = useRef(null);
  const referencesTableRef = useRef(null);

  const [isReturningUser, setIsReturningUser] = useState(false);
  const [returningEmail, setReturningEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // ✅ TÜM LİSTELERİ TUTAN STATE
  const [definitionData, setDefinitionData] = useState({
    ulkeler: [],
    sehirler: [],
    ilceler: [],
    uyruklar: [],
    departmanlar: [],
    pozisyonlar: [],
    subeler: [],
    subeAlanlar: [],
    programlar: [],
    kagitOyunlari: [],
    ehliyetler: [],
    diller: [],
    kktcBelgeler: [],
  });

  const safeCall = async (fn, ...args) => {
    try {
      if (typeof fn !== "function") return [];
      const res = await fn(...args);
      return res?.data ?? res ?? [];
    } catch (e) {
      console.warn("Definition call failed:", e);
      return [];
    }
  };

  const departmentRoles = useMemo(
    () => ({
      "Casino F&B": [
        t("jobDetails.roles.waiter"),
        t("jobDetails.roles.bartender"),
        t("jobDetails.roles.barback"),
        t("jobDetails.roles.commis"),
        t("jobDetails.roles.supervisor"),
      ],
      "Casino Kasa": [
        t("jobDetails.roles.cashier"),
        t("jobDetails.roles.cageSupervisor"),
      ],
      "Casino Slot": [
        t("jobDetails.roles.slotAttendant"),
        t("jobDetails.roles.slotTechnician"),
        t("jobDetails.roles.host"),
      ],
      "Casino Canlı Oyun": [
        t("jobDetails.roles.dealer"),
        t("jobDetails.roles.inspector"),
        t("jobDetails.roles.pitboss"),
      ],
      "Otel Resepsiyon": [
        t("jobDetails.roles.receptionist"),
        t("jobDetails.roles.guestRelations"),
        t("jobDetails.roles.nightAuditor"),
      ],
      "Otel Housekeeping": [
        t("jobDetails.roles.roomAttendant"),
        t("jobDetails.roles.floorSupervisor"),
        t("jobDetails.roles.laundry"),
      ],
    }),
    [t],
  );

  const mainSchema = useMemo(
    () => createMainApplicationSchema(t, departmentRoles),
    [t, departmentRoles],
  );

  const methods = useForm({
    resolver: zodResolver(mainSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, trigger, reset, control, getValues } = methods;

  useEffect(() => {
    const loadDefinitions = async () => {
      try {
        const [
          ulkeler,
          sehirler,
          ilceler,
          uyruklar,
          departmanlar,
          pozisyonlar,
          subeler,
          ehliyetler,
          diller,
          subeAlanlar,
          programlar,
          kagitOyunlari,
          kktcBelgeler,
        ] = await Promise.all([
          safeCall(tanimlamaService.getUlkeler),
          safeCall(tanimlamaService.getSehirler),
          safeCall(tanimlamaService.getIlceler),
          safeCall(tanimlamaService.getUyruklar),
          safeCall(tanimlamaService.getDepartmanlar),
          safeCall(tanimlamaService.getPozisyonlar),
          safeCall(tanimlamaService.getSubeler),
          safeCall(tanimlamaService.getEhliyetTurleri),
          safeCall(tanimlamaService.getDiller),
          safeCall(tanimlamaService.getSubeAlanlar),
          safeCall(tanimlamaService.getProgramlar),
          safeCall(tanimlamaService.getOyunlar),
          safeCall(tanimlamaService.getKktcBelgeler),
        ]);

        setDefinitionData({
          ulkeler,
          sehirler,
          ilceler,
          uyruklar,
          departmanlar,
          pozisyonlar,
          subeler,
          ehliyetler,
          diller,
          subeAlanlar,
          programlar,
          kagitOyunlari,
          kktcBelgeler,
        });
      } catch (error) {
        console.error("Tanımlamalar yüklenemedi:", error);
      }
    };

    loadDefinitions();
  }, [trigger]);

  const personalData = useWatch({ control, name: "personal" });
  const educationData = useWatch({ control, name: "education" });
  const otherInfoData = useWatch({ control, name: "otherInfo" });
  const jobDetailsData = useWatch({ control, name: "jobDetails" });

  const statusState = useMemo(() => {
    const personalOk = createPersonalSchema(t, {
      ulkeler: definitionData.ulkeler,
      uyruklar: definitionData.uyruklar,
      sehirler: definitionData.sehirler,
      ilceler: definitionData.ilceler,
    }).safeParse(personalData).success;

    const educationOk =
      Array.isArray(educationData) && educationData.length > 0;
    const otherOk = createOtherInfoSchema(t).safeParse(otherInfoData).success;
    const jobDetailsOk = createJobDetailsSchema(t, departmentRoles).safeParse(
      jobDetailsData,
    ).success;

    return { personalOk, educationOk, otherOk, jobDetailsOk };
  }, [
    personalData,
    educationData,
    otherInfoData,
    jobDetailsData,
    t,
    departmentRoles,
    definitionData,
  ]);

  const allRequiredOk =
    statusState.personalOk &&
    statusState.educationOk &&
    statusState.otherOk &&
    statusState.jobDetailsOk;

  const scrollToSection = useCallback((targetId, offset = 100) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const y =
      el.getBoundingClientRect().top + window.scrollY - Math.max(offset, 0);
    window.scrollTo({ top: y, behavior: "smooth" });
    el.classList.add(
      "ring-1",
      "ring-sky-500",
      "ring-offset-1",
      "ring-offset-[#0f172a]",
      "transition-all",
      "duration-500",
    );
    setTimeout(() => {
      el.classList.remove(
        "ring-1",
        "ring-sky-500",
        "ring-offset-1",
        "ring-offset-[#0f172a]",
        "transition-all",
        "duration-500",
      );
    }, 1600);
  }, []);

  const SECTION_IDS = {
    personal: "section-personal",
    education: "section-education",
    other: "section-other",
    jobDetails: "section-jobdetails",
  };

  const onAddWithScrollLock = (fn) => () => {
    lockScroll();
    fn?.();
  };

  const handleClearAll = async () => {
    const result = await MySwal.fire({
      ...swalSkyConfig,
      title: t("common.areYouSure"),
      text: t("common.clearAllWarning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common.yesClear"),
      cancelButtonText: t("actions.cancel"),
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      reset(DEFAULT_VALUES);
      setIsReturningUser(false);
      setReturningEmail("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.info(t("toast.formCleared"), {
        theme: "dark",
        position: "top-center",
      });
    }
  };

  const handleFetchProfile = async () => {
    setEmailError("");
    const emailSchema = z.string().email(t("personal.errors.email.invalid"));
    const result = emailSchema.safeParse(returningEmail);

    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }

    setIsLoadingProfile(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const userExists = mockCVData.personal.eposta === returningEmail;
    setIsLoadingProfile(false);

    if (!userExists) {
      toast.error(t("loadProfile.emailNotFound"), {
        position: "top-center",
        theme: "dark",
      });
      return;
    }

    try {
      const { value: otpCode } = await MySwal.fire({
        ...swalSkyConfig,
        title: t("loadProfile.otpTitle"),
        text: t("loadProfile.otpText", { email: returningEmail }),
        input: "text",
        inputAttributes: { maxlength: 6, autocapitalize: "off" },
        showCancelButton: true,
        confirmButtonText: t("loadProfile.verifyBtn"),
        cancelButtonText: t("actions.cancel"),
        showLoaderOnConfirm: true,
        preConfirm: async (code) => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (!code) Swal.showValidationMessage(t("loadProfile.otpRequired"));
          if (code !== "1234")
            Swal.showValidationMessage(t("loadProfile.otpInvalid"));
          return code === "1234";
        },
      });

      if (otpCode) {
        const data = mockCVData;

        reset({
          personal: normalizeLegacyPersonalToDto(data.personal),
          education: data.education,
          certificates: data.certificates,
          computer: data.computer,
          languages: data.languages,
          experience: data.experience,
          references: data.references,
          otherInfo: data.otherInfo,
          jobDetails: data.jobDetails,
        });

        toast.success(t("loadProfile.success"), {
          position: "top-right",
          theme: "dark",
        });

        trigger();
      }
    } catch (e) {
      console.error(e);
      toast.error(t("common.error"), { theme: "dark" });
    }
  };

  /* -------------------- TEST START -------------------- */
  const handleTestPersonal = async () => {
    const current = getValues();
    const dtoPayload = buildPersonelCreateDtoPayload(t, current);
    const fd = objectToFormData(dtoPayload);
    const rows = formDataEntriesToList(fd);
    const personalRows = filterPersonalFormDataRows(rows);
    const personalText = personalRows
      .map((r) => `${r.key} = ${r.value}`)
      .join("\n");

    // Eğitim
    const educationList = current.education || [];
    let educationText = "";
    if (educationList.length === 0)
      educationText = "⚠️ Henüz eğitim bilgisi eklenmedi.";
    else {
      educationList.forEach((item, index) => {
        educationText += `\n--- [Eğitim #${index + 1}] ---\n`;
        educationText += `Okul Adı      : ${item.okul}\n`;
        educationText += `Bölüm         : ${item.bolum}\n`;
        educationText += `Başlangıç     : ${toISODate(item.baslangic)}\n`;
        educationText += `Bitiş         : ${item.bitis ? toISODate(item.bitis) : "Devam"}\n`;
      });
    }

    // Sertifika
    const certList = current.certificates || [];
    let certText = "";
    if (certList.length === 0)
      certText = "⚠️ Henüz sertifika bilgisi eklenmedi.";
    else {
      certList.forEach((item, index) => {
        certText += `\n--- [Sertifika #${index + 1}] ---\n`;
        certText += `Ad            : ${item.ad}\n`;
        certText += `Kurum         : ${item.kurum}\n`;
      });
    }

    // Bilgisayar
    const compList = current.computer || [];
    let compText = "";
    if (compList.length === 0) compText = "⚠️ Bilgisayar bilgisi yok.";
    else {
      compList.forEach((item, index) => {
        compText += `\n--- [Bilgisayar #${index + 1}] ---\n`;
        compText += `Program       : ${item.programAdi}\n`;
      });
    }

    // Dil
    const langList = current.languages || [];
    let langText = "";
    if (langList.length === 0) langText = "⚠️ Dil bilgisi yok.";
    else {
      langList.forEach((item, index) => {
        langText += `\n--- [Dil #${index + 1}] ---\n`;
        langText += `Dil ID        : ${item.dilId || "-"}\n`;
        langText += `Diğer Dil     : ${item.digerDilAdi || "-"}\n`;
      });
    }

    // İş Deneyimi
    const expList = current.experience || [];
    let expText = "";
    if (expList.length === 0) expText = "⚠️ İş deneyimi yok.";
    else {
      expList.forEach((item, index) => {
        expText += `\n--- [Deneyim #${index + 1}] ---\n`;
        expText += `Şirket        : ${item.isAdi}\n`;
        expText += `Pozisyon      : ${item.pozisyon}\n`;
      });
    }

    // Referans
    const refList = current.references || [];
    let refText = "";
    if (refList.length === 0) refText = "⚠️ Referans bilgisi yok.";
    else {
      refList.forEach((item, index) => {
        refText += `\n--- [Referans #${index + 1}] ---\n`;
        refText += `Ad Soyad      : ${item.referansAdi} ${item.referansSoyadi}\n`;
      });
    }

    // ✅ Diğer Bilgiler Görsel Düzeltme (Boşsa - yazsın)
    const oi = current.otherInfo || {};
    const mapVarYok = (val) =>
      val === "1" ? "Var" : val === "2" ? "Yok" : "-";
    const mapEvetHayir = (val) =>
      val === "1" ? "Evet" : val === "2" ? "Hayır" : "-";

    let oiText = "";
    oiText += `KKTC Belge ID : ${oi.kktcGecerliBelge || "-"}\n`;
    oiText += `Dava Durumu   : ${mapVarYok(oi.davaDurumu)}\n`;
    oiText += `Sigara        : ${mapEvetHayir(oi.sigara)}\n`;
    oiText += `Ehliyet       : ${mapVarYok(oi.ehliyet)}\n`;
    oiText += `Ehliyet Tür   : ${oi.ehliyetTurleri?.length ? oi.ehliyetTurleri.join(", ") : "-"}\n`;
    oiText += `Boy           : ${oi.boy || "-"}\n`;
    oiText += `Kilo          : ${oi.kilo || "-"}\n`;

    // ✅ İş Başvuru Detayları (EKLENDİ)
    const jd = current.jobDetails || {};
    const getLabels = (arr) =>
      Array.isArray(arr) && arr.length > 0
        ? arr.map((x) => x.label).join(", ")
        : "-";

    let jobDetailsText = "";
    jobDetailsText += `Şubeler        : ${getLabels(jd.subeler)}\n`;
    jobDetailsText += `Alanlar        : ${getLabels(jd.alanlar)}\n`;
    jobDetailsText += `Departmanlar   : ${getLabels(jd.departmanlar)}\n`;
    jobDetailsText += `Pozisyonlar    : ${getLabels(jd.departmanPozisyonlari)}\n`;
    jobDetailsText += `Programlar     : ${getLabels(jd.programlar)}\n`;
    jobDetailsText += `Kağıt Oyunları : ${getLabels(jd.kagitOyunlari)}\n`;
    jobDetailsText += `Lojman         : ${jd.lojman || "-"}\n`;
    jobDetailsText += `Tercih Nedeni  : ${jd.tercihNedeni || "-"}\n`;

    await MySwal.fire({
      ...swalSkyConfig,
      width: "700px",
      title: "✅ TEST: Veri Önizleme",
      html: `
        <div style="text-align:left; font-size:12px; line-height:1.4; max-height:65vh; overflow-y:auto;">
          
          <div style="margin-bottom: 15px;">
            <h4 style="color:#38bdf8; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
              👤 Kişisel Bilgiler
            </h4>
            <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${personalText || "Kişisel bilgi verisi oluşmadı."}
            </pre>
          </div>

          <div style="margin-bottom: 15px;">
            <h4 style="color:#fbbf24; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
              🎓 Eğitim Bilgileri
            </h4>
            <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${educationText}
            </pre>
          </div>

          <div style="margin-bottom: 15px;">
            <h4 style="color:#a78bfa; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
              🏅 Sertifika Bilgileri
            </h4>
            <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${certText}
            </pre>
          </div>

          <div style="margin-bottom: 15px;">
            <h4 style="color:#f472b6; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
              💻 Bilgisayar Bilgileri
            </h4>
            <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${compText}
            </pre>
          </div>

          <div style="margin-bottom: 15px;">
            <h4 style="color:#34d399; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
              🗣️ Yabancı Dil Bilgileri
            </h4>
            <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${langText}
            </pre>
          </div>

          <div style="margin-bottom: 15px;">
            <h4 style="color:#f87171; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
              💼 İş Deneyimleri
            </h4>
            <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${expText}
            </pre>
          </div>

          <div style="margin-bottom: 15px;">
             <h4 style="color:#0ea5e9; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
               📋 İş Başvuru Detayları
             </h4>
             <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${jobDetailsText}
             </pre>
           </div>

          <div>
            <h4 style="color:#d8b4fe; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
              📞 Referans Bilgileri
            </h4>
            <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${refText}
            </pre>
          </div>

          <div>
            <h4 style="color:#94a3b8; font-weight:bold; margin-bottom:5px; border-bottom:1px solid #334155; padding-bottom:3px;">
              📋 Diğer Bilgiler
            </h4>
            <pre style="white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#cbd5e1; padding:10px; border-radius:8px; border:1px solid #334155;">
${oiText}
            </pre>
          </div>

        </div>
      `,
      confirmButtonText: "Tamam",
    });
  };
  /* -------------------- TEST END -------------------- */

  const handleTestPersonalToApi = async () => {
    try {
      const current = getValues();
      const dtoPayload = buildPersonelCreateDtoPayload(t, current, false);
      // NOT: Burada "testMode=false" gönderiyoruz ki sahte veri eklemesin

      const formDataToSend = objectToFormData(dtoPayload);
      const allRows = formDataEntriesToList(formDataToSend);

      // Sadece dolu olan alanları göster (Temiz görüntü için)
      const relevantRows = allRows.filter(
        (r) => r.value !== "" && r.value !== "0" && r.value !== "null",
      );

      console.table(allRows);

      const res = await basvuruService.testPersonal(formDataToSend);

      await MySwal.fire({
        ...swalSkyConfig,
        title: "✅ TEST API Başarılı",
        width: "700px",
        html: `
          <div style="text-align:left; font-size:12px;">
            <p style="color:#4ade80; font-weight:bold; margin-bottom:10px;">
              Veriler Backend'e ulaştı! Aşağıda GÖNDERİLEN form datayı görebilirsin:
            </p>
            
            <h4 style="color:#fbbf24; border-bottom:1px solid #334155; margin-bottom:5px;">📦 Gönderilen FormData (Sadece Dolu Alanlar)</h4>
            <pre style="white-space:pre-wrap; background:#0f172a; padding:10px; border-radius:8px; border:1px solid #334155; max-height:200px; overflow:auto;">
${relevantRows.length > 0 ? relevantRows.map((r) => `${r.key} = ${r.value}`).join("\n") : "⚠️ Hiçbir veri gönderilmedi (Form boş)"}
            </pre>

            <h4 style="color:#38bdf8; border-bottom:1px solid #334155; margin:10px 0 5px 0;">📩 API Cevabı</h4>
            <pre style="white-space:pre-wrap; background:#0f172a; padding:10px; border-radius:8px; border:1px solid #334155;">
${JSON.stringify(res?.data ?? res, null, 2)}
            </pre>
          </div>
        `,
      });
    } catch (e) {
      console.error("❌ TEST API Hatası:", e);
      const msg = e?.response?.data?.message || e?.message || "Hata";
      await MySwal.fire({
        ...swalSkyConfig,
        icon: "error",
        title: "❌ TEST API Hatası",
        text: JSON.stringify(msg),
      });
    }
  };

  const handleFormSubmit = async (data) => {
    console.log("✅ Form Data (RHF):", data);

    try {
      const applicantEmail = data.personal?.eposta ?? "";

      const { value: otpCode } = await MySwal.fire({
        ...swalSkyConfig,
        title: t("confirm.otp.title"),
        html: t("confirm.otp.text", { email: applicantEmail }),
        input: "text",
        inputAttributes: { maxlength: 6 },
        showCancelButton: true,
        confirmButtonText: t("confirm.otp.verifyAndSubmit"),
        cancelButtonText: t("actions.cancel"),
        preConfirm: (code) => {
          if (!code) Swal.showValidationMessage(t("loadProfile.otpRequired"));
          return code;
        },
      });

      if (otpCode === "1234") {
        const dtoPayload = buildPersonelCreateDtoPayload(t, data);
        const formDataToSend = objectToFormData(dtoPayload);
        const rows = formDataEntriesToList(formDataToSend);

        const preview = await MySwal.fire({
          ...swalSkyConfig,
          title: "Başvuru Gönderimi Önizleme",
          html: `
      <div style="text-align:left; font-size:12px; line-height:1.4;">
        <p style="margin:0 0 8px 0; opacity:0.9;">
          Aşağıdaki veriler <b>FormData</b> olarak API’ye gönderilecek:
        </p>
        <pre style="white-space:pre-wrap; word-break:break-word; background:#0b1220; padding:10px; border-radius:10px; border:1px solid #334155; max-height: 420px; overflow:auto;">
${rows.map((r) => `${r.key} = ${r.value}`).join("\n")}
        </pre>
      </div>
    `,
          showCancelButton: true,
          confirmButtonText: "Onayla & Gönder",
          cancelButtonText: t("actions.cancel"),
        });

        if (!preview.isConfirmed) {
          toast.info("Gönderim iptal edildi.", {
            theme: "dark",
            position: "top-center",
          });
          return;
        }

        const response = await basvuruService.create(formDataToSend);

        if (response || response?.success) {
          toast.success(t("confirm.success.submit"), {
            theme: "dark",
            position: "top-center",
          });
          reset(DEFAULT_VALUES);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (otpCode) {
        toast.error(t("loadProfile.otpInvalid"), { theme: "dark" });
      }
    } catch (e) {
      console.error("API Hatası:", e);
      const errorMsg = e?.response?.data?.message || t("confirm.error.submit");
      toast.error(errorMsg, { theme: "dark" });
    }
  };

  return (
    <FormProvider
      {...methods}
      key={t("langKey", { defaultValue: "" }) + JSON.stringify(departmentRoles)}
    >
      <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#334155] via-[#0f172a] to-black pb-10 shadow-2xl border-x border-gray-800/50">
        <div className="relative overflow-hidden bg-linear-to-br from-black via-[#111827] to-black py-12 sm:py-16 md:py-20 shadow-2xl rounded-b-2xl text-center border-b border-gray-800">
          <div className="absolute flex flex-row top-4 right-4 z-20">
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 hover:bg-gray-700 transition-colors">
              <FontAwesomeIcon icon={faGlobe} className="text-gray-400" />
              <LanguageSwitcher />
            </div>
          </div>
          <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wider text-white drop-shadow-lg leading-tight font-sans">
              {t("hero.brand")}
            </h1>
            <h2 className="mt-3 text-lg sm:text-xl font-light text-gray-300 tracking-[0.2em] uppercase opacity-80">
              {t("hero.formTitle")}
            </h2>
            <div className="mt-8 flex items-center gap-2 text-sm sm:text-base text-gray-400 bg-gray-900/60 px-5 py-2.5 rounded-full border border-gray-800/50 shadow-sm ">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-red-500 text-lg"
              />
              <span>
                <span className="text-red-500 font-bold tracking-wide">
                  {t("hero.please")}
                </span>{" "}
                <span className="text-gray-300">{t("hero.notice")}</span>{" "}
                <span className="text-red-500 font-bold mx-1">*</span>{" "}
                <span className="text-gray-300">
                  {t("hero.requiredSuffix")}
                </span>
              </span>
            </div>
            <div className="mt-10 w-24 h-1 bg-linear-to-r from-transparent via-gray-700 to-transparent rounded-full opacity-60" />
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-transparent via-sky-900/5 to-transparent pointer-events-none" />
        </div>

        {/* Load Profile Section */}
        <div className="container mx-auto px-3 sm:px-6 lg:px-10 mt-8">
          <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-xl border border-sky-500/20 shadow-lg p-1 overflow-hidden relative group transition-all duration-300 hover:border-sky-500/40">
            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
            <div className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500/10 p-2 rounded-lg text-sky-500">
                    <FontAwesomeIcon icon={faRotateLeft} size="lg" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {t("loadProfile.title")}
                  </h3>
                </div>
                <p className="text-slate-400 text-sm pl-12 max-w-xl">
                  {t("loadProfile.description")}
                </p>
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
                {!isReturningUser ? (
                  <button
                    type="button"
                    onClick={() => setIsReturningUser(true)}
                    className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all text-sm border border-slate-600 hover:border-sky-500/50"
                  >
                    {t("loadProfile.buttonYes")}
                  </button>
                ) : (
                  <div className="flex flex-col w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                          <FontAwesomeIcon icon={faEnvelope} />
                        </span>
                        <input
                          type="email"
                          placeholder={t("loadProfile.emailPlaceholder")}
                          value={returningEmail}
                          onChange={(e) => {
                            setReturningEmail(e.target.value);
                            if (emailError) setEmailError("");
                          }}
                          className={`pl-10 pr-4 py-2.5 w-full sm:w-64 bg-slate-950 border rounded-lg text-white placeholder-gray-500 outline-none text-sm transition-colors ${
                            emailError
                              ? "border-red-500 focus:border-red-500"
                              : "border-slate-600 focus:border-sky-500"
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleFetchProfile}
                        disabled={isLoadingProfile}
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-1 focus:ring-offset-slate-900"
                      >
                        {isLoadingProfile ? (
                          <span className="animate-spin h-4 w-4 border border-t-transparent rounded-full"></span>
                        ) : (
                          <>
                            <span>{t("loadProfile.fetchBtn")}</span>
                            <FontAwesomeIcon icon={faShieldHalved} />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReturningUser(false);
                          setEmailError("");
                          setReturningEmail("");
                        }}
                        className="px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        {t("actions.cancel")}
                      </button>
                    </div>
                    {emailError && (
                      <span className="text-red-400 text-xs mt-1 ml-1">
                        {emailError}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="sticky top-4 z-40 container mx-auto px-3 sm:px-6 lg:px-10 mt-6">
          <div className="bg-[#1e293b]/80 rounded-xl border border-slate-700/50 shadow-2xl px-5 py-3 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3 border-b md:border-b-0 border-slate-700 pb-2 md:pb-0 w-full md:w-auto justify-center md:justify-start">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${
                  allRequiredOk
                    ? "border-green-500 bg-green-500/10 text-green-400"
                    : "border-red-500 bg-red-500/10 text-red-400"
                }`}
              >
                <FontAwesomeIcon
                  icon={allRequiredOk ? faCheckCircle : faCircleXmark}
                  className="text-xl"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    allRequiredOk ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {t("statusBar.title")}
                </span>
                <span
                  className={`text-sm font-bold ${
                    allRequiredOk ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {allRequiredOk
                    ? t("statusBar.completed")
                    : t("statusBar.missing")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
              <StatusPill
                ok={statusState.personalOk}
                label={t("sections.personal")}
                icon={faUser}
                onClick={() => scrollToSection(SECTION_IDS.personal)}
              />
              <StatusPill
                ok={statusState.educationOk}
                label={t("sections.education")}
                icon={faGraduationCap}
                onClick={() => scrollToSection(SECTION_IDS.education)}
              />
              <StatusPill
                ok={statusState.otherOk}
                label={t("sections.other")}
                icon={faUserCog}
                onClick={() => scrollToSection(SECTION_IDS.other)}
              />
              <StatusPill
                ok={statusState.jobDetailsOk}
                label={t("sections.jobDetails")}
                icon={faFileSignature}
                onClick={() => scrollToSection(SECTION_IDS.jobDetails)}
              />
            </div>
          </div>
        </div>

        {/* TEST BUTTONS */}
        <div className="container mx-auto px-3 sm:px-6 lg:px-10 mt-4 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            type="button"
            onClick={handleTestPersonal}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            ✅ TEST: Kişisel Bilgiler Nasıl Gidiyor?
          </button>

          <button
            type="button"
            onClick={handleTestPersonalToApi}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            🚀 TEST: Personal DB'ye Gidiyor mu?
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium transition-all duration-300 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-600/20 active:scale-95"
          >
            <FontAwesomeIcon
              icon={faTrashAlt}
              className="text-lg transition-transform duration-300 group-hover:rotate-12"
            />
            <span>{t("common.clearFormBtn")}</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="container mx-auto px-3 sm:px-6 lg:px-10 space-y-8 mt-5"
        >
          <Section
            id={SECTION_IDS.personal}
            icon={faUser}
            title={t("sections.personal")}
            required
            content={<PersonalInformation definitions={definitionData} />}
          />

          <Section
            id={SECTION_IDS.education}
            icon={faGraduationCap}
            title={t("sections.education")}
            required
            onAdd={onAddWithScrollLock(() =>
              educationTableRef.current?.openCreate(),
            )}
            content={<EducationTable ref={educationTableRef} />}
          />

          <Section
            icon={faAward}
            title={t("sections.certificates")}
            onAdd={onAddWithScrollLock(() =>
              certificatesTableRef.current?.openCreate(),
            )}
            content={<CertificateTable ref={certificatesTableRef} />}
          />

          <Section
            icon={faLaptopCode}
            title={t("sections.computer")}
            onAdd={onAddWithScrollLock(() =>
              computerInformationTableRef.current?.openCreate(),
            )}
            content={
              <ComputerInformationTable ref={computerInformationTableRef} />
            }
          />

          <Section
            icon={faLanguage}
            title={t("sections.languages")}
            onAdd={onAddWithScrollLock(() =>
              languageTableRef.current?.openCreate(),
            )}
            content={
              <LanguageTable
                ref={languageTableRef}
                definitions={definitionData} // ✅ Definitions Prop'u gönderildi
              />
            }
          />

          <Section
            icon={faBriefcase}
            title={t("sections.experience")}
            onAdd={onAddWithScrollLock(() =>
              jobExperiencesTableRef.current?.openCreate(),
            )}
            content={
              <JobExperiencesTable
                ref={jobExperiencesTableRef}
                definitions={definitionData}
              />
            }
          />

          <Section
            icon={faPhoneVolume}
            title={t("sections.references")}
            onAdd={onAddWithScrollLock(() =>
              referencesTableRef.current?.openCreate(),
            )}
            content={<ReferencesTable ref={referencesTableRef} />}
          />

          <Section
            id={SECTION_IDS.other}
            icon={faUserCog}
            title={t("sections.other")}
            required
            content={
              <OtherPersonalInformationTable definitions={definitionData} /> // ✅ Prop
            }
          />

          <Section
            id={SECTION_IDS.jobDetails}
            icon={faFileSignature}
            title={t("sections.jobDetails")}
            required
            content={<JobApplicationDetails definitions={definitionData} />}
          />

          <ApplicationConfirmSection
            onSubmit={() => handleSubmit(handleFormSubmit)()}
            isValidPersonal={statusState.personalOk}
            isValidEducation={statusState.educationOk}
            isValidOtherInfo={statusState.otherOk}
            isValidJobDetails={statusState.jobDetailsOk}
          />
        </form>
      </div>
    </FormProvider>
  );
}

function StatusPill({ ok, label, icon, onClick }) {
  let colors =
    "bg-[#1e293b] border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white";
  if (ok === true)
    colors =
      "bg-green-900/20 border-green-500/30 text-green-400 hover:bg-green-900/30 hover:text-green-300";
  else if (ok === false)
    colors =
      "bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/30 hover:text-red-300";

  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 select-none focus:outline-none cursor-pointer active:scale-95 ${colors}`}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} className="text-sm" />{" "}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function Section({ id, icon, title, required = false, onAdd, content }) {
  const { t } = useTranslation();
  return (
    <div
      id={id}
      className="bg-[#1e293b] rounded-xl border border-slate-700 shadow-lg overflow-hidden transition-all hover:border-slate-600"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-5 sm:px-6 py-5 border-b border-slate-700/80">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900/50 border border-slate-700 shadow-inner">
            <FontAwesomeIcon
              icon={icon}
              className="text-slate-300 text-lg sm:text-xl shrink-0"
            />
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-100 truncate flex items-center gap-2 tracking-tight">
            {title}{" "}
            {required && (
              <span className="text-red-400 text-sm align-top">*</span>
            )}
          </h4>
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200 focus:outline-none text-sm active:scale-95 border border-sky-500/20"
          >
            <FontAwesomeIcon icon={faPlus} /> <span>{t("actions.add")}</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto bg-slate-50 text-slate-800 border-t border-slate-200/50">
        {content}
      </div>
    </div>
  );
}
