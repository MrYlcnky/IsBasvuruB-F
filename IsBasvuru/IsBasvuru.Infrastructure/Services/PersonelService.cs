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
    public class PersonelService(IsBasvuruContext context, IMapper mapper, ILogService logService) : IPersonelService
    {
        private readonly IsBasvuruContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ILogService _logService = logService;

        public async Task<PagedResponse<List<PersonelListDto>>> GetAllAsync(PaginationFilter filter)
        {
            var validFilter = new PaginationFilter(filter.PageNumber, filter.PageSize);
            var totalRecords = await _context.Personeller.CountAsync();

            // UYARI GİDERME: Zincirleme erişimlerdeki (ThenInclude) her nullable property'nin sonuna '!' eklendi.
            var list = await _context.Personeller
                .Include(p => p.KisiselBilgiler)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruSubeler!).ThenInclude(s => s.Sube!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruAlanlar!).ThenInclude(a => a.SubeAlan!).ThenInclude(sa => sa.Sube!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruAlanlar!).ThenInclude(a => a.SubeAlan!).ThenInclude(sa => sa.MasterAlan!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruDepartmanlar!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.MasterDepartman!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruDepartmanlar!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.SubeAlan!).ThenInclude(sa => sa.Sube!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruDepartmanlar!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.SubeAlan!).ThenInclude(sa => sa.MasterAlan!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(pz => pz.DepartmanPozisyon!).ThenInclude(dp => dp.MasterPozisyon!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(pz => pz.DepartmanPozisyon!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.MasterDepartman!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(pz => pz.DepartmanPozisyon!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.SubeAlan!).ThenInclude(sa => sa.Sube!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(pz => pz.DepartmanPozisyon!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.SubeAlan!).ThenInclude(sa => sa.MasterAlan!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruProgramlar!).ThenInclude(pr => pr.ProgramBilgisi!).ThenInclude(p => p.Departman!).ThenInclude(d => d.MasterDepartman!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruOyunlar!).ThenInclude(o => o.OyunBilgileri!).ThenInclude(o => o.Departman!).ThenInclude(d => d.MasterDepartman!)
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
                .Include(p => p.KisiselBilgiler!).ThenInclude(k => k.Uyruk!)
                .Include(p => p.KisiselBilgiler!).ThenInclude(k => k.DogumUlke!)
                .Include(p => p.KisiselBilgiler!).ThenInclude(k => k.DogumSehir!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruSubeler!).ThenInclude(s => s.Sube!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruAlanlar!).ThenInclude(a => a.SubeAlan!).ThenInclude(sa => sa.Sube!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruAlanlar!).ThenInclude(a => a.SubeAlan!).ThenInclude(sa => sa.MasterAlan!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruDepartmanlar!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.MasterDepartman!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruDepartmanlar!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.SubeAlan!).ThenInclude(sa => sa.Sube!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruDepartmanlar!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.SubeAlan!).ThenInclude(sa => sa.MasterAlan!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(pz => pz.DepartmanPozisyon!).ThenInclude(dp => dp.MasterPozisyon!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(pz => pz.DepartmanPozisyon!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.MasterDepartman!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(pz => pz.DepartmanPozisyon!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.SubeAlan!).ThenInclude(sa => sa.Sube!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(pz => pz.DepartmanPozisyon!).ThenInclude(dp => dp.Departman!).ThenInclude(d => d.SubeAlan!).ThenInclude(sa => sa.MasterAlan!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruProgramlar!).ThenInclude(pr => pr.ProgramBilgisi!).ThenInclude(p => p.Departman!).ThenInclude(d => d.MasterDepartman!)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruOyunlar!).ThenInclude(o => o.OyunBilgileri!).ThenInclude(o => o.Departman!).ThenInclude(d => d.MasterDepartman!)
                .Include(p => p.EgitimBilgileri)
                .Include(p => p.IsDeneyimleri)
                .Include(p => p.SertifikaBilgileri)
                .Include(p => p.YabanciDilBilgileri)
                .Include(p => p.BilgisayarBilgileri)
                .Include(p => p.ReferansBilgileri)
                .Include(p => p.PersonelEhliyetler)
                .Include(p => p.DigerKisiselBilgiler)
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
                var personel = new Personel
                {
                    GuncellemeTarihi = DateTime.Now,
                    KisiselBilgiler = _mapper.Map<KisiselBilgiler>(dto.KisiselBilgiler),
                    DigerKisiselBilgiler = dto.DigerKisiselBilgiler != null ? _mapper.Map<DigerKisiselBilgiler>(dto.DigerKisiselBilgiler) : null,

                    EgitimBilgileri = dto.EgitimBilgileri != null
                        ? dto.EgitimBilgileri.Select(e => _mapper.Map<EgitimBilgisi>(e)).ToList()
                        : [],

                    SertifikaBilgileri = dto.SertifikaBilgileri != null
                        ? dto.SertifikaBilgileri.Select(s => _mapper.Map<SertifikaBilgisi>(s)).ToList()
                        : [],

                    BilgisayarBilgileri = dto.BilgisayarBilgileri != null
                        ? dto.BilgisayarBilgileri.Select(b => _mapper.Map<BilgisayarBilgisi>(b)).ToList()
                        : [],

                    YabanciDilBilgileri = dto.YabanciDilBilgileri != null
                        ? dto.YabanciDilBilgileri.Select(y => _mapper.Map<YabanciDilBilgisi>(y)).ToList()
                        : [],

                    IsDeneyimleri = dto.IsDeneyimleri != null
                        ? dto.IsDeneyimleri.Select(i => _mapper.Map<IsDeneyimi>(i)).ToList()
                        : [],

                    ReferansBilgileri = dto.ReferansBilgileri != null
                        ? dto.ReferansBilgileri.Select(r => _mapper.Map<ReferansBilgisi>(r)).ToList()
                        : [],

                    PersonelEhliyetler = dto.PersonelEhliyetler != null
                        ? dto.PersonelEhliyetler.Select(e => new PersonelEhliyet { EhliyetTuruId = e.EhliyetTuruId }).ToList()
                        : []
                };

                var isBasvuruDetay = new IsBasvuruDetay
                {
                    NedenBiz = dto.NedenBiz,
                    LojmanTalebiVarMi = (SecimDurumu)dto.LojmanTalebi,

                    BasvuruSubeler = dto.SubeIds?.Select(id => new IsBasvuruDetaySube { SubeId = id }).ToList() ?? [],
                    BasvuruAlanlar = dto.SubeAlanIds?.Select(id => new IsBasvuruDetayAlan { SubeAlanId = id }).ToList() ?? [],
                    BasvuruDepartmanlar = dto.DepartmanIds?.Select(id => new IsBasvuruDetayDepartman { DepartmanId = id }).ToList() ?? [],
                    BasvuruPozisyonlar = dto.DepartmanPozisyonIds?.Select(id => new IsBasvuruDetayPozisyon { DepartmanPozisyonId = id }).ToList() ?? [],
                    BasvuruProgramlar = dto.ProgramIds?.Select(id => new IsBasvuruDetayProgram { ProgramBilgisiId = id }).ToList() ?? [],
                    BasvuruOyunlar = dto.OyunIds?.Select(id => new IsBasvuruDetayOyun { OyunBilgisiId = id }).ToList() ?? []
                };

                personel.IsBasvuruDetay = isBasvuruDetay;

                await _context.Personeller.AddAsync(personel);
                await _context.SaveChangesAsync();

                var masterBasvuru = new MasterBasvuru
                {
                    PersonelId = personel.Id,
                    BasvuruTarihi = DateTime.Now,
                    BasvuruDurum = BasvuruDurum.Bekleyen,
                    BasvuruOnayAsamasi = BasvuruOnayAsamasi.DepartmanMuduru,
                    BasvuruVersiyonNo = "v1.0"
                };
                await _context.MasterBasvurular.AddAsync(masterBasvuru);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                try
                {
                    var adSoyad = personel.KisiselBilgiler != null
                        ? $"{personel.KisiselBilgiler.Ad} {personel.KisiselBilgiler.Soyadi}"
                        : "Bilinmeyen Personel";

                    await _logService.LogBasvuruIslemAsync(
                        personel.Id,
                        null,
                        LogIslemTipi.YeniBasvuru,
                        $"Yeni başvuru alındı: {adSoyad} (v1.0)"
                    );
                }
                catch { }

                var mapped = _mapper.Map<PersonelListDto>(personel);
                return ServiceResponse<PersonelListDto>.SuccessResult(mapped, "Başvurunuz başarıyla alındı ve onay sürecine gönderildi.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ServiceResponse<PersonelListDto>.FailureResult($"Başvuru sırasında hata oluştu: {ex.Message} {ex.InnerException?.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(PersonelUpdateDto dto)
        {
            var personel = await _context.Personeller
                .Include(p => p.KisiselBilgiler)
                .Include(p => p.DigerKisiselBilgiler)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruSubeler)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruAlanlar)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruDepartmanlar)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruPozisyonlar)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruProgramlar)
                .Include(p => p.IsBasvuruDetay!).ThenInclude(d => d.BasvuruOyunlar)
                .FirstOrDefaultAsync(x => x.Id == dto.Id);

            if (personel == null)
                return ServiceResponse<bool>.FailureResult("Personel bulunamadı.");

            if (personel.KisiselBilgiler != null && dto.KisiselBilgiler != null)
            {
                if (dto.KisiselBilgiler.Email != personel.KisiselBilgiler.Email)
                {
                    bool emailVarMi = await _context.KisiselBilgileri
                        .AnyAsync(x => x.Email == dto.KisiselBilgiler.Email && x.PersonelId != dto.Id);

                    if (emailVarMi)
                        return ServiceResponse<bool>.FailureResult("Bu e-posta adresi kullanımda.");
                }
            }

            _mapper.Map(dto, personel);
            personel.GuncellemeTarihi = DateTime.Now;

            if (personel.KisiselBilgiler != null && dto.KisiselBilgiler != null)
                _mapper.Map(dto.KisiselBilgiler, personel.KisiselBilgiler);

            if (personel.DigerKisiselBilgiler != null && dto.DigerKisiselBilgiler != null)
                _mapper.Map(dto.DigerKisiselBilgiler, personel.DigerKisiselBilgiler);

            if (personel.IsBasvuruDetay == null)
            {
                personel.IsBasvuruDetay = new IsBasvuruDetay
                {
                    PersonelId = personel.Id,
                    NedenBiz = dto.NedenBiz,
                    LojmanTalebiVarMi = (SecimDurumu)dto.LojmanTalebi,
                    BasvuruSubeler = [],
                    BasvuruAlanlar = [],
                    BasvuruDepartmanlar = [],
                    BasvuruPozisyonlar = [],
                    BasvuruProgramlar = [],
                    BasvuruOyunlar = []
                };
            }
            else
            {
                personel.IsBasvuruDetay.NedenBiz = dto.NedenBiz;
                personel.IsBasvuruDetay.LojmanTalebiVarMi = (SecimDurumu)dto.LojmanTalebi;
            }

            var detay = personel.IsBasvuruDetay;

            detay.BasvuruSubeler ??= [];
            detay.BasvuruAlanlar ??= [];
            detay.BasvuruDepartmanlar ??= [];
            detay.BasvuruPozisyonlar ??= [];
            detay.BasvuruProgramlar ??= [];
            detay.BasvuruOyunlar ??= [];

            // A. Şubeler
            var subeIds = new HashSet<int>(dto.SubeIds ?? []);
            var subeToRemove = detay.BasvuruSubeler.Where(x => !subeIds.Contains(x.SubeId)).ToList();
            if (subeToRemove.Count > 0)
                foreach (var item in subeToRemove) detay.BasvuruSubeler.Remove(item);

            var existingSubeIds = detay.BasvuruSubeler.Select(x => x.SubeId).ToHashSet();
            foreach (var id in subeIds.Except(existingSubeIds))
                detay.BasvuruSubeler.Add(new IsBasvuruDetaySube { SubeId = id });

            // B. Alanlar
            var alanIds = new HashSet<int>(dto.SubeAlanIds ?? []);
            var alanToRemove = detay.BasvuruAlanlar.Where(x => !alanIds.Contains(x.SubeAlanId)).ToList();
            if (alanToRemove.Count > 0)
                foreach (var item in alanToRemove) detay.BasvuruAlanlar.Remove(item);

            var existingAlanIds = detay.BasvuruAlanlar.Select(x => x.SubeAlanId).ToHashSet();
            foreach (var id in alanIds.Except(existingAlanIds))
                detay.BasvuruAlanlar.Add(new IsBasvuruDetayAlan { SubeAlanId = id });

            // C. Departmanlar
            var deptIds = new HashSet<int>(dto.DepartmanIds ?? []);
            var deptToRemove = detay.BasvuruDepartmanlar.Where(x => !deptIds.Contains(x.DepartmanId)).ToList();
            if (deptToRemove.Count > 0)
                foreach (var item in deptToRemove) detay.BasvuruDepartmanlar.Remove(item);

            var existingDeptIds = detay.BasvuruDepartmanlar.Select(x => x.DepartmanId).ToHashSet();
            foreach (var id in deptIds.Except(existingDeptIds))
                detay.BasvuruDepartmanlar.Add(new IsBasvuruDetayDepartman { DepartmanId = id });

            // D. Pozisyonlar
            var pozIds = new HashSet<int>(dto.DepartmanPozisyonIds ?? []);
            var pozToRemove = detay.BasvuruPozisyonlar.Where(x => !pozIds.Contains(x.DepartmanPozisyonId)).ToList();
            if (pozToRemove.Count > 0)
                foreach (var item in pozToRemove) detay.BasvuruPozisyonlar.Remove(item);

            var existingPozIds = detay.BasvuruPozisyonlar.Select(x => x.DepartmanPozisyonId).ToHashSet();
            foreach (var id in pozIds.Except(existingPozIds))
                detay.BasvuruPozisyonlar.Add(new IsBasvuruDetayPozisyon { DepartmanPozisyonId = id });

            // E. Programlar
            var progIds = new HashSet<int>(dto.ProgramIds ?? []);
            var progToRemove = detay.BasvuruProgramlar.Where(x => !progIds.Contains(x.ProgramBilgisiId)).ToList();
            if (progToRemove.Count > 0)
                foreach (var item in progToRemove) detay.BasvuruProgramlar.Remove(item);

            var existingProgIds = detay.BasvuruProgramlar.Select(x => x.ProgramBilgisiId).ToHashSet();
            foreach (var id in progIds.Except(existingProgIds))
                detay.BasvuruProgramlar.Add(new IsBasvuruDetayProgram { ProgramBilgisiId = id });

            // F. Oyunlar
            var oyunIds = new HashSet<int>(dto.OyunIds ?? []);
            var oyunToRemove = detay.BasvuruOyunlar.Where(x => !oyunIds.Contains(x.OyunBilgisiId)).ToList();
            if (oyunToRemove.Count > 0)
                foreach (var item in oyunToRemove) detay.BasvuruOyunlar.Remove(item);

            var existingOyunIds = detay.BasvuruOyunlar.Select(x => x.OyunBilgisiId).ToHashSet();
            foreach (var id in oyunIds.Except(existingOyunIds))
                detay.BasvuruOyunlar.Add(new IsBasvuruDetayOyun { OyunBilgisiId = id });

            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Bilgiler güncellendi.");
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