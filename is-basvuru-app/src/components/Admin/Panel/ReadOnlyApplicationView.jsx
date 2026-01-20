// src/components/Admin/Panel/ReadOnlyApplicationView.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGraduationCap,
  faAward,
  faLaptopCode,
  faLanguage,
  faBriefcase,
  faPhoneVolume,
  faUserCog,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../Users/modalHooks/dateUtils";

export default function ReadOnlyApplicationView({ data }) {
  if (!data) return null;

  const NA = <span className="text-gray-500 text-sm italic">-</span>;
  const personal = data.personal || {};
  const education = data.education || [];
  const certificates = data.certificates || [];
  const computer = data.computer || [];
  const languages = data.languages || [];
  const experience = data.experience || [];
  const references = data.references || [];
  const otherInfo = data.otherInfo || {};
  const jobDetails = data.jobDetails || {};

  return (
    <div className="space-y-6 pb-8">
      {/* 1. KİŞİSEL BİLGİLER */}
      <Section icon={faUser} title="1. Kişisel Bilgiler">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Fotoğraf Alanı */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            {personal.foto ? (
              <img
                src={personal.foto}
                alt="Aday"
                className="w-32 h-40 object-cover rounded-lg border border-gray-600 shadow-lg"
              />
            ) : (
              <div className="w-32 h-40 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 border border-gray-600">
                <FontAwesomeIcon icon={faUser} size="3x" />
              </div>
            )}
          </div>

          {/* Bilgiler */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            <Field
              label="Ad Soyad"
              value={`${personal.ad || ""} ${personal.soyad || ""}`}
            />
            <Field
              label="Doğum Tarihi"
              value={formatDate(personal.dogumTarihi)}
            />
            <Field label="Cinsiyet" value={personal.cinsiyet} />
            <Field label="E-posta" value={personal.eposta} />
            <Field label="Telefon" value={personal.telefon} />
            <Field label="Medeni Durum" value={personal.medeniDurum} />
            <Field label="Uyruk" value={personal.uyruk} />
            <Field
              label="Doğum Yeri"
              value={`${personal.dogumSehir || ""}, ${
                personal.dogumUlke || ""
              }`}
            />
            <Field
              label="İkamet"
              value={`${personal.ikametSehir || ""}, ${
                personal.ikametUlke || ""
              }`}
              className="sm:col-span-2"
            />
            <Field
              label="Adres"
              value={personal.adres}
              className="sm:col-span-3"
            />
          </div>
        </div>
      </Section>

      {/* 2. EĞİTİM */}
      <Section icon={faGraduationCap} title="2. Eğitim Bilgileri">
        <DataTable
          headers={["Seviye", "Okul", "Bölüm", "Tarih", "Durum", "GANO"]}
          rows={education.map((e) => [
            e.seviye,
            e.okul,
            e.bolum,
            `${formatDate(e.baslangic)} - ${formatDate(e.bitis)}`,
            e.diplomaDurum,
            `${e.gano || "-"}`,
          ])}
        />
      </Section>

      {/* 3. SERTİFİKALAR */}
      <Section icon={faAward} title="3. Sertifika ve Eğitimler">
        <DataTable
          headers={["Eğitim Adı", "Kurum", "Süre", "Veriliş Tarihi"]}
          rows={certificates.map((c) => [
            c.ad,
            c.kurum,
            c.sure,
            formatDate(c.verilisTarihi),
          ])}
        />
      </Section>

      {/* 4. İŞ DENEYİMİ */}
      <Section icon={faBriefcase} title="4. İş Deneyimleri">
        <DataTable
          headers={["Şirket", "Pozisyon", "Süre", "Ayrılış Sebebi"]}
          rows={experience.map((e) => [
            e.isAdi,
            e.pozisyon,
            `${formatDate(e.baslangicTarihi)} - ${
              e.halenCalisiyor ? "Devam" : formatDate(e.bitisTarihi)
            }`,
            e.ayrilisSebebi,
          ])}
        />
      </Section>

      {/* 5. DİĞER (Grid Yapısı) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section icon={faLanguage} title="5. Yabancı Dil">
          <DataTable
            headers={["Dil", "Seviye (K/D/O/Y)"]}
            rows={languages.map((l) => [
              l.dil,
              `${l.konusma}/${l.dinleme}/${l.okuma}/${l.yazma}`,
            ])}
          />
        </Section>
        <Section icon={faLaptopCode} title="6. Bilgisayar">
          <DataTable
            headers={["Program", "Yetkinlik"]}
            rows={computer.map((c) => [c.programAdi, c.yetkinlik])}
          />
        </Section>
      </div>

      {/* 7. REFERANSLAR */}
      <Section icon={faPhoneVolume} title="7. Referanslar">
        <DataTable
          headers={["Ad Soyad", "Kurum", "Telefon"]}
          rows={references.map((r) => [
            `${r.referansAdi} ${r.referansSoyadi}`,
            r.calistigiKurum,
            r.referansTelefon,
          ])}
        />
      </Section>

      {/* 8. DİĞER BİLGİLER (Grid) */}
      <Section icon={faUserCog} title="8. Diğer Kişisel Bilgiler">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Field
            label="Ehliyet"
            value={`${otherInfo.ehliyet || NA} (${(
              otherInfo.ehliyetTurleri || []
            ).join(", ")})`}
          />
          <Field label="Askerlik" value={otherInfo.askerlik} />
          <Field label="Sigara" value={otherInfo.sigara} />
          <Field label="Dava Durumu" value={otherInfo.davaDurumu} />
          <Field
            label="Fiziksel"
            value={`${otherInfo.boy || "-"} cm / ${otherInfo.kilo || "-"} kg`}
          />
          <Field
            label="Rahatsızlık"
            value={otherInfo.kaliciRahatsizlik}
            className="md:col-span-3"
          />
        </div>
      </Section>

      {/* 9. İŞ DETAYLARI */}
      <Section icon={faFileSignature} title="9. İş Başvuru Detayları">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Field
            label="Şubeler"
            value={jobDetails.subeler?.map((o) => o.label).join(", ")}
          />
          <Field
            label="Departmanlar"
            value={jobDetails.departmanlar?.map((o) => o.label).join(", ")}
          />
          <Field label="Lojman" value={jobDetails.lojman} />
          <Field
            label="Tercih Nedeni"
            value={jobDetails.tercihNedeni}
            className="sm:col-span-3"
          />
        </div>
      </Section>
    </div>
  );
}

// --- Alt Bileşenler ---

function Section({ icon, title, children }) {
  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex items-center gap-3">
        <FontAwesomeIcon icon={icon} className="text-sky-400" />
        <h4 className="font-semibold text-gray-200 text-sm uppercase tracking-wide">
          {title}
        </h4>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Field({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm text-gray-200 font-medium break-words">
        {value || <span className="text-gray-600">-</span>}
      </p>
    </div>
  );
}

function DataTable({ headers, rows }) {
  if (!rows || rows.length === 0)
    return <p className="text-sm text-gray-500 italic">Veri girilmemiş.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-900/40">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-gray-300 whitespace-nowrap"
                >
                  {cell || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
