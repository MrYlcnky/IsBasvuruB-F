import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext, useWatch } from "react-hook-form"; // YENİ: Hook Form entegrasyonu

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReferenceAddModal from "../addModals/ReferenceAddModal";

const ReferencesTable = forwardRef(function ReferencesTable(props, ref) {
  const { t } = useTranslation();

  // --- 1. Context Bağlantısı ---
  const { control, setValue } = useFormContext();
  // Ana formdaki 'references' listesini izliyoruz
  const rows = useWatch({ control, name: "references" }) || [];

  // --- 2. Local Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const notify = (msg) => toast.success(msg);

  const confirmDelete = async (row) => {
    const res = await Swal.fire({
      title: t("references.delete.title"),
      text: t("references.delete.text", {
        first: row.referansAdi,
        last: row.referansSoyadi,
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: t("actions.cancel"),
      confirmButtonText: t("common.deleteYes"),
    });
    return res.isConfirmed;
  };

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
    setValue("references", updatedList, {
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
      setValue("references", updatedList, {
        shouldDirty: true,
        shouldValidate: true,
      });
      notify(t("toast.updated"));
    }
    closeModal();
  };

  const handleDelete = async (row, index) => {
    const isConfirmed = await confirmDelete(row);
    if (isConfirmed) {
      const updatedList = rows.filter((_, i) => i !== index);
      setValue("references", updatedList, {
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
        setValue("references", data);
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
                <th className="px-4 py-3">{t("references.table.orgType")}</th>
                <th className="px-4 py-3">{t("references.table.firstName")}</th>
                <th className="px-4 py-3">{t("references.table.lastName")}</th>
                <th className="px-4 py-3">{t("references.table.workplace")}</th>
                <th className="px-4 py-3">{t("references.table.role")}</th>
                <th className="px-4 py-3">{t("references.table.phone")}</th>
                <th className="px-4 py-3 text-right" style={{ width: 110 }}>
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, idx) => (
                <tr key={idx} className="bg-white border-t table-fixed">
                  <td
                    className="px-4 py-3 font-medium text-gray-800 max-w-[130px] truncate"
                    title={item.calistigiKurum}
                  >
                    {item.calistigiKurum}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[100px] truncate"
                    title={item.referansAdi}
                  >
                    {item.referansAdi}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[100px] truncate"
                    title={item.referansSoyadi}
                  >
                    {item.referansSoyadi}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                    title={item.referansIsYeri}
                  >
                    {item.referansIsYeri}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                    title={item.referansGorevi}
                  >
                    {item.referansGorevi}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-800 max-w-[140px] truncate"
                    title={item.referansTelefon}
                  >
                    {item.referansTelefon}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button" // Sayfa yenilemeyi önler
                        aria-label={t("actions.update")}
                        onClick={() => openEdit(item, idx)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50 active:scale-[0.98] transition cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        type="button" // Sayfa yenilemeyi önler
                        aria-label={t("actions.delete")}
                        onClick={() => handleDelete(item, idx)}
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
      {/* Modal (controlled) */}
      <ReferenceAddModal
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

export default ReferencesTable;
