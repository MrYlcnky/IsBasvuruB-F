namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanPozisyonDtos
{
    public class DepartmanPozisyonCreateDto
    {
        public int DepartmanId { get; set; }
        public required string DepartmanPozisyonAdi { get; set; }
        public bool DepartmanPozisyonAktifMi { get; set; } = true;
    }
}