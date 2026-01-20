using IsBasvuru.Domain.Entities.Tanimlamalar;
using IsBasvuru.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Entities.PersonelBilgileri
{
    public class BasvuruOnay:BaseEntity
    {
        public int PersonelId { get; set; }
        public virtual Personel? Personel { get; set; }

        public int KvkkId { get; set; }
        public virtual Kvkk? Kvkk { get; set; }

        public BasvuruOnayAsamasi OnayDurum { get; set; }
        public required string IpAdres { get; set; }
        public required string KullaniciCihaz { get; set; }
    }
}
