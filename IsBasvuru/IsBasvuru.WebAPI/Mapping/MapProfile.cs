using AutoMapper;
using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.DTOs.AdminDtos.RolDtos;
using IsBasvuru.Domain.DTOs.LogDtos.BasvuruLogDtos;
using IsBasvuru.Domain.DTOs.LogDtos.CvLogDtos;
using IsBasvuru.Domain.DTOs.MasterBasvuruDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.BilgisayarBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.DigerKisiselBilgilerDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.EgitimBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.IsDeneyimiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.KisiselBilgilerDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.KisiselBilgilerListDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.ReferansBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.SertifikaBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.YabanciDilBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelDtos;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterAlanDtos;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterDepartmanDtos;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterPozisyonDtos;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterSubeAlan;
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
using System.Collections.Generic;
using System.Linq;

namespace IsBasvuru.WebAPI.Mapping
{
    public class MapProfile : Profile
    {
        public MapProfile()
        {
            // =======================================================
            // 1. PERSONEL VE DETAYLARI (EN ÖNEMLİ KISIM)
            // =======================================================

            // Create (DTO -> Entity)
            CreateMap<PersonelCreateDto, Personel>()
                // Detayı servis içinde elle yapıyoruz, AutoMapper karışmasın.
                .ForMember(dest => dest.IsBasvuruDetay, opt => opt.Ignore());

            // Update (DTO -> Entity)
            CreateMap<PersonelUpdateDto, Personel>()
                .ForMember(dest => dest.IsBasvuruDetay, opt => opt.Ignore());

            // List / Get (Entity -> DTO)
            CreateMap<Personel, PersonelListDto>()
                // Lojman Talebini, Detay tablosundan alıp int'e çeviriyoruz
                .ForMember(dest => dest.LojmanTalebi, opt => opt.MapFrom(src =>
                    src.IsBasvuruDetay != null ? (int)src.IsBasvuruDetay.LojmanTalebiVarMi : 0))

                // Neden Biz'i Detay tablosundan alıyoruz
                .ForMember(dest => dest.NedenBiz, opt => opt.MapFrom(src =>
                    src.IsBasvuruDetay != null ? src.IsBasvuruDetay.NedenBiz : string.Empty))

                // Fotoğraf Yolu
                .ForMember(dest => dest.FotografYolu, opt => opt.MapFrom(src =>
                    src.KisiselBilgiler != null ? src.KisiselBilgiler.VesikalikFotograf : string.Empty))

                // Ad Soyad Flattening
                .ForMember(dest => dest.Ad, opt => opt.MapFrom(src => src.KisiselBilgiler != null ? src.KisiselBilgiler.Ad : ""))
                .ForMember(dest => dest.Soyad, opt => opt.MapFrom(src => src.KisiselBilgiler != null ? src.KisiselBilgiler.Soyadi : ""));

            // =======================================================
            // 2. KİŞİSEL BİLGİLER VE ALT NESNELER
            // =======================================================
            CreateMap<KisiselBilgilerDto, KisiselBilgiler>().ReverseMap();
            CreateMap<KisiselBilgilerListDto, KisiselBilgiler>().ReverseMap();

            // Kişisel Bilgiler List DTO Mapping (Detaylı)
            CreateMap<KisiselBilgiler, KisiselBilgilerListDto>()
                .ForMember(dest => dest.UyrukAdi, opt => opt.MapFrom(src => src.Uyruk != null ? src.Uyruk.UyrukAdi : src.UyrukAdi))
                .ForMember(dest => dest.DogumUlkeAdi, opt => opt.MapFrom(src => src.DogumUlke != null ? src.DogumUlke.UlkeAdi : src.DogumUlkeAdi))
                .ForMember(dest => dest.DogumSehirAdi, opt => opt.MapFrom(src => src.DogumSehir != null ? src.DogumSehir.SehirAdi : src.DogumSehirAdi))
                .ForMember(dest => dest.DogumIlceAdi, opt => opt.MapFrom(src => src.DogumIlce != null ? src.DogumIlce.IlceAdi : src.DogumIlceAdi))
                .ForMember(dest => dest.IkametgahUlkeAdi, opt => opt.MapFrom(src => src.IkametgahUlke != null ? src.IkametgahUlke.UlkeAdi : src.IkametgahUlkeAdi))
                .ForMember(dest => dest.IkametgahSehirAdi, opt => opt.MapFrom(src => src.IkametgahSehir != null ? src.IkametgahSehir.SehirAdi : src.IkametgahSehirAdi))
                .ForMember(dest => dest.IkametgahIlceAdi, opt => opt.MapFrom(src => src.IkametgahIlce != null ? src.IkametgahIlce.IlceAdi : src.IkametgahIlceAdi));

            CreateMap<DigerKisiselBilgilerCreateDto, DigerKisiselBilgiler>().ReverseMap();
            CreateMap<DigerKisiselBilgilerUpdateDto, DigerKisiselBilgiler>().ReverseMap();
            CreateMap<DigerKisiselBilgilerListDto, DigerKisiselBilgiler>().ReverseMap();

            // =======================================================
            // 3. EĞİTİM, İŞ, SERTİFİKA VB. (BU KISIM EKSİKTİ)
            // =======================================================
            CreateMap<EgitimBilgisiCreateDto, EgitimBilgisi>().ReverseMap();
            CreateMap<EgitimBilgisiListDto, EgitimBilgisi>().ReverseMap();

            CreateMap<IsDeneyimiCreateDto, IsDeneyimi>().ReverseMap();
            CreateMap<IsDeneyimiListDto, IsDeneyimi>().ReverseMap();

            CreateMap<YabanciDilBilgisiCreateDto, YabanciDilBilgisi>().ReverseMap();
            CreateMap<YabanciDilBilgisiListDto, YabanciDilBilgisi>().ReverseMap();

            CreateMap<BilgisayarBilgisiCreateDto, BilgisayarBilgisi>().ReverseMap();
            CreateMap<BilgisayarBilgisiListDto, BilgisayarBilgisi>().ReverseMap();

            CreateMap<SertifikaBilgisiCreateDto, SertifikaBilgisi>().ReverseMap();
            CreateMap<SertifikaBilgisiListDto, SertifikaBilgisi>().ReverseMap();

            CreateMap<ReferansBilgisiCreateDto, ReferansBilgisi>().ReverseMap();
            CreateMap<ReferansBilgisiListDto, ReferansBilgisi>().ReverseMap();

            // =======================================================
            // 4. ŞİRKET YAPISI VE TANIMLAMALAR (MASTER)
            // =======================================================

            // MasterAlan
            CreateMap<MasterAlan, MasterAlanListDto>().ReverseMap();
            CreateMap<MasterAlanCreateDto, MasterAlan>();
            CreateMap<MasterAlanUpdateDto, MasterAlan>();

            // MasterDepartman
            CreateMap<MasterDepartman, MasterDepartmanListDto>().ReverseMap();
            CreateMap<MasterDepartmanCreateDto, MasterDepartman>();
            CreateMap<MasterDepartmanUpdateDto, MasterDepartman>();

            // MasterPozisyon
            CreateMap<MasterPozisyon, MasterPozisyonListDto>().ReverseMap();
            CreateMap<MasterPozisyonCreateDto, MasterPozisyon>();
            CreateMap<MasterPozisyonUpdateDto, MasterPozisyon>();

            // Sube
            CreateMap<Sube, SubeListDto>().ReverseMap();
            CreateMap<SubeCreateDto, Sube>();
            CreateMap<SubeUpdateDto, Sube>();

            // SubeAlan
            CreateMap<SubeAlan, SubeAlanListDto>()
                .ForMember(dest => dest.SubeAdi, opt => opt.MapFrom(src => src.Sube != null ? src.Sube.SubeAdi : string.Empty))
                .ForMember(dest => dest.AlanAdi, opt => opt.MapFrom(src => src.MasterAlan != null ? src.MasterAlan.MasterAlanAdi : string.Empty));
            CreateMap<SubeAlanCreateDto, SubeAlan>();
            CreateMap<SubeAlanUpdateDto, SubeAlan>();

            // Departman
            CreateMap<Departman, DepartmanListDto>()
                .ForMember(dest => dest.DepartmanAdi, opt => opt.MapFrom(src => src.MasterDepartman != null ? src.MasterDepartman.MasterDepartmanAdi : string.Empty))
                .ForMember(dest => dest.SubeAlanAdi, opt => opt.MapFrom(src => src.SubeAlan != null && src.SubeAlan.MasterAlan != null ? src.SubeAlan.MasterAlan.MasterAlanAdi : string.Empty))
                .ForMember(dest => dest.SubeAdi, opt => opt.MapFrom(src => src.SubeAlan != null && src.SubeAlan.Sube != null ? src.SubeAlan.Sube.SubeAdi : string.Empty));
            CreateMap<DepartmanCreateDto, Departman>();
            CreateMap<DepartmanUpdateDto, Departman>();

            // DepartmanPozisyon
            CreateMap<DepartmanPozisyon, DepartmanPozisyonListDto>()
                 .ForMember(dest => dest.PozisyonAdi, opt => opt.MapFrom(src => src.MasterPozisyon != null ? src.MasterPozisyon.MasterPozisyonAdi : string.Empty))
                 .ForMember(dest => dest.DepartmanAdi, opt => opt.MapFrom(src => src.Departman != null && src.Departman.MasterDepartman != null ? src.Departman.MasterDepartman.MasterDepartmanAdi : string.Empty))
                 .ForMember(dest => dest.SubeAlanAdi, opt => opt.MapFrom(src => src.Departman != null && src.Departman.SubeAlan != null && src.Departman.SubeAlan.MasterAlan != null ? src.Departman.SubeAlan.MasterAlan.MasterAlanAdi : string.Empty))
                 .ForMember(dest => dest.SubeAdi, opt => opt.MapFrom(src => src.Departman != null && src.Departman.SubeAlan != null && src.Departman.SubeAlan.Sube != null ? src.Departman.SubeAlan.Sube.SubeAdi : string.Empty));
            CreateMap<DepartmanPozisyonCreateDto, DepartmanPozisyon>();
            CreateMap<DepartmanPozisyonUpdateDto, DepartmanPozisyon>();

            // PersonelEhliyet
            CreateMap<PersonelEhliyetCreateDto, PersonelEhliyet>();
            CreateMap<PersonelEhliyetUpdateDto, PersonelEhliyet>();
            CreateMap<PersonelEhliyet, PersonelEhliyetListDto>()
                .ForMember(dest => dest.EhliyetTuruAdi, opt => opt.MapFrom(src => src.EhliyetTuru != null ? src.EhliyetTuru.EhliyetTuruAdi : ""));

            // OyunBilgisi
            CreateMap<OyunBilgisi, OyunBilgisiListDto>()
                .ForMember(dest => dest.DepartmanAdi, opt => opt.MapFrom(src => src.Departman != null && src.Departman.MasterDepartman != null ? src.Departman.MasterDepartman.MasterDepartmanAdi : string.Empty));
            CreateMap<OyunBilgisiCreateDto, OyunBilgisi>();
            CreateMap<OyunBilgisiUpdateDto, OyunBilgisi>();

            // ProgramBilgisi
            CreateMap<ProgramBilgisi, ProgramBilgisiListDto>()
                .ForMember(dest => dest.DepartmanAdi, opt => opt.MapFrom(src => src.Departman != null && src.Departman.MasterDepartman != null ? src.Departman.MasterDepartman.MasterDepartmanAdi : string.Empty));
            CreateMap<ProgramBilgisiCreateDto, ProgramBilgisi>();
            CreateMap<ProgramBilgisiUpdateDto, ProgramBilgisi>();

            // =======================================================
            // 5. TANIMLAMALAR (ÜLKE, ŞEHİR, DİL VS.)
            // =======================================================
            CreateMap<Ulke, UlkeListDto>().ReverseMap();
            CreateMap<UlkeCreateDto, Ulke>().ReverseMap();
            CreateMap<UlkeUpdateDto, Ulke>().ReverseMap();

            CreateMap<Sehir, SehirListDto>()
                .ForMember(dest => dest.UlkeAdi, opt => opt.MapFrom(src => src.Ulke != null ? src.Ulke.UlkeAdi : string.Empty));
            CreateMap<SehirCreateDto, Sehir>();
            CreateMap<SehirUpdateDto, Sehir>();

            CreateMap<Ilce, IlceListDto>()
                .ForMember(dest => dest.SehirAdi, opt => opt.MapFrom(src => src.Sehir != null ? src.Sehir.SehirAdi : string.Empty))
                .ForMember(dest => dest.UlkeAdi, opt => opt.MapFrom(src => src.Sehir != null && src.Sehir.Ulke != null ? src.Sehir.Ulke.UlkeAdi : string.Empty));
            CreateMap<IlceCreateDto, Ilce>();
            CreateMap<IlceUpdateDto, Ilce>();

            CreateMap<Uyruk, UyrukListDto>()
                .ForMember(dest => dest.UlkeAdi, opt => opt.MapFrom(src => src.Ulke != null ? src.Ulke.UlkeAdi : string.Empty));
            CreateMap<UyrukCreateDto, Uyruk>();
            CreateMap<UyrukUpdateDto, Uyruk>();

            CreateMap<Dil, DilListDto>().ReverseMap();
            CreateMap<DilCreateDto, Dil>();
            CreateMap<DilUpdateDto, Dil>();

            CreateMap<EhliyetTuru, EhliyetTuruListDto>().ReverseMap();
            CreateMap<EhliyetTuruCreateDto, EhliyetTuru>();
            CreateMap<EhliyetTuruUpdateDto, EhliyetTuru>();

            CreateMap<KktcBelge, KktcBelgeListDto>().ReverseMap();
            CreateMap<KktcBelgeCreateDto, KktcBelge>();
            CreateMap<KktcBelgeUpdateDto, KktcBelge>();

            CreateMap<Kvkk, KvkkListDto>().ReverseMap();
            CreateMap<KvkkCreateDto, Kvkk>();
            CreateMap<KvkkUpdateDto, Kvkk>();

            // =======================================================
            // 6. ADMIN, ROL, LOG
            // =======================================================
            CreateMap<Rol, RolListDto>().ReverseMap();
            CreateMap<RolCreateDto, Rol>();
            CreateMap<RolUpdateDto, Rol>();

            CreateMap<PanelKullanici, PanelKullaniciListDto>()
                .ForMember(dest => dest.RolAdi, opt => opt.MapFrom(src => src.Rol != null ? src.Rol.RolAdi : string.Empty))
                .ForMember(dest => dest.SubeAdi, opt => opt.MapFrom(src => src.Sube != null ? src.Sube.SubeAdi : string.Empty))
                .ForMember(dest => dest.SubeAlanAdi, opt => opt.MapFrom(src => src.SubeAlan != null && src.SubeAlan.MasterAlan != null ? src.SubeAlan.MasterAlan.MasterAlanAdi : string.Empty))
                .ForMember(dest => dest.DepartmanAdi, opt => opt.MapFrom(src => src.Departman != null && src.Departman.MasterDepartman != null ? src.Departman.MasterDepartman.MasterDepartmanAdi : string.Empty));

            CreateMap<PanelKullaniciCreateDto, PanelKullanici>();
            CreateMap<PanelKullaniciUpdateDto, PanelKullanici>()
                .ForMember(dest => dest.KullaniciSifre, opt => opt.Ignore());

            // Loglar
            CreateMap<BasvuruIslemLog, BasvuruIslemLogListDto>()
                    .ForMember(dest => dest.IslemTipiAdi, opt => opt.MapFrom(src => src.IslemTipi.ToString()))
                    .ForMember(dest => dest.PanelKullaniciAdSoyad, opt => opt.MapFrom(src => src.PanelKullanici != null ? $"{src.PanelKullanici.Adi} {src.PanelKullanici.Soyadi}" : ""));

            CreateMap<CvDegisiklikLog, CvDegisiklikLogListDto>()
                .ForMember(dest => dest.DegisiklikTipiAdi, opt => opt.MapFrom(src => src.DegisiklikTipi.ToString()));

            // Master Başvuru
            CreateMap<MasterBasvuruCreateDto, MasterBasvuru>();
            CreateMap<MasterBasvuruUpdateDto, MasterBasvuru>();
            CreateMap<MasterBasvuru, MasterBasvuruListDto>()
                .ForMember(dest => dest.BasvuruDurumAdi, opt => opt.MapFrom(src => src.BasvuruDurum.ToString()))
                .ForMember(dest => dest.BasvuruOnayAsamasiAdi, opt => opt.MapFrom(src => src.BasvuruOnayAsamasi.ToString()));
        }
    }
}