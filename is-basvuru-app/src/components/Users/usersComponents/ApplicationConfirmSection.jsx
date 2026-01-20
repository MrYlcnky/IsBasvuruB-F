import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faUserShield,
  faPhoneVolume,
  faPaperPlane,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const ApplicationConfirmSection = ({
  isValidPersonal,
  isValidEducation,
  isValidOtherInfo,
  isValidJobDetails,
  onSubmit,
}) => {
  const { t, i18n } = useTranslation();

  const [checks, setChecks] = useState({
    dogruluk: false,
    kvkk: false,
    referans: false,
  });

  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const handleCheck = (e) => {
    const { id, checked } = e.target;
    setChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async () => {
    const missingSections = [];

    if (!isValidPersonal) missingSections.push(t("sections.personal"));
    if (!isValidEducation) missingSections.push(t("sections.education"));
    if (!isValidOtherInfo) missingSections.push(t("sections.other"));
    if (!isValidJobDetails) missingSections.push(t("sections.jobDetails"));

    const allChecked = Object.values(checks).every(Boolean);
    if (!allChecked) missingSections.push(t("confirm.checks"));

    if (!recaptchaToken) missingSections.push("reCAPTCHA");

    if (missingSections.length > 0) {
      Swal.fire({
        icon: "error",
        title: t("confirm.missing.title"),
        html: `
          <div style="text-align:left">
            <p>${t("confirm.missing.bodyIntro")}</p>
            <ul style="margin-top:8px; line-height:1.6; font-weight:600; color:#ef4444">
              ${missingSections.map((s) => `<li>• ${s}</li>`).join("")}
            </ul>
          </div>
        `,
        background: "#1e293b",
        color: "#fff",
        confirmButtonColor: "#ef4444",
        confirmButtonText: t("actions.close"),
      });
      return;
    }

    if (onSubmit) {
      onSubmit(recaptchaToken, () => {
        recaptchaRef.current?.reset();
        setRecaptchaToken("");
        setChecks({ dogruluk: false, kvkk: false, referans: false });
        toast.success(t("confirm.toast.success"), {
          position: "top-center",
          theme: "dark",
        });
      });
    } else {
      toast.success(t("confirm.toast.success"));
    }
  };

  const captchaHl = (i18n.resolvedLanguage || i18n.language || "tr")
    .slice(0, 2)
    .toLowerCase();

  return (
    <div className="mt-10 pb-20">
      {/* KUTU */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-700 shadow-lg overflow-hidden transition-all hover:border-slate-600 hover:shadow-2xl">
        {/* Başlık (Koyu) */}
        <div className="px-5 sm:px-6 py-5 border-b border-slate-700/80 flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900/50 border border-slate-700 shadow-inner shrink-0">
            <FontAwesomeIcon
              icon={faClipboardCheck}
              className="text-slate-300 text-lg"
            />
          </div>
          <div>
            {/* DÜZELTME: Başlık ve açıklama çeviriye bağlandı */}
            <h3 className="text-lg font-bold text-slate-100 leading-tight">
              {t("confirm.sectionTitle")}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {t("confirm.sectionDesc")}
            </p>
          </div>
        </div>

        {/* İçerik (Açık) */}
        <div className="bg-slate-50 border-t border-slate-200/50 p-6 sm:p-8 space-y-8">
          {/* Kartlar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ConfirmCard
              id="dogruluk"
              icon={faCheckCircle}
              title={t("confirm.cards.truth.title")}
              text={t("confirm.cards.truth.text")}
              checked={checks.dogruluk}
              onChange={handleCheck}
            />
            <ConfirmCard
              id="kvkk"
              icon={faUserShield}
              title={t("confirm.cards.kvkk.title")}
              text={t("confirm.cards.kvkk.text")}
              checked={checks.kvkk}
              onChange={handleCheck}
            />
            <ConfirmCard
              id="referans"
              icon={faPhoneVolume}
              title={t("confirm.cards.reference.title")}
              text={t("confirm.cards.reference.text")}
              checked={checks.referans}
              onChange={handleCheck}
            />
          </div>

          <div className="border-t border-gray-200" />

          {/* ReCAPTCHA ve Buton */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-30">
            <div className="recaptcha-wrap focus:outline-none focus:ring-0">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={SITE_KEY}
                onChange={(t) => setRecaptchaToken(t || "")}
                theme="light"
                size="normal"
                hl={captchaHl}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!recaptchaToken}
              className={`
                relative overflow-hidden group
                inline-flex items-center justify-center gap-3 px-8 py-4 
                rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ease-out
                ${
                  recaptchaToken
                    ? "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white transform hover:-translate-y-1 hover:shadow-sky-500/25"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                }
              `}
              aria-label={t("confirm.submit")}
              title={t("confirm.submit")}
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                className={`transition-transform duration-300 ${
                  recaptchaToken
                    ? "group-hover:translate-x-1 group-hover:-translate-y-1"
                    : ""
                }`}
              />
              <span>{t("confirm.submit")}</span>

              {recaptchaToken && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ConfirmCard({ id, icon, title, text, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className={`
        relative flex flex-col p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group
        ${
          checked
            ? "bg-sky-50 border-sky-500 shadow-md ring-1 ring-sky-500"
            : "bg-white border-gray-200 hover:border-sky-400 hover:shadow-sm"
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="relative mt-1">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
          />
          <div
            className={`
            w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200
            ${
              checked
                ? "bg-sky-500 border-sky-500"
                : "border-gray-300 bg-gray-50 group-hover:border-sky-400"
            }
          `}
          >
            {checked && (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-white text-sm"
              />
            )}
          </div>
        </div>

        <div className="flex-1">
          <h4
            className={`text-sm font-bold mb-1 transition-colors ${
              checked ? "text-sky-700" : "text-gray-800"
            }`}
          >
            {title}
          </h4>
          <p
            className={`text-xs leading-relaxed transition-colors ${
              checked ? "text-sky-600" : "text-gray-500"
            }`}
          >
            {text}
          </p>
        </div>

        <FontAwesomeIcon
          icon={icon}
          className={`absolute bottom-2 right-2 text-4xl transition-all duration-300 opacity-5 
          ${
            checked ? "text-sky-600 opacity-10 scale-110" : "text-gray-400"
          } group-hover:scale-105`}
        />
      </div>
    </label>
  );
}

export default ApplicationConfirmSection;
