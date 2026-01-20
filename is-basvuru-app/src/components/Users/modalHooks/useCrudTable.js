import { useCallback, useMemo, useState } from "react";

/**
 * Tekrarlayan tablo CRUD mantığını soyutlayan hook.
 * - rows state'i
 * - openCreate / openEdit / closeModal
 * - handleSave / handleUpdate / handleDelete (confirm opsiyonel)
 *
 * @param {() => any[]} initialDataFn  lazy init için fonksiyon (örn: staticXYZDB)
 * @param {{
 *   confirmDelete?: (row) => Promise<boolean>, // true => sil; false => iptal
 *   notify?: (msg:string) => void,             // toast için
 *   idSelector?: (row) => string|number,       // varsayılan: row.id
 * }} [opts]
 */
export default function useCrudTable(initialDataFn, opts = {}) {
  const {
    confirmDelete,
    notify,
    idSelector = (r) => r.id,
  } = opts;

  // DB
  const [rows, setRows] = useState(initialDataFn); // lazy init

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [selectedRow, setSelectedRow] = useState(null);

  const closeModal = useCallback(() => setModalOpen(false), []);

  // Yeni ekle
  const openCreate = useCallback(() => {
    setSelectedRow(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  // Düzenle
  const openEdit = useCallback((row) => {
    setSelectedRow(row);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  // Kaydet
  const handleSave = useCallback((payload) => {
    setRows((prev) => {
      const nextId =
        prev.length ? Math.max(...prev.map((r) => Number(idSelector(r)))) + 1 : 1;
      const newRow = { id: nextId, ...payload };
      return [...prev, newRow];
    });
    notify?.("Kayıt eklendi");
    closeModal();
  }, [closeModal, idSelector, notify]);

  // Güncelle
  const handleUpdate = useCallback((payload) => {
    if (!selectedRow) return;
    const targetId = idSelector(selectedRow);
    setRows((prev) =>
      prev.map((r) => (idSelector(r) === targetId ? { ...r, ...payload } : r))
    );
    notify?.("Kayıt güncellendi");
    closeModal();
  }, [closeModal, idSelector, notify, selectedRow]);

  // Sil
  const handleDelete = useCallback(async (row) => {
    const ok = confirmDelete ? await confirmDelete(row) : true;
    if (!ok) return;
    const targetId = idSelector(row);
    setRows((prev) => prev.filter((r) => idSelector(r) !== targetId));
    notify?.("Kayıt silindi");
  }, [confirmDelete, idSelector, notify]);

  const total = useMemo(() => rows.length, [rows]);

  return {
    // state
    rows, setRows, total,
    // modal
    modalOpen, modalMode, selectedRow, closeModal,
    // actions
    openCreate, openEdit,
    handleSave, handleUpdate, handleDelete,
  };
}
