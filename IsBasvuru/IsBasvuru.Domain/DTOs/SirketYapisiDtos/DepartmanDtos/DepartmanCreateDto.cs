namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanDtos
{
    public class DepartmanCreateDto
    {
        public int SubeAlanId { get; set; } // Hangi ofise bağlı?
        public required string DepartmanAdi { get; set; }
        public bool DepartmanAktifMi { get; set; } = true;
    }
}