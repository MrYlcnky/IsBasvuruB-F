import { useState, forwardRef, useImperativeHandle } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EducationAddModal from "../addModals/EducationAddModal";
import { formatDate } from "../modalHooks/dateUtils";

/* -------------------- 1. Çeviri Fonksiyonları (Enum -> Text) -------------------- */
// Backend'den veya Modal'dan gelen ID'leri (1, 2, 3) kullanıcıya anlamlı metne çevirir.

const getSeviyeLabel = (val, t) => {
  const map = {
    1: t("education.levels.highschool"), // Lise
    2: t("education.levels.associate"), // Ön Lisans
    3: t("education.levels.bachelor"), // Lisans
    4: t("education.levels.master"), // Yüksek Lisans
    5: t("education.levels.phd"), // Doktora
    6: t("education.levels.other"), // Diğer
  };
  return map[Number(val)] || val; // Eşleşme yoksa olduğu gibi göster
};

const getDiplomaLabel = (val, t) => {
  const map = {
    1: t("education.diploma.graduated"), // Mezun
    2: t("education.diploma.continuing"), // Devam
    3: t("education.diploma.paused"), // Ara Verdi
    4: t("education.diploma.dropped"), // Terk
  };
  return map[Number(val)] || val;
};

// ✅ GÜNCELLEME: Backend Enum ID'lerine göre etiketleme (1=Yüzlük, 2=Dörtlük)
const getNotSistemiLabel = (val, t) => {
  const numVal = Number(val);
  if (numVal === 1) return t("education.gradeSystem.hundred"); // Yüzlük Sistem
  if (numVal === 2) return t("education.gradeSystem.four"); // Dörtlük Sistem
  return String(val ?? t("common.dash"));
};

const EducationTable = forwardRef((props, ref) => {
  const { t } = useTranslation();

  // --- React Hook Form Entegrasyonu ---
  const { control, setValue } = useFormContext();
  const rows = useWatch({ control, name: "education" }) || [];

  // --- Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // --- CRUD İşlemleri ---
  const handleSave = (newData) => {
    const updatedList = [...rows, newData];
    setValue("education", updatedList, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setModalOpen(false);
    toast.success(t("toast.saved") || "Kayıt eklendi");
  };

  const handleUpdate = (updatedData) => {
    if (selectedIndex > -1) {
      const updatedList = [...rows];
      updatedList[selectedIndex] = updatedData;
      setValue("education", updatedList, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setModalOpen(false);
      toast.success(t("toast.updated") || "Kayıt güncellendi");
    }
  };

  const handleDelete = async (row, index) => {
    const res = await Swal.fire({
      title: t("education.delete.title"),
      text: t("education.delete.text", { school: row.okul, dept: row.bolum }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: t("actions.cancel"),
      confirmButtonText: t("actions.delete"),
    });

    if (res.isConfirmed) {
      const updatedList = rows.filter((_, i) => i !== index);
      setValue("education", updatedList, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success(t("toast.deleted"));
    }
  };

  const openCreate = () => {
    setModalMode("create");
    setSelectedRow(null);
    setSelectedIndex(-1);
    setModalOpen(true);
  };

  const openEdit = (row, index) => {
    setModalMode("edit");
    setSelectedRow(row);
    setSelectedIndex(index);
    setModalOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openCreate,
  }));

  return (
    <div>
      {rows.length !== 0 && (
        <div className="overflow-x-auto rounded-b-lg ring-1 ring-gray-200 bg-white">
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">{t("education.table.level")}</th>
                <th className="px-4 py-3">{t("education.table.school")}</th>
                <th className="px-4 py-3">{t("education.table.department")}</th>
                <th className="px-4 py-3">
                  {t("education.table.gradeSystem")}
                </th>
                <th className="px-4 py-3">{t("education.table.gpa")}</th>
                <th className="px-4 py-3">{t("education.table.start")}</th>
                <th className="px-4 py-3">{t("education.table.end")}</th>
                <th className="px-4 py-3">
                  {t("education.table.diplomaStatus")}
                </th>
                <th className="px-4 py-3 text-right" style={{ width: 110 }}>
                  {t("education.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className="bg-white border-t">
                  {/* Burada ID'leri Label'a çeviriyoruz */}
                  <td className="px-4 py-3 truncate">
                    {getSeviyeLabel(r.seviye, t)}
                  </td>

                  <td className="px-4 py-3 truncate" title={r.okul}>
                    {r.okul}
                  </td>
                  <td className="px-4 py-3 truncate" title={r.bolum}>
                    {r.bolum}
                  </td>

                  {/* Not Sistemi Çevirisi */}
                  <td className="px-4 py-3 truncate">
                    {getNotSistemiLabel(r.notSistemi, t)}
                  </td>

                  <td className="px-4 py-3 truncate">{r.gano}</td>
                  <td className="px-4 py-3 truncate">
                    {formatDate(r.baslangic)}
                  </td>
                  <td className="px-4 py-3 truncate">{formatDate(r.bitis)}</td>

                  {/* Diploma Durumu Çevirisi */}
                  <td className="px-4 py-3 truncate">
                    {getDiplomaLabel(r.diplomaDurum, t)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r, idx)}
                        className="px-2 py-1 border rounded hover:bg-gray-50"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r, idx)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EducationAddModal
        open={modalOpen}
        mode={modalMode}
        initialData={selectedRow}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onUpdate={handleUpdate}
      />
    </div>
  );
});

export default EducationTable;
