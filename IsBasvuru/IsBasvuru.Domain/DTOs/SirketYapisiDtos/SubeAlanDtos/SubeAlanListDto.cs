namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.SubeAlanDtos
{
    public class SubeAlanListDto
    {
        public int Id { get; set; }
        public required string SubeAlanAdi { get; set; } // Alan Adı Casion/Hotel
        public bool SubeAlanAktifMi { get; set; }

        // İlişkili Veri (Join ile gelecek)
        public int SubeId { get; set; }
        public required string SubeAdi { get; set; } // Örn: İstanbul Merkez
    }
}