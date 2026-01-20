import { useState, forwardRef, useImperativeHandle } from "react";
import { useFormContext, useWatch } from "react-hook-form"; // YENİ: Form entegrasyonu
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CertificatesAddModal from "../addModals/CertificatesAddModal";
import { formatDate } from "../modalHooks/dateUtils";

const CertificateTable = forwardRef((props, ref) => {
  const { t } = useTranslation();

  // --- 1. React Hook Form Entegrasyonu ---
  const { control, setValue } = useFormContext();
  // Ana formdaki 'certificates' listesini izle (rows yerine bunu kullanacağız)
  const rows = useWatch({ control, name: "certificates" }) || [];

  // --- 2. Local Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const notify = (msg) => toast.success(msg);

  // --- 3. Actions (CRUD) ---
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
    setValue("certificates", updatedList, {
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
      setValue("certificates", updatedList, {
        shouldDirty: true,
        shouldValidate: true,
      });
      notify(t("toast.updated"));
    }
    closeModal();
  };

  const handleDelete = async (row, index) => {
    const res = await Swal.fire({
      title: t("certificates.delete.title"),
      text: t("certificates.delete.text", {
        name: row.ad,
        org: row.kurum,
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: t("actions.cancel"),
      confirmButtonText: t("actions.delete"),
    });

    if (res.isConfirmed) {
      const updatedList = rows.filter((_, i) => i !== index);
      setValue("certificates", updatedList, {
        shouldDirty: true,
        shouldValidate: true,
      });
      notify(t("toast.deleted"));
    }
  };

  // --- 4. Dışarı Açılan Metodlar ---
  useImperativeHandle(ref, () => ({
    openCreate,
    getData: () => rows,
    fillData: (data) => {
      if (Array.isArray(data)) {
        setValue("certificates", data);
      }
    },
  }));

  const dash = t("common.dash");

  return (
    <div>
      {/* Tablo: Sadece veri varsa görünür */}
      {rows.length !== 0 && (
        <div className="overflow-x-auto rounded-b-lg ring-1 ring-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">{t("certificates.table.name")}</th>
                <th className="px-4 py-3">{t("certificates.table.org")}</th>
                <th className="px-4 py-3">
                  {t("certificates.table.duration")}
                </th>
                <th className="px-4 py-3">
                  {t("certificates.table.issuedAt")}
                </th>
                <th className="px-4 py-3">
                  {t("certificates.table.validUntil")}
                </th>
                <th className="px-4 py-3 text-right" style={{ width: 110 }}>
                  {t("certificates.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, idx) => {
                const issued = formatDate(item.verilisTarihi);
                const valid = formatDate(item.gecerlilikTarihi) || dash;

                return (
                  <tr key={idx} className="bg-white border-t table-fixed">
                    <td
                      className="px-4 py-3 font-medium text-gray-800 max-w-[140px] truncate"
                      title={item.ad}
                    >
                      {item.ad}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-800 max-w-[140px] truncate"
                      title={item.kurum}
                    >
                      {item.kurum}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                      title={item.sure}
                    >
                      {item.sure}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                      title={issued || dash}
                    >
                      {issued || dash}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-800 max-w-[120px] truncate"
                      title={valid}
                    >
                      {valid}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button" // ÖNEMLİ: Sayfa yenilenmesini önler
                          aria-label={t("actions.update")}
                          title={t("actions.update")}
                          onClick={() => openEdit(item, idx)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50 active:scale-[0.98] transition cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          type="button" // ÖNEMLİ: Sayfa yenilenmesini önler
                          aria-label={t("actions.delete")}
                          title={t("actions.delete")}
                          onClick={() => handleDelete(item, idx)}
                          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700 active:scale-[0.98] transition cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CertificatesAddModal
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

export default CertificateTable;
