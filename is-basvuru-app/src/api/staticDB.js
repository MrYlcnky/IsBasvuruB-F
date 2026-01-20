// src/api/staticDB.js

// --- KULLANICILAR (MOCK USERS) ---
// Not: lastLogin alanları UserLogs tablosu için eklendi.
const USERS = [
  {
    id: 1,
    username: "admin",
    password: "123",
    role: "admin",
    name: "Admin User",
    branch: "Girne",
    department: "IT",
    lastLogin: "2025-11-21T09:30:00",
  },
  {
    id: 2,
    username: "ik_spv",
    password: "123",
    role: "ik_spv",
    name: "Ayşe Yılmaz", // İK Yöneticisi
         branch: "Girne",
    department: "İnsan Kaynakları",
    lastLogin: "2025-11-20T14:15:00",
  },
  {
    id: 3,
    username: "ik_user",
    password: "123",
    role: "ik_user",
    name: "Fatma Demir", // İK Uzmanı
     branch: "Girne",
    department: "İnsan Kaynakları",
    lastLogin: "2025-11-21T08:45:00",
  },
  {
    id: 4,
    username: "gm_girne",
    password: "123",
    role: "gm",
    name: "Sezgin Bingül", // Girne GM
    branch: "Girne",
    department: "Casino Genel Müdür",
    lastLogin: "2025-11-19T17:00:00",
  },
  {
    id: 5,
    username: "gm_prestige",
    password: "123",
    role: "gm",
    name: "Prestige Genel Müdür", // Prestige GM
    branch: "Prestige",
    department: "Casino Genel Müdür",
    lastLogin: "2025-11-18T10:20:00",
  },
  {
    id: 6,
    username: "it_girne",
    password: "123",
    role: "dm",
    name: "Ulaş Gencan", // IT Girne DM
    department: "IT",
    branch: "Girne",
    lastLogin: "2025-11-21T11:00:00",
  },
  {
    id: 10,
    username: "it_prestige",
    password: "123",
    role: "dm",
    name: "Mehmet Gencan", // IT Prestige DM
    department: "IT",
    branch: "Prestige",
    lastLogin: "2025-11-21T10:00:00",
  },
  {
    id: 7,
    username: "fb_girne",
    password: "123",
    role: "dm",
    name: "Gökhan Evran", // F&B Girne DM
    department: "Casino F&B",
    branch: "Girne",
    lastLogin: "2025-11-15T09:00:00",
  },
  {
    id: 9,
    username: "fb_prestige",
    password: "123",
    role: "dm",
    name: "Oktay Bey", // F&B Prestige DM
    department: "Casino F&B",
    branch: "Prestige",
    lastLogin: "2025-11-14T16:30:00",
  },
  {
    id: 8,
    username: "live_prestige",
    password: "123",
    role: "dm",
    name: "Murat Bilgin", // Canlı Oyun Prestige DM
    department: "Casino Canlı Oyun",
    branch: "Prestige",
    lastLogin: "2025-11-20T13:45:00",
  },
];

