using System;
using IsBasvuru.Domain.Enums;

namespace IsBasvuru.Domain.DTOs.MasterBasvuruDtos
{
    public class MasterBasvuruListDto
    {
        public int Id { get; set; }
        public int PersonelId { get; set; }

        public DateTime BasvuruTarihi { get; set; }
        public required string BasvuruVersiyonNo { get; set; }

        // Enumlar ve String Karşılıkları
        public BasvuruDurum BasvuruDurum { get; set; }
        public required string BasvuruDurumAdi { get; set; }

        public BasvuruOnayAsamasi BasvuruOnayAsamasi { get; set; }
        public required string BasvuruOnayAsamasiAdi { get; set; }
    }
}