namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.OyunBilgisiDtos
{
    public class OyunBilgisiUpdateDto
    {
        public int Id { get; set; }
        public required string OyunAdi { get; set; }
        public int DepartmanId { get; set; }
    }
}