// --- BAŞVURULAR (MOCK DATA) ---
const APPLICATIONS = [
  // === 1. SENARYO: ALİ VURAL (Eğitim Güncellemesi & Yönetici Geçmişi) ===
  {
    id: "A-40001",
    name: "Ali Vural (IT Girne)",
    branches: ["Girne"],
    areas: ["Hotel"],
    departments: ["IT"],
    roles: ["IT Destek Uzmanı"],
    date: "2025-11-20",
    updatedAt: "2025-11-20",
    age: 28,
    status: "Bekleyen",
    approvalStage: "departman_muduru",
    appliedAt: "2025-01-10",

    // --- LIVE (GÜNCEL) NOTLAR ---
    notes: [
      {
        user: "Ulaş Gencan",
        note: "Aday, eğitim bilgisindeki 'Ön Lisans' hatasını 'Lisans' olarak güncelledi. Bu düzeltme sonrası pozisyon kriterlerini karşılıyor, tekrar değerlendirmeye alıyorum.",
        date: "2025-11-21",
        action: "İNCELEME",
      },
    ],

    // --- LIVE (GÜNCEL v11) VERİLER ---
    personal: {
      foto: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      ad: "Ali",
      soyad: "Vural",
      telefon: "+905559998877",
      eposta: "ali.vural@gmail.com",
      adres: "Girne Merkez, Kıbrıs",
      medeniDurum: "Evli",
      dogumTarihi: "1997-01-15",
      uyruk: "Türkiye",
      dogumSehir: "Ankara",
      ikametSehir: "Girne",
    },
    education: [
      {
        seviye: "Lisans",
        okul: "ODTÜ",
        bolum: "Bilgisayar Müh.",
        mezuniyetYili: "2019",
      },
      {
        // GÜNCEL HALİ (Yeşil görünecek)
        seviye: "Lisans", 
        okul: "Anadolu Üniversitesi",
        bolum: "Yönetim Bilişim Sis.",
        mezuniyetYili: "2017", 
      },
    ],
    otherInfo: {
      ehliyet: "B Sınıfı",
      sigara: "Hayır",
      askerlik: "Yapıldı",
      davaDurumu: "Yok",
    },
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::IT Destek Uzmanı", label: "IT Destek Uzmanı", dept: "IT" },
      ],
      subeler: [{ label: "Girne" }],
      departmanlar: [{ label: "IT" }],
      lojman: "Hayır",
    },

    // --- VERSİYON GEÇMİŞİ ---
    versionHistory: [
      {
        version: 10,
        date: "2025-10-15",
        status: "Revize Talebi", 
        updatedBy: "Aday",
        logs: [
          {
            user: "Ayşe Yılmaz", 
            note: "Departman müdürünün talebi üzerine; sehven reddedilen başvuru, adayın bilgilerini güncellemesi amacıyla 'Revize' statüsüne çekilmiştir. Süreç baştan başlatıldı.",
            date: "2025-10-16",
            action: "REVİZE_ONAYI",
          },
          {
            user: "Ulaş Gencan", 
            note: "Bu adayı reddetmiştim ancak CV'sini tekrar incelediğimde potansiyeli olduğunu fark ettim. Lütfen reddi geri çekip revizeye düşürün, tekrar değerlendirmek istiyorum.",
            date: "2025-10-15",
            action: "REQUEST_REVISION",
          },
        ],
        data: {
          // v10 VERİSİ (Eski Hatalı Veri)
          personal: {
            ad: "Ali",
            soyad: "Vural",
            telefon: "+905559998877",
            eposta: "ali.vural@gmail.com",
            adres: "Girne Merkez, Kıbrıs",
            medeniDurum: "Evli",
            dogumTarihi: "1997-01-15",
          },
          education: [
            {
              seviye: "Lisans",
              okul: "ODTÜ", // Değişmediği için tabloda çıkmaz
              bolum: "Bilgisayar Müh.",
              mezuniyetYili: "2019",
            },
            {
              // ESKİ HALİ (Kırmızı görünecek)
              seviye: "Ön Lisans", 
              okul: "Anadolu Üniversitesi", 
              bolum: "Yönetim Bilişim Sis.",
              mezuniyetYili: "2015",
            },
          ],
          otherInfo: { ehliyet: "B Sınıfı", sigara: "Hayır", askerlik: "Yapıldı" },
          jobDetails: { subeler: [{ label: "Girne" }], lojman: "Hayır" },
        },
      },
      {
        version: 9,
        date: "2025-09-01",
        status: "Reddedilen",
        updatedBy: "Ulaş Gencan",
        logs: [
          {
            user: "Ulaş Gencan",
            note: "Adayın eğitim seviyesi (Ön Lisans) bu pozisyonun teknik gereksinimleri için yetersiz kalmaktadır. Reddediyorum.",
            date: "2025-09-01",
            action: "REDDEDİLDİ",
          },
        ],
        data: {
          personal: { ad: "Ali", soyad: "Vural", eposta: "ali@test.com" },
          education: [{ seviye: "Ön Lisans", okul: "Anadolu Üniversitesi", bolum: "Yönetim Bilişim" }],
          jobDetails: { subeler: [{ label: "Girne" }] },
        },
      },
      {
        version: 1,
        date: "2025-01-10",
        status: "Bekleyen",
        updatedBy: "Aday",
        logs: [],
        data: {
          personal: { ad: "Ali", soyad: "Vural" },
          jobDetails: { subeler: [{ label: "Girne" }] },
        },
      },
    ],
  },

  // === 2. SENARYO: GM ONAYINDA BEKLEYEN (Emre Taş) ===
  {
    id: "A-50001",
    name: "Emre Taş (IT Prestige)",
    branches: ["Prestige"],
    areas: ["Casino"],
    departments: ["IT"],
    roles: ["Yazılımcı"],
    date: "2025-11-10",
    age: 31,
    status: "Bekleyen",
    approvalStage: "genel_mudur", // PRESTIGE GM
    notes: [
      {
        user: "Mehmet Gencan", // Önce DM
        note: "Adayın GitHub portfolyosunu inceledim, yazdığı kod yapısı bizim standartlarımıza çok uygun. Teknik mülakattan tam not aldı. GM onayına sunulmuştur.",
        date: "2025-11-10",
        action: "ONAYLANDI",
      },
    ],
    appliedAt: "2025-11-10",
    personal: {
      foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      ad: "Emre",
      soyad: "Taş",
      dogumTarihi: "1994-01-01",
    },
    education: [{ seviye: "Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::Yazılımcı", label: "Yazılımcı", dept: "IT" },
      ],
    },
  },

  // === 3. SENARYO: İK ONAYINDA BEKLEYEN (İkili Başvuru) ===
  {
    id: "A-90001",
    name: "İkili Başvuru (Bekleyen)",
    branches: ["Girne", "Prestige"],
    areas: ["Hotel", "Casino"],
    departments: ["IT"],
    roles: ["Ağ Uzmanı"],
    date: "2025-11-10",
    age: 38,
    status: "Bekleyen",
    approvalStage: "ik", // DM ve GM Onayladı -> SIRA İK'DA
    notes: [
      {
        user: "Ulaş Gencan", // 1. DM Onayı
        note: "Ağ altyapısı konusundaki tecrübesi, Girne ve Prestige arasındaki veri akışını yönetmek için ideal. Teknik olarak uygundur.",
        date: "2025-11-10",
        action: "ONAYLANDI",
      },
      {
        user: "Sezgin Bingül", // 2. GM Onayı
        note: "Bütçe planlamasına uygundur. İki şube ortak personel olarak çalışabilir. Onaylıyorum.",
        date: "2025-11-11",
        action: "ONAYLANDI",
      },
    ],
    appliedAt: "2025-11-10",
    personal: {
      foto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      ad: "İkili",
      soyad: "Başvuru B.",
      dogumTarihi: "1987-08-08",
    },
    education: [{ seviye: "Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::Ağ Uzmanı", label: "Ağ Uzmanı", dept: "IT" },
      ],
    },
  },


  // === 4. SENARYO: İK SÜRECİNDEYKEN DM REVİZE İSTEMİŞ (Derya Sancak) ===
  {
    id: "A-40004",
    name: "Derya Sancak (IT Girne)",
    branches: ["Girne"],
    areas: ["Hotel"],
    departments: ["IT"],
    roles: ["IT Destek Uzmanı"],
    date: "2025-11-07",
    age: 29,
    status: "Revize Talebi", 
    approvalStage: "tamamlandi", 
    reviseRequestedByRole: "dm", 
    notes: [
      {
        user: "Ulaş Gencan", // 1. DM Onayı
        note: "Teknik bilgisi giriş seviyesi için yeterli. Onaylıyorum.",
        date: "2025-11-07",
        action: "ONAYLANDI",
      },
      {
        user: "Sezgin Bingül", // 2. GM Onayı
        note: "Uygundur.",
        date: "2025-11-08",
        action: "ONAYLANDI",
      },
      {
        user: "Fatma Demir", // 3. İK İşlemde
        note: "Evraklar hazırlanıyor, giriş işlemleri başlatıldı.",
        date: "2025-11-09",
        action: "İŞLEMDE",
      },
      {
        user: "Ulaş Gencan", // 4. DM Revize İstiyor (Geri Dönüş)
        note: "DİKKAT: Adayın eski iş yerinden olumsuz referans bilgisi tarafıma ulaştı. Lütfen işe alımı durdurup dosyayı bana geri çekin (Revize Talebi).",
        date: "2025-11-10",
        action: "REQUEST_REVISION",
      },
    ],
    appliedAt: "2025-11-07",
    personal: {
      foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      ad: "Derya",
      soyad: "Sancak",
      dogumTarihi: "1996-03-03",
    },
    education: [{ seviye: "Ön Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        {
          value: "IT::IT Destek Uzmanı",
          label: "IT Destek Uzmanı",
          dept: "IT",
        },
      ],
    },
  },

  // === DİĞER STANDART KAYITLAR ===
  {
    id: "A-40002",
    name: "Burcu Eser (IT Girne)",
    branches: ["Girne"],
    areas: ["Hotel"],
    departments: ["IT"],
    roles: ["Yazılımcı"],
    date: "2025-11-09",
    age: 26,
    status: "Reddedilen",
    notes: [
      {
        user: "Ulaş Gencan", // Önce DM Onayı
        note: "Teknik açıdan uygundur, GM onayına sunulmuştur.",
        date: "2025-11-09",
        action: "ONAYLANDI",
      },
      {
        user: "Sezgin Bingül", // Sonra GM Reddi
        note: "Adayın maaş beklentisi, bu pozisyon için ayrılan bütçenin %40 üzerinde. Maalesef olumsuz.",
        date: "2025-11-10",
        action: "REDDEDİLDİ",
      },
    ],
    appliedAt: "2025-11-09",
    approvalStage: "tamamlandi",
    personal: { ad: "Burcu", soyad: "Eser", dogumTarihi: "1999-05-10" },
    education: [{ seviye: "Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::Yazılımcı", label: "Yazılımcı", dept: "IT" },
      ],
    },
  },
  {
    id: "A-40003",
    name: "Can Yılmaz (IT Girne)",
    branches: ["Girne"],
    areas: ["Hotel"],
    departments: ["IT"],
    roles: ["Ağ Uzmanı"],
    date: "2025-11-08",
    age: 30,
    status: "Onaylanan",
    notes: [
      {
        user: "Ulaş Gencan", // 1. DM
        note: "Teknik mülakat olumlu.",
        date: "2025-11-08",
        action: "ONAYLANDI",
      },
      {
        user: "Sezgin Bingül", // 2. GM
        note: "Uygundur.",
        date: "2025-11-09",
        action: "ONAYLANDI",
      },
      {
        user: "Fatma Demir", // 3. İK
        note: "Tüm evraklar eksiksiz teslim alındı, sigorta girişi yapıldı. Yarın işbaşı yapacak.",
        date: "2025-11-10",
        action: "ONAYLANDI",
      },
    ],
    appliedAt: "2025-11-08",
    approvalStage: "tamamlandi",
    personal: { ad: "Can", soyad: "Yılmaz", dogumTarihi: "1995-02-02" },
    education: [{ seviye: "Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::Ağ Uzmanı", label: "Ağ Uzmanı", dept: "IT" },
      ],
    },
  },
  {
    id: "A-50002",
    name: "Fatih Gün (IT Prestige)",
    branches: ["Prestige"],
    areas: ["Casino"],
    departments: ["IT"],
    roles: ["Ağ Uzmanı"],
    date: "2025-11-09",
    age: 40,
    status: "Reddedilen",
    notes: [
      {
        user: "Mehmet Gencan", // DM Direkt Reddetmiş
        note: "Pozisyonun gerektirdiği 'Cisco CCNA' sertifikası eksik. Bu sebeple uygun görülmemiştir.",
        date: "2025-11-09",
        action: "REDDEDİLDİ",
      },
    ],
    appliedAt: "2025-11-09",
    approvalStage: "tamamlandi",
    personal: {
      foto: null, // Foto yok
      ad: "Fatih",
      soyad: "Gün",
      dogumTarihi: "1985-10-10",
    },
    education: [{ seviye: "Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::Ağ Uzmanı", label: "Ağ Uzmanı", dept: "IT" },
      ],
    },
  },
  {
    id: "A-50003",
    name: "Gökçe Arı (IT Prestige)",
    branches: ["Prestige"],
    areas: ["Hotel"],
    departments: ["IT"],
    roles: ["IT Destek Uzmanı"],
    date: "2025-11-08",
    age: 25,
    status: "Onaylanan",
    notes: [
      {
        user: "Mehmet Gencan",
        note: "Onaylandı.",
        date: "2025-11-08",
        action: "ONAYLANDI",
      },
      {
        user: "Prestige Genel Müdür",
        note: "Onaylandı.",
        date: "2025-11-09",
        action: "ONAYLANDI",
      },
      {
        user: "Ayşe Yılmaz",
        note: "İşe alım tamamlandı.",
        date: "2025-11-10",
        action: "ONAYLANDI",
      },
    ],
    appliedAt: "2025-11-08",
    approvalStage: "tamamlandi",
    personal: {
      foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      ad: "Gökçe",
      soyad: "Arı",
      dogumTarihi: "2000-01-01",
    },
    education: [{ seviye: "Ön Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::IT Destek Uzmanı", label: "IT Destek Uzmanı", dept: "IT" },
      ],
    },
  },
  {
    id: "A-50004",
    name: "Hale Jale (IT Prestige)",
    branches: ["Prestige"],
    areas: ["Casino"],
    departments: ["IT"],
    roles: ["Yazılımcı"],
    date: "2025-11-07",
    age: 33,
    status: "Revize Talebi",
    approvalStage: "tamamlandi",
    reviseRequestedByRole: "dm",
    notes: [
      {
        user: "Mehmet Gencan",
        note: "Reddedildi, tecrübesi yok.",
        date: "2025-11-07",
        action: "REDDEDİLDİ",
      },
      {
        user: "Mehmet Gencan",
        note: "Yanlışlıkla reddettim, CV'yi tekrar inceledim. Lütfen DM adımına geri alın (İç Revize).",
        date: "2025-11-10",
        action: "REQUEST_REVISION",
      },
    ],
    appliedAt: "2025-11-07",
    personal: {
      foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      ad: "Hale",
      soyad: "Jale",
      dogumTarihi: "1992-04-04",
    },
    education: [{ seviye: "Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::Yazılımcı", label: "Yazılımcı", dept: "IT" },
      ],
    },
  },
  {
    id: "A-90002",
    name: "İkili Başvuru (Onaylı)",
    branches: ["Girne", "Prestige"],
    areas: ["Hotel", "Casino"],
    departments: ["IT"],
    roles: ["Yazılımcı"],
    date: "2025-11-05",
    age: 29,
    status: "Onaylanan",
    notes: [
      {
        user: "Ulaş Gencan",
        note: "Aday Girne için değerlendirildi ve onaylandı.",
        date: "2025-11-05",
        action: "ONAYLANDI",
      },
      {
        user: "Sezgin Bingül",
        note: "Onaylandı.",
        date: "2025-11-06",
        action: "ONAYLANDI",
      },
      {
        user: "Ayşe Yılmaz",
        note: "İşe alım Girne şubesi üzerinden tamamlandı.",
        date: "2025-11-07",
        action: "ONAYLANDI",
      },
    ],
    appliedAt: "2025-11-05",
    approvalStage: "tamamlandi",
    personal: {
      foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      ad: "İkili",
      soyad: "Başvuru O.",
      dogumTarihi: "1996-09-09",
    },
    education: [{ seviye: "Lisans" }],
    jobDetails: {
      departmanPozisyonlari: [
        { value: "IT::Yazılımcı", label: "Yazılımcı", dept: "IT" },
      ],
    },
  },
];

