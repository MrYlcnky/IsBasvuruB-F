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
                    EgitimBilgileri = new List<EgitimBilgisi>(),
                    SertifikaBilgileri = new List<SertifikaBilgisi>(),
                    BilgisayarBilgileri = new List<BilgisayarBilgisi>(),
                    YabanciDilBilgileri = new List<YabanciDilBilgisi>(),
                    IsDeneyimleri = new List<IsDeneyimi>(),
                    ReferansBilgileri = new List<ReferansBilgisi>(),
                    PersonelEhliyetler = new List<PersonelEhliyet>()
                };

                personel.KisiselBilgiler = _mapper.Map<KisiselBilgiler>(dto.KisiselBilgiler);

                if (dto.DigerKisiselBilgiler != null)
                {
                    personel.DigerKisiselBilgiler = _mapper.Map<DigerKisiselBilgiler>(dto.DigerKisiselBilgiler);
                }

                // DTO'da gelen string null ise boş string'e çeviriyoruz
                string nedenBiz = dto.NedenBiz ?? string.Empty;

                var basvuruDetay = new IsBasvuruDetay
                {
                    NedenBiz = nedenBiz,
                    BasvuruSubeler = new List<IsBasvuruDetaySube> { new IsBasvuruDetaySube { SubeId = dto.SubeId } },
                    BasvuruDepartmanlar = new List<IsBasvuruDetayDepartman> { new IsBasvuruDetayDepartman { DepartmanId = dto.DepartmanId } },
                    BasvuruPozisyonlar = new List<IsBasvuruDetayPozisyon> { new IsBasvuruDetayPozisyon { DepartmanPozisyonId = dto.DepartmanPozisyonId } },
                    BasvuruAlanlar = new List<IsBasvuruDetayAlan>(),
                    BasvuruProgramlar = new List<IsBasvuruDetayProgram>(),
                    BasvuruOyunlar = new List<IsBasvuruDetayOyun>()
                };

                if (dto.SubeAlanId.HasValue)
                {
                    basvuruDetay.BasvuruAlanlar.Add(new IsBasvuruDetayAlan { SubeAlanId = dto.SubeAlanId.Value });
                }

                personel.IsBasvuruDetay = basvuruDetay;

                await _context.Personeller.AddAsync(personel);
                await _context.SaveChangesAsync();

                if (dto.EgitimBilgileri != null && dto.EgitimBilgileri.Any())
                {
                    foreach (var item in dto.EgitimBilgileri)
                    {
                        var egitim = _mapper.Map<EgitimBilgisi>(item);
                        egitim.PersonelId = personel.Id;
                        await _context.EgitimBilgileri.AddAsync(egitim);
                    }
                    await _context.SaveChangesAsync();
                }


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
                return ServiceResponse<PersonelListDto>.FailureResult($"Kayıt oluşturulurken hata: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(PersonelUpdateDto dto)
        {
            var personel = await _context.Personeller
                .Include(p => p.KisiselBilgiler)
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

            _mapper.Map(dto, personel);

            if (personel.KisiselBilgiler != null)
            {
                _mapper.Map(dto.KisiselBilgiler, personel.KisiselBilgiler);
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
                .FirstOrDefaultAsync(x => x.KisiselBilgiler!.Email == email);

            if (entity == null)
                return ServiceResponse<PersonelListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<PersonelListDto>(entity);
            return ServiceResponse<PersonelListDto>.SuccessResult(mapped);
        }
    }
}