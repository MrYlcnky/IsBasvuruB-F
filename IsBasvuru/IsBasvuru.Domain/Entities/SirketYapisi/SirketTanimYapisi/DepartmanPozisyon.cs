using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi
{
    public class DepartmanPozisyon : BaseEntity
    {
        public int DepartmanId { get; set; }
        public virtual Departman? Departman { get; set; }
        public required string DepartmanPozisyonAdi { get; set; }
        public bool DepartmanPozisyonAktifMi { get; set; }

        
    }
}


