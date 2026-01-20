namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.ProgramBilgisiDtos
{
    public class ProgramBilgisiListDto
    {
        public int Id { get; set; }
        public required string ProgramAdi { get; set; }
        public int DepartmanId { get; set; }
        public required string DepartmanAdi { get; set; } // İlişki
    }
}