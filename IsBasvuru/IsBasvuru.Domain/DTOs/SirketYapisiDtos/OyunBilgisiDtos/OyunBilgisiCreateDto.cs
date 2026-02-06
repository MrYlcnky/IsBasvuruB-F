namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.OyunBilgisiDtos
{
    public class OyunBilgisiCreateDto
    {
        public int DepartmanId { get; set; }
        public required string OyunAdi { get; set; }
    }
}