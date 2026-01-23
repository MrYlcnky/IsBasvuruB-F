using System;

namespace IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos
{
    public class PanelKullaniciListDto
    {
        public int Id { get; set; }

        public required string KullaniciAdi { get; set; }
        public required string Adi { get; set; }
        public required string Soyadi { get; set; }

        // İlişkili Veriler
        public required int RolId { get; set; }
        public required string RolAdi { get; set; } 

        public int? SubeId { get; set; }
        public string? SubeAdi { get; set; }

        public int? SubeAlanId { get; set; }
        public string? SubeAlanAdi { get; set; }

        public int? DepartmanId { get; set; }
        public  string? DepartmanAdi { get; set; } 

        public DateTime SonGirisTarihi { get; set; }

        
    }
}