// --- AKIŞ TANIMLARI ---
const STAGES_MAP = {
  departman_muduru: { role: "dm", next: "genel_mudur" },
  genel_mudur: { role: "gm", next: "ik" },
  ik: { role: "ik", next: "tamamlandi" },
  tamamlandi: { role: null, next: null },
};

const ROLE_TO_STAGE_MAP = {
  dm: "departman_muduru",
  gm: "genel_mudur",
  ik_spv: "ik",
  ik_user: "ik",
  admin: "ik",
};

export const getAuthRoleForCheck = (role) => {
  if (role === "admin" || role === "ik_spv" || role === "ik_user") return "ik";
  return role;
};

const isIKSupervisor = (role) => {
  return role === "admin" || role === "ik_spv";
};

// --- API FONKSİYONLARI ---

// YENİ: Kullanıcı Listesini Getir (UserLogs.jsx için)
export const getUsers = () => {
    return JSON.parse(JSON.stringify(USERS));
};

export const dbLogin = (username, password) => {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    // Giriş tarihini güncelle
    user.lastLogin = new Date().toISOString(); 
    const { password: _p, ...rest } = user;
    return rest;
  }
  return null;
};

export const getApplications = () => {
  return JSON.parse(JSON.stringify(APPLICATIONS));
};

