import _ from "lodash";

/**
 * İki obje arasındaki farkları bulur.
 * Listeler için detaylı satır kıyaslaması yapar.
 */
export const getDifferences = (oldData, newData) => {
  const changes = [];

  // Güvenlik kontrolleri
  if (!oldData && !newData) return [];
  if (!oldData) return [{ section: "Genel", field: "Durum", oldVal: "-", newVal: "İlk Başvuru" }];
  if (!newData) return [];

  // --- YARDIMCI: Dizi Karşılaştırıcı ---
  // Bu fonksiyon iki diziyi alır, eklenenleri ve silinenleri bulur.
  const compareLists = (sectionName, oldList = [], newList = [], fieldMap) => {
    // 1. Silinenleri Bul (Eskide var, Yenide yok)
    oldList.forEach(oldItem => {
      // Basitçe JSON string karşılaştırması yapıyoruz (Unique ID olmadığı için)
      const existsInNew = newList.some(newItem => JSON.stringify(newItem) === JSON.stringify(oldItem));
      if (!existsInNew) {
        changes.push({
          section: sectionName,
          type: "list-item", // Bu bir liste elemanı değişikliği
          status: "removed", // Silindi
          data: oldItem,
          fieldMap: fieldMap // Hangi alanların gösterileceği (örn: Okul, Bölüm)
        });
      }
    });

    // 2. Eklenenleri Bul (Yenide var, Eskide yok)
    newList.forEach(newItem => {
      const existsInOld = oldList.some(oldItem => JSON.stringify(oldItem) === JSON.stringify(newItem));
      if (!existsInOld) {
        changes.push({
          section: sectionName,
          type: "list-item",
          status: "added", // Eklendi
          data: newItem,
          fieldMap: fieldMap
        });
      }
    });
  };

  // =======================================================
  // 1. TEKİL ALANLAR (Kişisel, İş Tercihleri vb.)
  // =======================================================
  
  // -- Kişisel Bilgiler --
  const pFields = [
    { key: "ad", label: "Ad" }, { key: "soyad", label: "Soyad" },
    { key: "telefon", label: "Telefon" }, { key: "eposta", label: "E-posta" },
    { key: "adres", label: "Adres" }, { key: "medeniDurum", label: "Medeni Durum" },
    { key: "uyruk", label: "Uyruk" }, { key: "dogumSehir", label: "Doğum Yeri" },
    { key: "ikametSehir", label: "İkamet Şehri" }
  ];

  pFields.forEach(({ key, label }) => {
    const valOld = oldData.personal?.[key];
    const valNew = newData.personal?.[key];
    if (valOld !== valNew) {
      changes.push({
        section: "Kişisel Bilgiler",
        type: "field", // Tekil alan
        field: label,
        oldVal: valOld || "(Boş)",
        newVal: valNew || "(Boş)",
      });
    }
  });

  // -- İş Tercihleri (Arrays to String) --
  const getLabels = (arr) => Array.isArray(arr) ? arr.map(i => i.label).sort().join(", ") : "";
  
  if (getLabels(oldData.jobDetails?.subeler) !== getLabels(newData.jobDetails?.subeler)) {
    changes.push({ section: "İş Tercihleri", type: "field", field: "Şubeler", oldVal: getLabels(oldData.jobDetails?.subeler), newVal: getLabels(newData.jobDetails?.subeler) });
  }
  if (getLabels(oldData.jobDetails?.departmanlar) !== getLabels(newData.jobDetails?.departmanlar)) {
    changes.push({ section: "İş Tercihleri", type: "field", field: "Departmanlar", oldVal: getLabels(oldData.jobDetails?.departmanlar), newVal: getLabels(newData.jobDetails?.departmanlar) });
  }
  if (getLabels(oldData.jobDetails?.departmanPozisyonlari) !== getLabels(newData.jobDetails?.departmanPozisyonlari)) {
    changes.push({ section: "İş Tercihleri", type: "field", field: "Pozisyonlar", oldVal: getLabels(oldData.jobDetails?.departmanPozisyonlari), newVal: getLabels(newData.jobDetails?.departmanPozisyonlari) });
  }
  if (oldData.jobDetails?.lojman !== newData.jobDetails?.lojman) {
    changes.push({ section: "İş Tercihleri", type: "field", field: "Lojman Talebi", oldVal: oldData.jobDetails?.lojman || "-", newVal: newData.jobDetails?.lojman || "-" });
  }

  // -- Diğer Bilgiler --
  const oFields = [
    { key: "ehliyet", label: "Ehliyet" }, { key: "sigara", label: "Sigara" },
    { key: "askerlik", label: "Askerlik" }, { key: "davaDurumu", label: "Dava Durumu" },
    { key: "boy", label: "Boy" }, { key: "kilo", label: "Kilo" }
  ];
  oFields.forEach(({ key, label }) => {
    const valOld = oldData.otherInfo?.[key];
    const valNew = newData.otherInfo?.[key];
    if (String(valOld) !== String(valNew)) {
      changes.push({ section: "Diğer Bilgiler", type: "field", field: label, oldVal: valOld || "-", newVal: valNew || "-" });
    }
  });

  // =======================================================
  // 2. LİSTELER (TABLO OLARAK KIYASLAMA)
  // =======================================================

  // 1. EĞİTİM BİLGİLERİ
  compareLists("Eğitim Bilgileri", oldData.education, newData.education, [
    { key: "okul", label: "Okul" },
    { key: "bolum", label: "Bölüm" },
    { key: "seviye", label: "Seviye" },
    { key: "mezuniyetYili", label: "Mezuniyet" }
  ]);

  // 2. İŞ DENEYİMLERİ
  compareLists("İş Deneyimi", oldData.experience, newData.experience, [
    { key: "kurum", label: "Kurum" },
    { key: "pozisyon", label: "Pozisyon" },
    { key: "sure", label: "Süre" },
    { key: "ayrilmaNedeni", label: "Ayrılma Nedeni" }
  ]);

  // 3. YABANCI DİL
  compareLists("Yabancı Diller", oldData.languages, newData.languages, [
    { key: "dil", label: "Dil" },
    { key: "seviye", label: "Seviye" }
  ]);

  // 4. SERTİFİKALAR
  compareLists("Sertifikalar", oldData.certificates, newData.certificates, [
    { key: "ad", label: "Sertifika Adı" },
    { key: "kurum", label: "Kurum" },
    { key: "yil", label: "Yıl" }
  ]);

   // 5. REFERANSLAR
   compareLists("Referanslar", oldData.references, newData.references, [
    { key: "adSoyad", label: "Ad Soyad" },
    { key: "kurum", label: "Kurum" },
    { key: "telefon", label: "Telefon" }
  ]);

  return changes;
};