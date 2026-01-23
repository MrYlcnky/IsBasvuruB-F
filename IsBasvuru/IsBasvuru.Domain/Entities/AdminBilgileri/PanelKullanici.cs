using IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Entities.AdminBilgileri
{
    public class PanelKullanici:BaseEntity
    {
        public int RolId { get; set; }
        public virtual Rol? Rol { get; set; }

        public int? SubeId { get; set; }
        public virtual Sube? Sube { get; set; }

        public int? SubeAlanId { get; set; }
        public virtual SubeAlan? SubeAlan { get; set; }

        public int? DepartmanId { get; set; }
        public virtual Departman? Departman { get; set; }

        public required string KullaniciAdi { get; set; }
        public required string Adi { get; set; }
        public required string Soyadi { get; set; }
        public required string KullaniciSifre { get; set; }

        public DateTime SonGirisTarihi { get; set; }

        //public bool AktifMi { get; set; }
    }
}