export const updateApplicationStatus = (id, actionType, note, authUser) => {
  const application = APPLICATIONS.find((app) => app.id === id);
  if (!application) return { success: false, message: "Başvuru bulunamadı." };

  const newNote = {
    user: authUser.name,
    note: note || "(Açıklama yok)",
    date: new Date().toISOString().split("T")[0],
    action: actionType.toUpperCase(),
  };

  if (actionType === "request_revision") {
    if (
      application.status !== "Onaylanan" &&
      application.status !== "Reddedilen"
    ) {
      return { success: false, message: "Sadece tamamlanmışlar revize edilebilir." };
    }
    if (isIKSupervisor(authUser.role)) {
      return { success: false, message: "İK SPV revize talep edemez." };
    }
    application.status = "Revize Talebi";
    application.reviseRequestedByRole = authUser.role;
    application.notes.push(newNote);
    return { success: true, message: "Revize talebi oluşturuldu." };
  }

  if (actionType === "approve_revision") {
    if (!isIKSupervisor(authUser.role)) return { success: false, message: "Yetkisiz işlem." };
    if (application.status !== "Revize Talebi") return { success: false, message: "Hatalı durum." };
    
    const returnStage = ROLE_TO_STAGE_MAP[application.reviseRequestedByRole] || "departman_muduru";
    application.status = "Bekleyen";
    application.approvalStage = returnStage;
    application.reviseRequestedByRole = null;
    application.notes.push(newNote);
    return { success: true, message: "Revize onaylandı, süreç geri alındı." };
  }

  if (actionType === "reject_revision") {
    if (!isIKSupervisor(authUser.role)) return { success: false, message: "Yetkisiz işlem." };
    if (application.status !== "Revize Talebi") return { success: false, message: "Hatalı durum." };

    const lastDecision = [...application.notes].reverse().find(n => n.action === "ONAYLANDI" || n.action === "REDDEDİLDİ");
    application.status = lastDecision?.action === "ONAYLANDI" ? "Onaylanan" : "Reddedilen";
    application.reviseRequestedByRole = null;
    application.notes.push(newNote);
    return { success: true, message: "Revize reddedildi." };
  }

  // Standart Onay/Red
  const currentStageKey = application.approvalStage;
  const stageInfo = STAGES_MAP[currentStageKey];
  if (!stageInfo) return { success: false, message: "Hatalı aşama." };
  
  if (getAuthRoleForCheck(authUser.role) !== stageInfo.role) {
    return { success: false, message: "Sıra sizde değil." };
  }

  if (actionType === "approve") {
    application.approvalStage = stageInfo.next;
    if (application.approvalStage === "tamamlandi") application.status = "Onaylanan";
  } else if (actionType === "reject") {
    application.status = "Reddedilen";
    application.approvalStage = "tamamlandi";
  }
  
  application.notes.push(newNote);
  return { success: true, message: "İşlem başarılı." };
};

