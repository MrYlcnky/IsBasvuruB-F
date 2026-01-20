using System;

namespace IsBasvuru.Domain.DTOs.LogDtos.BasvuruLogDtos
{
    public class BasvuruIslemLogListDto
    {
        public int Id { get; set; }
        public int MasterBasvuruId { get; set; }

        
        public int PanelKullaniciId { get; set; }
        public required string PanelKullaniciAdSoyad { get; set; } 

        // Enum string karşılığı
        public required string IslemTipiAdi { get; set; }

        public required string IslemAciklama { get; set; }
        public DateTime IslemTarihi { get; set; }
    }
}