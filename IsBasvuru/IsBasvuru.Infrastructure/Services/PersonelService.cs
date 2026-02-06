using AutoMapper;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.KisiselBilgilerListDtos;
using IsBasvuru.Domain.DTOs.PersonelDtos;
using IsBasvuru.Domain.DTOs.Shared;
using IsBasvuru.Domain.Entities;
using IsBasvuru.Domain.Entities.PersonelBilgileri;
using IsBasvuru.Domain.Entities.SirketYapisi;
using IsBasvuru.Domain.Enums;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class PersonelService : IPersonelService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly ILogService _logService;

        public PersonelService(IsBasvuruContext context, IMapper mapper, ILogService logService)
        {
            _context = context;
            _mapper = mapper;
            _logService = logService;
        }

        public async Task<PagedResponse<List<PersonelListDto>>> GetAllAsync(PaginationFilter filter)
        {
            var validFilter = new PaginationFilter(filter.PageNumber, filter.PageSize);
            var totalRecords = await _context.Personeller.CountAsync();

            var list = await _context.Personeller
                .Include(p => p.KisiselBilgiler)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruSubeler).ThenInclude(s => s.Sube)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruDepartmanlar).ThenInclude(dp => dp.Departman)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar).ThenInclude(pz => pz.DepartmanPozisyon)
                .OrderByDescending(x => x.GuncellemeTarihi)
                .Skip((validFilter.PageNumber - 1) * validFilter.PageSize)
                .Take(validFilter.PageSize)
                .AsNoTracking()
                .ToListAsync();

            var mappedData = _mapper.Map<List<PersonelListDto>>(list);
            return new PagedResponse<List<PersonelListDto>>(mappedData, validFilter.PageNumber, validFilter.PageSize, totalRecords);
        }

        public async Task<ServiceResponse<PersonelListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.Personeller
                .Include(p => p.KisiselBilgiler!).ThenInclude(k => k.Uyruk)
                .Include(p => p.KisiselBilgiler!).ThenInclude(k => k.DogumUlke)
                .Include(p => p.KisiselBilgiler!).ThenInclude(k => k.DogumSehir)
                .Include(p => p.IsBasvuruDetay)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return ServiceResponse<PersonelListDto>.FailureResult("Personel bulunamadı.");

            var mapped = _mapper.Map<PersonelListDto>(entity);
            return ServiceResponse<PersonelListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<PersonelListDto>> CreateAsync(PersonelCreateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. PERSONEL NESNESİNİ HAZIRLA
                var personel = new Personel
                {
                    GuncellemeTarihi = DateTime.Now,
                    // Listeleri başlatıyoruz
                    EgitimBilgileri = new List<EgitimBilgisi>(),
                    SertifikaBilgileri = new List<SertifikaBilgisi>(),
                    BilgisayarBilgileri = new List<BilgisayarBilgisi>(),
                    YabanciDilBilgileri = new List<YabanciDilBilgisi>(),
                    IsDeneyimleri = new List<IsDeneyimi>(),
                    ReferansBilgileri = new List<ReferansBilgisi>(),
                    PersonelEhliyetler = new List<PersonelEhliyet>()
                    // BaseEntity alanları (AktifMi, SilindiMi) kaldırıldı, DB default değer atar veya BaseEntity'de yoktur.
                };

                // 2. KİŞİSEL BİLGİLER MAPLEME
                personel.KisiselBilgiler = _mapper.Map<KisiselBilgiler>(dto.KisiselBilgiler);

                if (dto.DigerKisiselBilgiler != null)
                {
                    personel.DigerKisiselBilgiler = _mapper.Map<DigerKisiselBilgiler>(dto.DigerKisiselBilgiler);
                }

                // 3. İŞ BAŞVURU DETAYLARI VE İLİŞKİLERİ
                // Context üzerinden değil, nesne üzerinden ekleme yapıyoruz (Graph Insert)
                var isBasvuruDetay = new IsBasvuruDetay
                {
                    // PersonelId henüz oluşmadığı için atamıyoruz, EF Core ilişkiyi navigasyon property üzerinden kuracak
                    NedenBiz = dto.NedenBiz,
                    LojmanTalebiVarMi = (SecimDurumu)dto.LojmanTalebi,

                    // Listeleri başlatıyoruz
                    BasvuruSubeler = new List<IsBasvuruDetaySube>(),
                    BasvuruAlanlar = new List<IsBasvuruDetayAlan>(),
                    BasvuruDepartmanlar = new List<IsBasvuruDetayDepartman>(),
                    BasvuruPozisyonlar = new List<IsBasvuruDetayPozisyon>(),
                    BasvuruProgramlar = new List<IsBasvuruDetayProgram>(),
                    BasvuruOyunlar = new List<IsBasvuruDetayOyun>()
                };

                // --- İlişkili Tabloları Nesneye Ekleme ---

                // Şubeler
                if (dto.SubeIds != null && dto.SubeIds.Count > 0)
                {
                    foreach (var subeId in dto.SubeIds)
                    {
                        isBasvuruDetay.BasvuruSubeler.Add(new IsBasvuruDetaySube { SubeId = subeId });
                    }
                }

                // Alanlar (SubeAlanId kullanıyoruz)
                if (dto.SubeAlanIds != null && dto.SubeAlanIds.Count > 0)
                {
                    foreach (var alanId in dto.SubeAlanIds)
                    {
                        isBasvuruDetay.BasvuruAlanlar.Add(new IsBasvuruDetayAlan { SubeAlanId = alanId });
                    }
                }

                // Departmanlar
                if (dto.DepartmanIds != null && dto.DepartmanIds.Count > 0)
                {
                    foreach (var deptId in dto.DepartmanIds)
                    {
                        isBasvuruDetay.BasvuruDepartmanlar.Add(new IsBasvuruDetayDepartman { DepartmanId = deptId });
                    }
                }

                // Pozisyonlar
                if (dto.DepartmanPozisyonIds != null && dto.DepartmanPozisyonIds.Count > 0)
                {
                    foreach (var pozId in dto.DepartmanPozisyonIds)
                    {
                        isBasvuruDetay.BasvuruPozisyonlar.Add(new IsBasvuruDetayPozisyon { DepartmanPozisyonId = pozId });
                    }
                }

                // Programlar
                if (dto.ProgramIds != null && dto.ProgramIds.Count > 0)
                {
                    foreach (var progId in dto.ProgramIds)
                    {
                        isBasvuruDetay.BasvuruProgramlar.Add(new IsBasvuruDetayProgram { ProgramBilgisiId = progId });
                    }
                }

                // Oyunlar
                if (dto.OyunIds != null && dto.OyunIds.Count > 0)
                {
                    foreach (var oyunId in dto.OyunIds)
                    {
                        isBasvuruDetay.BasvuruOyunlar.Add(new IsBasvuruDetayOyun { OyunBilgisiId = oyunId });
                    }
                }

                // Detayı Personele Bağla
                personel.IsBasvuruDetay = isBasvuruDetay;

                // Ehliyetler
                if (dto.PersonelEhliyetler != null && dto.PersonelEhliyetler.Count > 0)
                {
                    foreach (var item in dto.PersonelEhliyetler)
                    {
                        personel.PersonelEhliyetler.Add(new PersonelEhliyet { EhliyetTuruId = item.EhliyetTuruId });
                    }
                }

                // Eğitim Bilgileri
                if (dto.EgitimBilgileri != null && dto.EgitimBilgileri.Count > 0)
                {
                    foreach (var item in dto.EgitimBilgileri)
                    {
                        var egitim = _mapper.Map<EgitimBilgisi>(item);
                        personel.EgitimBilgileri.Add(egitim);
                    }
                }

                // İş Deneyimleri
                if (dto.IsDeneyimleri != null && dto.IsDeneyimleri.Count > 0)
                {
                    foreach (var item in dto.IsDeneyimleri)
                    {
                        var isDeneyimi = _mapper.Map<IsDeneyimi>(item);
                        personel.IsDeneyimleri.Add(isDeneyimi);
                    }
                }

                // Yabancı Diller
                if (dto.YabanciDilBilgileri != null && dto.YabanciDilBilgileri.Count > 0)
                {
                    foreach (var item in dto.YabanciDilBilgileri)
                    {
                        var dil = _mapper.Map<YabanciDilBilgisi>(item);
                        personel.YabanciDilBilgileri.Add(dil);
                    }
                }

                // Bilgisayar Bilgileri
                if (dto.BilgisayarBilgileri != null && dto.BilgisayarBilgileri.Count > 0)
                {
                    foreach (var item in dto.BilgisayarBilgileri)
                    {
                        var pc = _mapper.Map<BilgisayarBilgisi>(item);
                        personel.BilgisayarBilgileri.Add(pc);
                    }
                }

                // Sertifikalar
                if (dto.SertifikaBilgileri != null && dto.SertifikaBilgileri.Count > 0)
                {
                    foreach (var item in dto.SertifikaBilgileri)
                    {
                        var sertifika = _mapper.Map<SertifikaBilgisi>(item);
                        personel.SertifikaBilgileri.Add(sertifika);
                    }
                }

                // Referanslar
                if (dto.ReferansBilgileri != null && dto.ReferansBilgileri.Count > 0)
                {
                    foreach (var item in dto.ReferansBilgileri)
                    {
                        var refBilgi = _mapper.Map<ReferansBilgisi>(item);
                        personel.ReferansBilgileri.Add(refBilgi);
                    }
                }

                await _context.Personeller.AddAsync(personel);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Loglama
                try
                {
                    var adSoyad = personel.KisiselBilgiler != null
                        ? $"{personel.KisiselBilgiler.Ad} {personel.KisiselBilgiler.Soyadi}"
                        : "Bilinmeyen Personel";

                    await _logService.LogBasvuruIslemAsync(
                        personel.Id,
                        null,
                        LogIslemTipi.YeniBasvuru,
                        $"Yeni başvuru alındı: {adSoyad}"
                    );
                }
                catch { }

                var mapped = _mapper.Map<PersonelListDto>(personel);
                return ServiceResponse<PersonelListDto>.SuccessResult(mapped, "Personel kaydı başarıyla oluşturuldu.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ServiceResponse<PersonelListDto>.FailureResult($"Kayıt oluşturulurken hata: {ex.Message} {ex.InnerException?.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(PersonelUpdateDto dto)
        {
            var personel = await _context.Personeller
                .Include(p => p.KisiselBilgiler)
                .Include(p => p.DigerKisiselBilgiler)
                .Include(p => p.IsBasvuruDetay)
                .FirstOrDefaultAsync(x => x.Id == dto.Id);

            if (personel == null)
                return ServiceResponse<bool>.FailureResult("Personel bulunamadı.");

            if (personel.KisiselBilgiler != null)
            {
                if (dto.KisiselBilgiler.Email != personel.KisiselBilgiler.Email)
                {
                    bool emailVarMi = await _context.KisiselBilgileri
                        .AnyAsync(x => x.Email == dto.KisiselBilgiler.Email && x.PersonelId != dto.Id);

                    if (emailVarMi)
                        return ServiceResponse<bool>.FailureResult("Bu e-posta adresi kullanımda.");
                }
            }

            // Ana map işlemleri
            _mapper.Map(dto, personel);

            if (personel.KisiselBilgiler != null)
            {
                _mapper.Map(dto.KisiselBilgiler, personel.KisiselBilgiler);
            }

            if (personel.DigerKisiselBilgiler != null)
            {
                _mapper.Map(dto.DigerKisiselBilgiler, personel.DigerKisiselBilgiler);
            }

            // IsBasvuruDetay güncelleme (Basit alanlar)
            if (personel.IsBasvuruDetay != null)
            {
                personel.IsBasvuruDetay.NedenBiz = dto.NedenBiz;
                personel.IsBasvuruDetay.LojmanTalebiVarMi = (SecimDurumu)dto.LojmanTalebi;
            }

            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Güncellendi.");
        }

        public async Task<ServiceResponse<bool>> UpdateVesikalikAsync(int id, string dosyaAdi)
        {
            var personel = await _context.Personeller
                .Include(p => p.KisiselBilgiler)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (personel?.KisiselBilgiler == null)
                return ServiceResponse<bool>.FailureResult("Personel veya kişisel bilgiler bulunamadı.");

            personel.KisiselBilgiler.VesikalikFotograf = dosyaAdi;
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true, "Fotoğraf güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _context.Personeller.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Personel bulunamadı.");

            _context.Personeller.Remove(entity);
            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Silindi.");
        }

        public async Task<ServiceResponse<PersonelListDto>> GetByEmailAsync(string email)
        {
            var entity = await _context.Personeller
                .Include(p => p.KisiselBilgiler!).ThenInclude(k => k.Uyruk)
                .Include(p => p.EgitimBilgileri)
                .Include(p => p.IsDeneyimleri)
                .Include(p => p.IsBasvuruDetay)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.KisiselBilgiler!.Email == email);

            if (entity == null)
                return ServiceResponse<PersonelListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<PersonelListDto>(entity);
            return ServiceResponse<PersonelListDto>.SuccessResult(mapped);
        }
    }
}