import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext, useWatch } from "react-hook-form"; // Hook Form

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LanguageAddModal from "../addModals/LanguageAddModal";

// DÜZELTME: onValidChange prop'u kaldırıldı
const LanguageTable = forwardRef(function LanguageTable(props, ref) {
  const { t } = useTranslation();

  // --- 1. Context Bağlantısı ---
  const { control, setValue } = useFormContext();
  // Ana formdaki 'languages' listesini izliyoruz
  const rows = useWatch({ control, name: "languages" }) || [];

  // --- 2. Local Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const notify = (msg) => toast.success(msg);

  // --- 3. Actions ---
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

  const closeModal = () => setModalOpen(false);

  const handleSave = (newData) => {
    const updatedList = [...rows, newData];
    setValue("languages", updatedList, {
      shouldDirty: true,
      shouldValidate: true,
    });
    notify(t("toast.saved"));
    closeModal();
  };

  const handleUpdate = (updatedData) => {
    if (selectedIndex > -1) {
      const updatedList = [...rows];
      updatedList[selectedIndex] = updatedData;
      setValue("languages", updatedList, {
        shouldDirty: true,
        shouldValidate: true,
      });
      notify(t("toast.updated"));
    }
    closeModal();
  };

  const handleDelete = async (row, index) => {
    const res = await Swal.fire({
      title: t("languages.delete.title"),
      text: t("languages.delete.text", { language: (row.dil || "").trim() }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: t("actions.cancel"),
      confirmButtonText: t("common.deleteYes"),
    });

    if (res.isConfirmed) {
      const updatedList = rows.filter((_, i) => i !== index);
      setValue("languages", updatedList, {
        shouldDirty: true,
        shouldValidate: true,
      });
      notify(t("toast.deleted"));
    }
  };

  // --- 4. Expose Methods ---
  useImperativeHandle(ref, () => ({
    openCreate,
    getData: () => rows,
    fillData: (data) => {
      if (Array.isArray(data)) {
        setValue("languages", data);
      }
    },
  }));

  return (
    <div className="">
      {/* Tablo: Sadece veri varsa görünür */}
      {rows.length !== 0 && (
        <div className="overflow-x-auto rounded-b-lg ring-1 ring-gray-200 bg-white">
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">{t("languages.table.language")}</th>
                <th className="px-4 py-3">{t("languages.table.speaking")}</th>
                <th className="px-4 py-3">{t("languages.table.listening")}</th>
                <th className="px-4 py-3">{t("languages.table.reading")}</th>
                <th className="px-4 py-3">{t("languages.table.writing")}</th>
                <th className="px-4 py-3">{t("languages.table.learnedHow")}</th>
                <th className="px-4 py-3 text-right" style={{ width: 110 }}>
                  {t("languages.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={index} className="bg-white border-t">
                  <td
                    className="px-4 py-3 font-medium text-gray-800 max-w-[120px] truncate"
                    title={(item.dil || "").trim()}
                  >
                    {(item.dil || "").trim()}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                    title={item.konusma}
                  >
                    {item.konusma}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                    title={item.dinleme}
                  >
                    {item.dinleme}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                    title={item.okuma}
                  >
                    {item.okuma}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                    title={item.yazma}
                  >
                    {item.yazma}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[200px] truncate"
                    title={item.ogrenilenKurum}
                  >
                    {item.ogrenilenKurum}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button" // Sayfa yenilemeyi önler
                        aria-label={t("actions.update")}
                        onClick={() => openEdit(item, index)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50 active:scale-[0.98] transition cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        type="button" // Sayfa yenilemeyi önler
                        aria-label={t("actions.delete")}
                        onClick={() => handleDelete(item, index)}
                        className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700 active:scale-[0.98] transition cursor-pointer"
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

      <LanguageAddModal
        open={modalOpen}
        mode={modalMode}
        initialData={selectedRow}
        onClose={closeModal}
        onSave={handleSave}
        onUpdate={handleUpdate}
      />
    </div>
  );
});

export default LanguageTable;
