using AutoMapper;
using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.DTOs.AdminDtos.RolDtos;
using IsBasvuru.Domain.DTOs.LogDtos.BasvuruLogDtos;
using IsBasvuru.Domain.DTOs.LogDtos.CvLogDtos;
using IsBasvuru.Domain.DTOs.MasterBasvuruDtos;

using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.KisiselBilgilerListDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.KisiselBilgilerDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.BilgisayarBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.DigerKisiselBilgilerDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.EgitimBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.IsDeneyimiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.ReferansBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.SertifikaBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.YabanciDilBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanPozisyonDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.OyunBilgisiDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.PersonelEhliyetDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.ProgramBilgisiDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.SubeAlanDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.SubeDtos;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.DilDtos;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.EhliyetTuruDtos;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.IlceDtos;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.KktcBelgeDtos;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.KvkkDtos;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.SehirDtos;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.UlkeDtos;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.UyrukDtos;
using IsBasvuru.Domain.Entities;
using IsBasvuru.Domain.Entities.AdminBilgileri;
using IsBasvuru.Domain.Entities.Log;
using IsBasvuru.Domain.Entities.PersonelBilgileri;
using IsBasvuru.Domain.Entities.SirketYapisi;
using IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi;
using IsBasvuru.Domain.Entities.Tanimlamalar;

