namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanDtos
{
    public class DepartmanListDto
    {
        public int Id { get; set; }
        public required string DepartmanAdi { get; set; }
        public bool DepartmanAktifMi { get; set; }

        // Zincirleme Bilgiler
        public int SubeAlanId { get; set; }
        public required string SubeAlanAdi { get; set; } 
        public required string SubeAdi { get; set; }    
    }
}