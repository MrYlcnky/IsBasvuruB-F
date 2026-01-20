import { useMemo, useRef, useState, useCallback } from "react";
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
  faTrashAlt, // YENİ: Silme ikonu
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
import { useFormPersist } from "./modalHooks/useFormPersist";

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

// YENİ: Varsayılan değerleri dışarı aldık (Reset işleminde kullanmak için)
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
    uyruk: "",
    cocukSayisi: "",
    dogumUlke: "",
    dogumSehir: "",
    dogumIlce: "",
    ikametUlke: "",
    ikametSehir: "",
    ikametIlce: "",
    foto: null,
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

export default function JobApplicationForm() {
  const { t } = useTranslation();

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
    [t]
  );

  const mainSchema = useMemo(
    () => createMainApplicationSchema(t, departmentRoles),
    [t, departmentRoles]
  );

  const methods = useForm({
    resolver: zodResolver(mainSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES, // Sabit değişkeni kullandık
  });

  const { handleSubmit, trigger, reset, control } = methods;

  // Auto-Save Hook'u
  const { clearStorage } = useFormPersist("job_application_draft", methods);

  const personalData = useWatch({ control, name: "personal" });
  const educationData = useWatch({ control, name: "education" });
  const otherInfoData = useWatch({ control, name: "otherInfo" });
  const jobDetailsData = useWatch({ control, name: "jobDetails" });

  const statusState = useMemo(() => {
    const personalOk = createPersonalSchema(t).safeParse(personalData).success;
    const educationOk = educationData && educationData.length > 0;
    const otherOk = createOtherInfoSchema(t).safeParse(otherInfoData).success;
    const jobDetailsOk = createJobDetailsSchema(t, departmentRoles).safeParse(
      jobDetailsData
    ).success;

    return { personalOk, educationOk, otherOk, jobDetailsOk };
  }, [
    personalData,
    educationData,
    otherInfoData,
    jobDetailsData,
    t,
    departmentRoles,
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
      "duration-500"
    );
    setTimeout(() => {
      el.classList.remove(
        "ring-1",
        "ring-sky-500",
        "ring-offset-1",
        "ring-offset-[#0f172a]",
        "transition-all",
        "duration-500"
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

  /* --- YENİ: FORMU TEMİZLEME FONKSİYONU --- */
  const handleClearAll = async () => {
    const result = await MySwal.fire({
      ...swalSkyConfig,
      title: t("common.areYouSure"), // "Emin misiniz?"
      text: t("common.clearAllWarning"), // "Tüm form verileri silinecek..."
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common.yesClear"), // "Evet, Temizle"
      cancelButtonText: t("actions.cancel"), // "İptal"
      confirmButtonColor: "#ef4444", // Kırmızı
    });

    if (result.isConfirmed) {
      // 1. LocalStorage'ı temizle
      clearStorage();

      // 2. Formu varsayılan (boş) değerlere döndür
      reset(DEFAULT_VALUES);

      // 3. State'leri sıfırla
      setIsReturningUser(false);
      setReturningEmail("");

      // 4. Kullanıcıyı yukarı kaydır ve bilgi ver
      window.scrollTo({ top: 0, behavior: "smooth" });
      // İstersen burayı da çevirebilirsin: t("toast.formCleared") gibi
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
          personal: data.personal,
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

  const handleFormSubmit = async (data) => {
    console.log("✅ Form Valid:", data);
    try {
      const applicantEmail = data.personal.eposta;
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
        clearStorage(); // Gönderim sonrası taslağı sil
        toast.success("Başvuru alındı!", {
          theme: "dark",
          position: "top-center",
        });
      } else if (otpCode) {
        toast.error(t("loadProfile.otpInvalid"), {
          theme: "dark",
          position: "top-center",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(t("confirm.error.submit"), { theme: "dark" });
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#334155] via-[#0f172a] to-black pb-10 shadow-2xl border-x border-gray-800/50">
        {/* ... (Hero Header aynı) ... */}
        <div className="relative overflow-hidden bg-gradient-to-br from-black via-[#111827] to-black py-12 sm:py-16 md:py-20 shadow-2xl rounded-b-2xl text-center border-b border-gray-800">
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
            <div className="mt-10 w-24 h-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent rounded-full opacity-60" />
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-transparent via-sky-900/5 to-transparent pointer-events-none" />
        </div>

        {/* Load Profile Section */}
        <div className="container mx-auto px-3 sm:px-6 lg:px-10 mt-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-sky-500/20 shadow-lg p-1 overflow-hidden relative group transition-all duration-300 hover:border-sky-500/40">
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
                        onClick={handleFetchProfile}
                        disabled={isLoadingProfile}
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-1 focus:ring-offset-slate-900"
                      >
                        {isLoadingProfile ? (
                          <span className="animate-spin h-4 w-4 border-1 border-t-transparent rounded-full"></span>
                        ) : (
                          <>
                            <span>{t("loadProfile.fetchBtn")}</span>
                            <FontAwesomeIcon icon={faShieldHalved} />
                          </>
                        )}
                      </button>
                      <button
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

        {/* YENİ: Formu Temizle Butonu  */}
        <div className="flex justify-center pt-5 ">
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
        {/* Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="container mx-auto px-3 sm:px-6 lg:px-10 space-y-8 mt-5"
        >
          <Section
            id={SECTION_IDS.personal}
            icon={faUser}
            title={t("sections.personal")}
            required
            content={<PersonalInformation />}
          />
          <Section
            id={SECTION_IDS.education}
            icon={faGraduationCap}
            title={t("sections.education")}
            required
            onAdd={onAddWithScrollLock(() =>
              educationTableRef.current?.openCreate()
            )}
            content={<EducationTable ref={educationTableRef} />}
          />
          <Section
            icon={faAward}
            title={t("sections.certificates")}
            onAdd={onAddWithScrollLock(() =>
              certificatesTableRef.current?.openCreate()
            )}
            content={<CertificateTable ref={certificatesTableRef} />}
          />
          <Section
            icon={faLaptopCode}
            title={t("sections.computer")}
            onAdd={onAddWithScrollLock(() =>
              computerInformationTableRef.current?.openCreate()
            )}
            content={
              <ComputerInformationTable ref={computerInformationTableRef} />
            }
          />
          <Section
            icon={faLanguage}
            title={t("sections.languages")}
            onAdd={onAddWithScrollLock(() =>
              languageTableRef.current?.openCreate()
            )}
            content={<LanguageTable ref={languageTableRef} />}
          />
          <Section
            icon={faBriefcase}
            title={t("sections.experience")}
            onAdd={onAddWithScrollLock(() =>
              jobExperiencesTableRef.current?.openCreate()
            )}
            content={<JobExperiencesTable ref={jobExperiencesTableRef} />}
          />
          <Section
            icon={faPhoneVolume}
            title={t("sections.references")}
            onAdd={onAddWithScrollLock(() =>
              referencesTableRef.current?.openCreate()
            )}
            content={<ReferencesTable ref={referencesTableRef} />}
          />
          <Section
            id={SECTION_IDS.other}
            icon={faUserCog}
            title={t("sections.other")}
            required
            content={<OtherPersonalInformationTable />}
          />
          <Section
            id={SECTION_IDS.jobDetails}
            icon={faFileSignature}
            title={t("sections.jobDetails")}
            required
            content={<JobApplicationDetails />}
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
