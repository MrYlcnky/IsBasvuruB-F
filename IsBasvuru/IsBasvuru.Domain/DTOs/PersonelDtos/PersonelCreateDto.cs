using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.BilgisayarBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.DigerKisiselBilgilerDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.EgitimBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.IsDeneyimiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.KisiselBilgilerDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.ReferansBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.SertifikaBilgisiDtos;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.YabanciDilBilgisiDtos;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.PersonelEhliyetDtos;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace IsBasvuru.Domain.DTOs.PersonelDtos
{
    public class PersonelCreateDto
    {
        // Başvuru Tercihleri 
        public int SubeId { get; set; }
        public int? SubeAlanId { get; set; }
        public int DepartmanId { get; set; }
        public int DepartmanPozisyonId { get; set; }
        public string? NedenBiz { get; set; } 

        // Dosya İşlemleri
        public IFormFile? VesikalikDosyasi { get; set; }

       
        public required KisiselBilgilerDto KisiselBilgiler { get; set; }
        public required DigerKisiselBilgilerCreateDto DigerKisiselBilgiler { get; set; }

        //Listeler (Null Reference hatası almamak için başlatıyoruz) 
        public ICollection<EgitimBilgisiCreateDto> EgitimBilgileri { get; set; } = new List<EgitimBilgisiCreateDto>();
        public ICollection<IsDeneyimiCreateDto> IsDeneyimleri { get; set; } = new List<IsDeneyimiCreateDto>();
        public ICollection<YabanciDilBilgisiCreateDto> YabanciDilBilgileri { get; set; } = new List<YabanciDilBilgisiCreateDto>();
        public ICollection<BilgisayarBilgisiCreateDto> BilgisayarBilgileri { get; set; } = new List<BilgisayarBilgisiCreateDto>();
        public ICollection<SertifikaBilgisiCreateDto> SertifikaBilgileri { get; set; } = new List<SertifikaBilgisiCreateDto>();
        public ICollection<ReferansBilgisiCreateDto> ReferansBilgileri { get; set; } = new List<ReferansBilgisiCreateDto>();
        public ICollection<PersonelEhliyetCreateDto> PersonelEhliyetler { get; set; } = new List<PersonelEhliyetCreateDto>();
    }
}