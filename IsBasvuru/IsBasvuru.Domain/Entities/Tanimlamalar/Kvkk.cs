using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Entities.Tanimlamalar
{
    public class Kvkk:BaseEntity
    {
      
        public required string DogrulukAciklama { get; set; }
        public required string KvkkAciklama { get; set; }
        public required string ReferansAciklama { get; set; }
        public required string KvkkVersiyon { get; set; }
        public DateTime GuncellemeTarihi { get; set; } //Ekleme
    }
}
