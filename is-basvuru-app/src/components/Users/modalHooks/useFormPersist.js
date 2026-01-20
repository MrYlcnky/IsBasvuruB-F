import { useEffect } from "react";

/**
 * Form verilerini localStorage'a otomatik kaydeder ve geri yükler.
 * @param {string} key - localStorage'da tutulacak anahtar isim (örn: "draft_v1")
 * @param {object} methods - useForm() hook'undan dönen nesne
 */
export const useFormPersist = (key, methods) => {
  // DÜZELTME: getValues buradan kaldırıldı
  const { watch, setValue } = methods;

  // 1. Sayfa ilk açıldığında (Mount) veriyi yükle
  useEffect(() => {
    const storedData = localStorage.getItem(key);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        
        // Her bir alanı forma geri yükle
        Object.keys(parsedData).forEach((fieldKey) => {
          setValue(fieldKey, parsedData[fieldKey]);
        });
        
      } catch (error) {
        console.error("Form taslağı yüklenirken hata oluştu:", error);
        // Veri bozuksa temizle ki sorun çıkarmasın
        localStorage.removeItem(key);
      }
    }
  }, [key, setValue]);

  // 2. Form her değiştiğinde veriyi kaydet (Auto-Save)
  useEffect(() => {
    const subscription = watch((value) => {
      // Form verisini JSON string olarak sakla
      localStorage.setItem(key, JSON.stringify(value));
    });
    
    // Component unmount olursa aboneliği temizle
    return () => subscription.unsubscribe();
  }, [watch, key]);

  // Dışarıdan manuel temizleme fonksiyonu döndür (Başvuru tamamlanınca silmek için)
  const clearStorage = () => {
    localStorage.removeItem(key);
  };

  return { clearStorage };
};