export const createApplication = (formData) => {
  const newId = `A-${Math.floor(10000 + Math.random() * 90000)}`;
  const newApp = {
    ...formData,
    id: newId,
    name: `${formData.personal.ad} ${formData.personal.soyad}`,
    branches: formData.jobDetails.subeler.map(s => s.label),
    areas: formData.jobDetails.alanlar.map(a => a.label),
    departments: formData.jobDetails.departmanlar.map(d => d.label),
    roles: formData.jobDetails.departmanPozisyonlari.map(p => p.label),
    date: new Date().toISOString().split("T")[0],
    age: new Date().getFullYear() - new Date(formData.personal.dogumTarihi).getFullYear(),
    status: "Bekleyen",
    notes: [{ user: "Sistem", note: "Başvuru alındı.", date: new Date().toISOString().split("T")[0], action: "BAŞVURU" }],
    appliedAt: new Date().toISOString().split("T")[0],
    approvalStage: "departman_muduru",
  };
  APPLICATIONS.unshift(newApp);
  return { success: true, newId };
};

export const dbChangePassword = (username, oldP, newP) => {
  const user = USERS.find(u => u.username === username);
  if (!user || user.password !== oldP) return { success: false, message: "Hatalı bilgiler." };
  user.password = newP;
  return { success: true, message: "Şifre güncellendi." };
};