namespace IsBasvuru.WebAPI.Mapping
{
    public class MapProfile : Profile
    {
        public MapProfile()
        {
            // Veritabanından okurken (Entity -> Dto)
            // Güncelleme yaparken (Dto -> Entity)
            // Yeni kayıt eklerken (Dto -> Entity)

            //Sube
            CreateMap<Sube, SubeListDto>();
            CreateMap<SubeCreateDto, Sube>();
            CreateMap<SubeUpdateDto, Sube>();

            //subeALan

            CreateMap<SubeAlan, SubeAlanListDto>()
                .ForMember(dest => dest.SubeAdi,
                           opt => opt.MapFrom(src => src.Sube != null ? src.Sube.SubeAdi : string.Empty));
            CreateMap<SubeAlanCreateDto, SubeAlan>();
            CreateMap<SubeAlanUpdateDto, SubeAlan>();

            //Departman
            CreateMap<Departman, DepartmanListDto>()
                .ForMember(dest => dest.SubeAlanAdi, opt => opt.MapFrom(src => src.SubeAlan != null ? src.SubeAlan.SubeAlanAdi : string.Empty))
                .ForMember(dest => dest.SubeAdi, opt => opt.MapFrom(src => src.SubeAlan != null && src.SubeAlan.Sube != null ? src.SubeAlan.Sube.SubeAdi : string.Empty));
            CreateMap<DepartmanCreateDto, Departman>();
            CreateMap<DepartmanUpdateDto, Departman>();

            //DepartmanPozisyon
            CreateMap<DepartmanPozisyon, DepartmanPozisyonListDto>()
                 // 1. Departman kontrolü
                 .ForMember(dest => dest.DepartmanAdi,
                            opt => opt.MapFrom(src => src.Departman != null ? src.Departman.DepartmanAdi : string.Empty))

                 // 2. Departman VE SubeAlan kontrolü
                 .ForMember(dest => dest.SubeAlanAdi,
                            opt => opt.MapFrom(src => src.Departman != null && src.Departman.SubeAlan != null ? src.Departman.SubeAlan.SubeAlanAdi : string.Empty))

                 // 3. Departman VE SubeAlan VE Sube kontrolü (Hata veren yer burasıydı)
                 .ForMember(dest => dest.SubeAdi,
                            opt => opt.MapFrom(src =>
                                src.Departman != null &&
                                src.Departman.SubeAlan != null &&
                                src.Departman.SubeAlan.Sube != null
                                ? src.Departman.SubeAlan.Sube.SubeAdi
                                : string.Empty));
            CreateMap<DepartmanPozisyonCreateDto, DepartmanPozisyon>();
            CreateMap<DepartmanPozisyonUpdateDto, DepartmanPozisyon>();

            //PersonelEhliyetTuru
            CreateMap<PersonelEhliyetCreateDto, PersonelEhliyet>();
            CreateMap<PersonelEhliyetUpdateDto, PersonelEhliyet>();

            CreateMap<PersonelEhliyet, PersonelEhliyetListDto>()
                .ForMember(dest => dest.EhliyetTuruAdi, opt => opt.MapFrom(src => src.EhliyetTuru != null ? src.EhliyetTuru.EhliyetTuruAdi : ""));


            // SEHIR 
            CreateMap<Sehir, SehirListDto>()
                // Ulke null ise boş string dön
                .ForMember(dest => dest.UlkeAdi,
                           opt => opt.MapFrom(src => src.Ulke != null ? src.Ulke.UlkeAdi : string.Empty));

            CreateMap<SehirCreateDto, Sehir>();
            CreateMap<SehirUpdateDto, Sehir>();

            // ILCE 
            CreateMap<Ilce, IlceListDto>()
                // Sehir null kontrolü
                .ForMember(dest => dest.SehirAdi,
                           opt => opt.MapFrom(src => src.Sehir != null ? src.Sehir.SehirAdi : string.Empty))
                // Zincirleme Kontrol: Hem Sehir hem de Sehir'in içindeki Ulke var mı?
                .ForMember(dest => dest.UlkeAdi,
                           opt => opt.MapFrom(src => src.Sehir != null && src.Sehir.Ulke != null ? src.Sehir.Ulke.UlkeAdi : string.Empty));
            CreateMap<IlceCreateDto, Ilce>();
            CreateMap<IlceUpdateDto, Ilce>();

            // UYRUK
            CreateMap<Uyruk, UyrukListDto>()
                .ForMember(dest => dest.UlkeAdi,
                           opt => opt.MapFrom(src => src.Ulke != null ? src.Ulke.UlkeAdi : string.Empty));
            CreateMap<UyrukCreateDto, Uyruk>();
            CreateMap<UyrukUpdateDto, Uyruk>();

            // Dil
            CreateMap<Dil, DilListDto>();
            CreateMap<DilCreateDto, Dil>();
            CreateMap<DilUpdateDto, Dil>();

            // EhliyetTuru
            CreateMap<EhliyetTuru, EhliyetTuruListDto>();
            CreateMap<EhliyetTuruCreateDto, EhliyetTuru>();
            CreateMap<EhliyetTuruUpdateDto, EhliyetTuru>();

            // KktcBelge
            CreateMap<KktcBelge, KktcBelgeListDto>();
            CreateMap<KktcBelgeCreateDto, KktcBelge>();
            CreateMap<KktcBelgeUpdateDto, KktcBelge>();

            // Kvkk
            CreateMap<Kvkk, KvkkListDto>();
            CreateMap<KvkkCreateDto, Kvkk>();
            CreateMap<KvkkUpdateDto, Kvkk>();

            // OyunBilgisi
            CreateMap<OyunBilgisi, OyunBilgisiListDto>();
            CreateMap<OyunBilgisiCreateDto, OyunBilgisi>();
            CreateMap<OyunBilgisiUpdateDto, OyunBilgisi>();

            // ProgramBilgisi (İlişkili)
            CreateMap<ProgramBilgisi, ProgramBilgisiListDto>()
                .ForMember(dest => dest.DepartmanAdi, opt => opt.MapFrom(src => src.Departman != null ? src.Departman.DepartmanAdi : string.Empty));
            CreateMap<ProgramBilgisiCreateDto, ProgramBilgisi>();
            CreateMap<ProgramBilgisiUpdateDto, ProgramBilgisi>();

            //KİSİSEL BİLGİLER
            CreateMap<KisiselBilgilerDto, KisiselBilgiler>();
            CreateMap<KisiselBilgiler, KisiselBilgilerListDto>()
                // UYRUK: Tablodan gelirse (TabloAdı), yoksa manuel girileni (UyrukAdi) göster
                .ForMember(dest => dest.UyrukAdi, opt => opt.MapFrom(src => src.Uyruk != null ? src.Uyruk.UyrukAdi : src.UyrukAdi))

                // DOĞUM YERİ: İlişki varsa İlişkiden, yoksa Manuel Alandan
                .ForMember(dest => dest.DogumUlkeAdi, opt => opt.MapFrom(src => src.DogumUlke != null ? src.DogumUlke.UlkeAdi : src.DogumUlkeAdi))
                .ForMember(dest => dest.DogumSehirAdi, opt => opt.MapFrom(src => src.DogumSehir != null ? src.DogumSehir.SehirAdi : src.DogumSehirAdi))
                .ForMember(dest => dest.DogumIlceAdi, opt => opt.MapFrom(src => src.DogumIlce != null ? src.DogumIlce.IlceAdi : src.DogumIlceAdi))

                // İKAMETGAH: İlişki varsa İlişkiden, yoksa Manuel Alandan
                .ForMember(dest => dest.IkametgahUlkeAdi, opt => opt.MapFrom(src => src.IkametgahUlke != null ? src.IkametgahUlke.UlkeAdi : src.IkametgahUlkeAdi))
                .ForMember(dest => dest.IkametgahSehirAdi, opt => opt.MapFrom(src => src.IkametgahSehir != null ? src.IkametgahSehir.SehirAdi : src.IkametgahSehirAdi))
                .ForMember(dest => dest.IkametgahIlceAdi, opt => opt.MapFrom(src => src.IkametgahIlce != null ? src.IkametgahIlce.IlceAdi : src.IkametgahIlceAdi));

            CreateMap<PersonelCreateDto, Personel>()
                .ForMember(dest => dest.KisiselBilgiler, opt => opt.MapFrom(src => src.KisiselBilgiler))
                .ForMember(dest => dest.GuncellemeTarihi, opt => opt.MapFrom(src => System.DateTime.Now));
            CreateMap<PersonelUpdateDto, Personel>()
                .ForMember(dest => dest.KisiselBilgiler, opt => opt.MapFrom(src => src.KisiselBilgiler))
                .ForMember(dest => dest.GuncellemeTarihi, opt => opt.MapFrom(src => System.DateTime.Now));
            CreateMap<Personel, PersonelListDto>()
               // Flattening: KisiselBilgiler içindeki Ad/Soyad'ı PersonelListDto'nun tepesine taşıyoruz
               .ForMember(dest => dest.Ad, opt => opt.MapFrom(src => src.KisiselBilgiler != null ? src.KisiselBilgiler.Ad : ""))
               .ForMember(dest => dest.Soyad, opt => opt.MapFrom(src => src.KisiselBilgiler != null ? src.KisiselBilgiler.Soyadi : ""))
               .ForMember(dest => dest.FotografYolu, opt => opt.MapFrom(src => src.KisiselBilgiler != null ? src.KisiselBilgiler.VesikalikFotograf : ""));

            //EĞİTİM BİLGİSİ
            CreateMap<EgitimBilgisiCreateDto, EgitimBilgisi>();
            CreateMap<EgitimBilgisiUpdateDto, EgitimBilgisi>();
            CreateMap<EgitimBilgisi, EgitimBilgisiListDto>()
                .ForMember(dest => dest.EgitimSeviyesiAdi, opt => opt.MapFrom(src => src.EgitimSeviyesi.ToString()))
                .ForMember(dest => dest.DiplomaDurumAdi, opt => opt.MapFrom(src => src.DiplomaDurum.ToString()));

            //İŞ DENEYİMİ
            CreateMap<IsDeneyimiCreateDto, IsDeneyimi>();
            CreateMap<IsDeneyimiUpdateDto, IsDeneyimi>();
            CreateMap<IsDeneyimi, IsDeneyimiListDto>()
                // Ülke Mantığı: İlişki varsa oradan al, yoksa manuel alandan al
                .ForMember(dest => dest.UlkeAdi, opt => opt.MapFrom(src => src.Ulke != null ? src.Ulke.UlkeAdi : src.UlkeAdi))
                // Şehir Mantığı: İlişki varsa oradan al, yoksa manuel alandan al
                .ForMember(dest => dest.SehirAdi, opt => opt.MapFrom(src => src.Sehir != null ? src.Sehir.SehirAdi : src.SehirAdi));

            //YABANCI DİL BİLGİSİ
            CreateMap<YabanciDilBilgisiCreateDto, YabanciDilBilgisi>();
            CreateMap<YabanciDilBilgisiUpdateDto, YabanciDilBilgisi>();
            CreateMap<YabanciDilBilgisi, YabanciDilBilgisiListDto>()
                .ForMember(dest => dest.DilAdi, opt => opt.MapFrom(src => src.Dil != null ? src.Dil.DilAdi : ""))
                .ForMember(dest => dest.KonusmaSeviyesiAdi, opt => opt.MapFrom(src => src.KonusmaSeviyesi.ToString()))
                .ForMember(dest => dest.YazmaSeviyesiAdi, opt => opt.MapFrom(src => src.YazmaSeviyesi.ToString()))
                .ForMember(dest => dest.OkumaSeviyesiAdi, opt => opt.MapFrom(src => src.OkumaSeviyesi.ToString()))
                .ForMember(dest => dest.DinlemeSeviyesiAdi, opt => opt.MapFrom(src => src.DinlemeSeviyesi.ToString()));

            //SERTİFİKA BİLGİSİ 
            CreateMap<SertifikaBilgisiCreateDto, SertifikaBilgisi>();
            CreateMap<SertifikaBilgisiUpdateDto, SertifikaBilgisi>();
            CreateMap<SertifikaBilgisi, SertifikaBilgisiListDto>();

            //BİLGİSAYAR BİLGİSİ
            CreateMap<BilgisayarBilgisiCreateDto, BilgisayarBilgisi>();
            CreateMap<BilgisayarBilgisiUpdateDto, BilgisayarBilgisi>();
            CreateMap<BilgisayarBilgisi, BilgisayarBilgisiListDto>()
                .ForMember(dest => dest.YetkinlikAdi, opt => opt.MapFrom(src => src.Yetkinlik.ToString()));

            //REFERANS BİLGİSİ
            CreateMap<ReferansBilgisiCreateDto, ReferansBilgisi>();
            CreateMap<ReferansBilgisiUpdateDto, ReferansBilgisi>();
            CreateMap<ReferansBilgisi, ReferansBilgisiListDto>()
                .ForMember(dest => dest.CalistigiKurumAdi, opt => opt.MapFrom(src => src.CalistigiKurum.ToString()));

            //DİĞER KİŞİSEL BİLGİLER 
            CreateMap<DigerKisiselBilgilerCreateDto, DigerKisiselBilgiler>();
            CreateMap<DigerKisiselBilgilerUpdateDto, DigerKisiselBilgiler>();
            CreateMap<DigerKisiselBilgiler, DigerKisiselBilgilerListDto>()
                // İlişkili Tablo
                .ForMember(dest => dest.KktcBelgeAdi, opt => opt.MapFrom(src => src.KktcBelge != null ? src.KktcBelge.BelgeAdi : ""))
                // Enum Çevirimleri
                .ForMember(dest => dest.DavaDurumuAdi, opt => opt.MapFrom(src => src.DavaDurumu.ToString()))
                .ForMember(dest => dest.SigaraKullanimiAdi, opt => opt.MapFrom(src => src.SigaraKullanimi.ToString()))
                .ForMember(dest => dest.AskerlikDurumuAdi, opt => opt.MapFrom(src => src.AskerlikDurumu.ToString()))
                .ForMember(dest => dest.KaliciRahatsizlikAdi, opt => opt.MapFrom(src => src.KaliciRahatsizlik.ToString()))
                .ForMember(dest => dest.EhliyetDurumuAdi, opt => opt.MapFrom(src => src.EhliyetDurumu.ToString()));

            //MASTER BAŞVURU
            CreateMap<MasterBasvuruCreateDto, MasterBasvuru>();
            CreateMap<MasterBasvuruUpdateDto, MasterBasvuru>();
            CreateMap<MasterBasvuru, MasterBasvuruListDto>()
                .ForMember(dest => dest.BasvuruDurumAdi, opt => opt.MapFrom(src => src.BasvuruDurum.ToString()))
                .ForMember(dest => dest.BasvuruOnayAsamasiAdi, opt => opt.MapFrom(src => src.BasvuruOnayAsamasi.ToString()));



            //Rol
            CreateMap<Rol, RolListDto>().ReverseMap();
            CreateMap<RolCreateDto, Rol>(); // Ekleme
            CreateMap<RolUpdateDto, Rol>();

            // Panel Kullanıcı 
            CreateMap<PanelKullanici, PanelKullaniciListDto>()
                // Rol null olabilir, kontrol ekledik
                .ForMember(dest => dest.RolAdi,
                           opt => opt.MapFrom(src => src.Rol != null ? src.Rol.RolAdi : string.Empty))
                // Sube null olabilir
                .ForMember(dest => dest.SubeAdi,
                           opt => opt.MapFrom(src => src.Sube != null ? src.Sube.SubeAdi : string.Empty))
                // Departman null olabilir
                .ForMember(dest => dest.DepartmanAdi,
                           opt => opt.MapFrom(src => src.Departman != null ? src.Departman.DepartmanAdi : string.Empty));
            CreateMap<PanelKullaniciCreateDto, PanelKullanici>();
            // Şifre güncellemesi manuel service içinde yapıldığı için burada ignore ediyoruz
            CreateMap<PanelKullaniciUpdateDto, PanelKullanici>()
                .ForMember(dest => dest.KullaniciSifre, opt => opt.Ignore());


            CreateMap<BasvuruIslemLog, BasvuruIslemLogListDto>()
                    .ForMember(dest => dest.IslemTipiAdi, opt => opt.MapFrom(src => src.IslemTipi.ToString()))
                    .ForMember(dest => dest.PanelKullaniciAdSoyad, opt => opt.MapFrom(src =>
                        src.PanelKullanici != null ? $"{src.PanelKullanici.Adi} {src.PanelKullanici.Soyadi}" : ""));

            //CV Değişiklik Logları
            CreateMap<CvDegisiklikLog, CvDegisiklikLogListDto>()
                .ForMember(dest => dest.DegisiklikTipiAdi, opt => opt.MapFrom(src => src.DegisiklikTipi.ToString()));
        }
    }
}