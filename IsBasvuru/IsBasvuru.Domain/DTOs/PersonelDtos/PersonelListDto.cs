using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.KisiselBilgilerListDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.BilgisayarBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.DigerKisiselBilgilerDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.EgitimBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.IsDeneyimiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.ReferansBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.SertifikaBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.YabanciDilBilgisiDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.PersonelEhliyetDtos;
using IsBasvuru.Domain.Entities.PersonelBilgileri;
using Microsoft.AspNetCore.Http;


namespace IsBasvuru.Domain.DTOs.PersonelDtos
{
    public class PersonelListDto
    {
        public int Id { get; set; }
        public required string Ad { get; set; }
        public required string Soyad { get; set; }
        public required string FotografYolu { get; set; }

        public required string NedenBiz { get; set; }
        public int LojmanTalebi { get; set; }

        public DateTime GuncellemeTarihi { get; set; }

        public required KisiselBilgilerListDto KisiselBilgiler { get; set; }
        public required DigerKisiselBilgilerListDto DigerKisiselBilgiler { get; set; }

        public List<EgitimBilgisiListDto> EgitimBilgileri { get; set; } = new();
        public List<IsDeneyimiListDto> IsDeneyimleri { get; set; } = new();
        public List<YabanciDilBilgisiListDto> YabanciDilBilgileri { get; set; } = new();
        public List<BilgisayarBilgisiListDto> BilgisayarBilgileri { get; set; } = new();
        public List<SertifikaBilgisiListDto> SertifikaBilgileri { get; set; } = new();
        public List<ReferansBilgisiListDto> ReferansBilgileri { get; set; } = new();
        public List<PersonelEhliyetListDto> PersonelEhliyetler { get; set; } = new();
        
        public object? IsBasvuruDetay { get; set; }
    }
}