// --- YARDIMCI FONKSİYON (Log Tablosu İçin) ---
export const getUserRoleByName = (nameString) => {
  // Tam eşleşme yapmaya çalışır. 
  // Not: staticDB içindeki "user" isimleri ile buradaki "name" alanları birebir tutmalı.
  const user = USERS.find(u => u.name === nameString);
  return user ? user.role : null;
};

// ... (Mevcut kodların devamı) ...

// --- TEST İÇİN GEÇİCİ KOD (Test bitince silersin) ---
// Otomatik olarak 10 tane 'Bekleyen' statüsünde başvuru ekler
for (let i = 1; i <= 10; i++) {
  APPLICATIONS.push({
    id: `TEST-${1000 + i}`,
    name: `Test Adayı ${i}`,
    branches: ["Girne"],
    areas: ["Hotel"],
    departments: ["IT"],
    roles: ["Test Uzmanı"],
    date: new Date().toISOString(),
    age: 20 + i,
    status: "Bekleyen", // Bildirimde görünmesi için Bekleyen olmalı
    approvalStage: "departman_muduru", // Hangi rol ile gireceksen ona uygun aşama olmalı
    notes: [],
    personal: { ad: `Test${i}`, soyad: "Aday" },
    jobDetails: { departmanPozisyonlari: [] }
  });
}

for (let i = 1; i <= 100; i++) {
  APPLICATIONS.push({
    id: `TEST-${1010 + i}`,
    name: `IK-Test Adayı ${i}`,
    branches: ["Prestige"],
    areas: ["Casino"],
    departments: ["IT"],
    roles: ["Test Uzmanı"],
    date: new Date().toISOString(),
    age: 20 + i,
    status: "Bekleyen", // Bildirimde görünmesi için Bekleyen olmalı
    approvalStage: "ik", // Hangi rol ile gireceksen ona uygun aşama olmalı
    notes: [],
    personal: { ad: `Test${i}`, soyad: "Aday" },
    jobDetails: { departmanPozisyonlari: [] }
  });
}