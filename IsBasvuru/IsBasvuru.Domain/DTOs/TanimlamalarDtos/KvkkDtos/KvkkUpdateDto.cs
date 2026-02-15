namespace IsBasvuru.Domain.DTOs.TanimlamalarDtos.KvkkDtos
{
    public class KvkkUpdateDto
    {
        public int Id { get; set; }
        public required string DogrulukAciklama { get; set; }
        public required string KvkkAciklama { get; set; }
        public required string ReferansAciklama { get; set; }
    }
}