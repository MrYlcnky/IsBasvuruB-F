using IsBasvuru.Domain.Entities;
using IsBasvuru.Domain.Entities.AdminBilgileri;
using IsBasvuru.Domain.Entities.KimlikDogrulama;
using IsBasvuru.Domain.Entities.Log;
using IsBasvuru.Domain.Entities.PersonelBilgileri;
using IsBasvuru.Domain.Entities.SirketYapisi;
using IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi;
using IsBasvuru.Domain.Entities.Tanimlamalar;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Persistence.Context
{
    public class IsBasvuruContext:DbContext
    {
        public IsBasvuruContext(DbContextOptions<IsBasvuruContext> options):base(options) 
        { }

        // 1-Admin Bilgileri
        public DbSet<PanelKullanici> PanelKullanicilari { get; set; }
        public DbSet<Rol> Roller { get; set; }

        // 2-Log
        public DbSet<BasvuruIslemLog> BasvuruIslemLoglari { get; set; }
        public DbSet<CvDegisiklikLog> CvDegisiklikLoglari { get; set; }

        // 3-PersonelBilgileri
        public DbSet<BasvuruOnay> BasvuruOnaylari { get; set; }
        public DbSet<BilgisayarBilgisi> BilgisayarBilgileri { get; set; }
        public DbSet<DigerKisiselBilgiler> DigerKisiselBilgileri { get; set; }
        public DbSet<EgitimBilgisi> EgitimBilgileri { get; set; }
        public DbSet<IsBasvuruDetay> IsBasvuruDetaylari { get; set; }
        public DbSet<IsDeneyimi> IsDeneyimleri { get; set; }
        public DbSet<KisiselBilgiler> KisiselBilgileri { get; set; }
        public DbSet<ReferansBilgisi> ReferansBilgileri { get; set; }
        public DbSet<SertifikaBilgisi> SertifikaBilgileri { get; set; }
        public DbSet<YabanciDilBilgisi> YabanciDilBilgileri { get; set; }

        // 4.1-SirketYapisi
        public DbSet<IsBasvuruDetayAlan> IsBasvuruDetayAlanlari { get; set; }
        public DbSet<IsBasvuruDetayDepartman> IsBasvuruDetayDepartmanlari { get; set; }
        public DbSet<IsBasvuruDetayOyun> IsBasvuruDetayOyunlari { get; set; }
        public DbSet<IsBasvuruDetayPozisyon> IsBasvuruDetayPozisyonlari { get; set; }
        public DbSet<IsBasvuruDetayProgram> IsBasvuruDetayProgramlari { get; set; }
        public DbSet<IsBasvuruDetaySube> IsBasvuruDetaySubeler { get; set; }
        public DbSet<PersonelEhliyet> PersonelEhliyetleri { get; set; }


        // 4.2-SirketTanimYapisi
        public DbSet<Departman> Departmanlar { get; set; }
        public DbSet<DepartmanPozisyon> DepartmanPozisyonlar { get; set; }
        public DbSet<OyunBilgisi> OyunBilgileri { get; set; }
        public DbSet<ProgramBilgisi> ProgramBilgileri { get; set; }
        public DbSet<Sube> Subeler { get; set; }
        public DbSet<SubeAlan> SubeAlanlar { get; set; }

        // 5-Tanimlamalar
        public DbSet<Dil> Diller { get; set; }
        public DbSet<EhliyetTuru> EhliyetTurleri { get; set; }
        public DbSet<Ilce> Ilceler { get; set; }
        public DbSet<KktcBelge> KktcBelgeler { get; set; }
        public DbSet<Kvkk> Kvkklar { get; set; }
        public DbSet<Sehir> Sehirler { get; set; }
        public DbSet<Ulke> Ulkeler { get; set; }
        public DbSet<Uyruk> Uyruklar { get; set; }

        // 6-Entities
        public DbSet<MasterBasvuru> MasterBasvurular { get; set; }
        public DbSet<Personel> Personeller { get; set; }

        // 7- Kimlik Doğrulama
        public DbSet<DogrulamaKodu> DogrulamaKodlari { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Önce base metodunu çağırıyoruz
            base.OnModelCreating(modelBuilder);

            // --- 1. Kisisel Bilgiler ---
            modelBuilder.Entity<KisiselBilgiler>(entity =>
            {
                // Email kesinlikle benzersiz olsun (İletişim karışıklığını önlemek için)
                entity.HasIndex(e => e.Email).IsUnique();

                // Bir personelin sadece bir tane kişisel bilgi kaydı olabilir
                entity.HasIndex(e => e.PersonelId).IsUnique();
            });

            // --- 2. Admin Kullanıcıları ---
            modelBuilder.Entity<PanelKullanici>(entity =>
            {
                // Aynı kullanıcı adıyla ikinci bir admin oluşturulamaz
                entity.HasIndex(e => e.KullaniciAdi).IsUnique();
            });

            // --- 3. Şirket Yapısı ---
            modelBuilder.Entity<Sube>(entity =>
            {
                // Aynı isimde iki şube olmasın (Örn: İki tane "Girne" şubesi olmasın)
                entity.HasIndex(e => e.SubeAdi).IsUnique();
            });

            //4. 1-1 İlişki Güvenliği (Personel ID'si tekrar etmesin)
            // Bu tablolar Personel tablosuna göbekten bağlıdır, her personel için sadece 1 tane olabilirler.
            modelBuilder.Entity<MasterBasvuru>()
                .HasIndex(e => e.PersonelId).IsUnique();

            modelBuilder.Entity<IsBasvuruDetay>()
                .HasIndex(e => e.PersonelId).IsUnique();

            modelBuilder.Entity<BasvuruOnay>()
                .HasIndex(e => e.PersonelId).IsUnique();

            modelBuilder.Entity<DigerKisiselBilgiler>()
                .HasIndex(e => e.PersonelId).IsUnique();

            modelBuilder.Entity<IsBasvuruDetaySube>()
                .HasIndex(e => new { e.IsBasvuruDetayId, e.SubeId }).IsUnique();

            modelBuilder.Entity<IsBasvuruDetayAlan>()
                .HasIndex(e => new { e.IsBasvuruDetayId, e.SubeAlanId }).IsUnique();

            modelBuilder.Entity<IsBasvuruDetayDepartman>()
                .HasIndex(e => new { e.IsBasvuruDetayId, e.DepartmanId }).IsUnique();

            modelBuilder.Entity<IsBasvuruDetayPozisyon>()
                .HasIndex(e => new { e.IsBasvuruDetayId, e.DepartmanPozisyonId }).IsUnique();

            modelBuilder.Entity<IsBasvuruDetayProgram>()
                .HasIndex(e => new { e.IsBasvuruDetayId, e.ProgramBilgisiId }).IsUnique();

            modelBuilder.Entity<IsBasvuruDetayOyun>()
                .HasIndex(e => new { e.IsBasvuruDetayId, e.OyunBilgisiId }).IsUnique();

        }

    }


}
