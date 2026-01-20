using IsBasvuru.Domain.Entities.Tanimlamalar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi
{
    public class SubeAlan:BaseEntity
    {
        public int SubeId { get; set; }
        public virtual Sube? Sube { get; set; }
        public required string SubeAlanAdi { get; set; }
        public bool SubeAlanAktifMi { get; set; }

        public virtual ICollection<Departman> Departmanlar { get; set; } = new List<Departman>();
    }
}
