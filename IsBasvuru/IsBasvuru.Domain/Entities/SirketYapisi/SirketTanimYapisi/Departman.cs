using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi
{
    public class Departman:BaseEntity
    {
        public int SubeAlanId { get; set; }
        public virtual SubeAlan? SubeAlan { get; set; }
        public required string DepartmanAdi { get; set; }
        public bool DepartmanAktifMi { get; set; }

        public virtual ICollection<DepartmanPozisyon> DepartmanPozisyonlar { get; set; } = new List<DepartmanPozisyon>();
    }
}