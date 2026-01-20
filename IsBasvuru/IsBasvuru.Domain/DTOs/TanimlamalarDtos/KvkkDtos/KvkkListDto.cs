using System;

namespace IsBasvuru.Domain.DTOs.TanimlamalarDtos.KvkkDtos
{
    public class KvkkListDto
    {
        public int Id { get; set; }
        public required string DogrulukAciklama { get; set; }
        public required string KvkkAciklama { get; set; }
        public required string ReferansAciklama { get; set; }
        public required string KvkkVersiyon { get; set; }
        public DateTime GuncellemeTarihi { get; set; }
    }
}