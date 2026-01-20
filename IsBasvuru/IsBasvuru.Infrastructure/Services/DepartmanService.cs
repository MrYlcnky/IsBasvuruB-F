using AutoMapper;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanDtos;
using IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers; 
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class DepartmanService : IDepartmanService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;


        private const string CacheKey = "departman_list";

        public DepartmanService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ServiceResponse<List<DepartmanListDto>>> GetAllAsync()
        {
            // Cache kontrolü
            if (_cache.TryGetValue(CacheKey, out List<DepartmanListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<DepartmanListDto>>.SuccessResult(cachedList);
            }

            // Veritabanından çekme (Zincirleme: Departman -> SubeAlan -> Sube)
            var list = await _context.Departmanlar
                .Include(x => x.SubeAlan)
                    .ThenInclude(y => y!.Sube)
                .ToListAsync();

            var mappedList = _mapper.Map<List<DepartmanListDto>>(list) ?? new List<DepartmanListDto>();

            // Cache'e kaydetme 
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<DepartmanListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<DepartmanListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.Departmanlar
                .Include(x => x.SubeAlan)
                    .ThenInclude(y => y!.Sube)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return ServiceResponse<DepartmanListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<DepartmanListDto>(entity);
            return ServiceResponse<DepartmanListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<DepartmanListDto>> CreateAsync(DepartmanCreateDto createDto)
        {
            // 1. Alan Var mı?
            bool ofisVarMi = await _context.SubeAlanlar.AnyAsync(x => x.Id == createDto.SubeAlanId);
            if (!ofisVarMi)
                return ServiceResponse<DepartmanListDto>.FailureResult("Seçilen alan bulunamadı.");

            // 2. Aynı ofiste aynı departman ismi var mı?
            bool cakisma = await _context.Departmanlar
                .AnyAsync(x => x.SubeAlanId == createDto.SubeAlanId && x.DepartmanAdi == createDto.DepartmanAdi);

            if (cakisma)
                return ServiceResponse<DepartmanListDto>.FailureResult("Bu alanda bu isimde departman zaten var.");

            var entity = _mapper.Map<Departman>(createDto);
            await _context.Departmanlar.AddAsync(entity);
            await _context.SaveChangesAsync();


            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<DepartmanListDto>(entity);
            return ServiceResponse<DepartmanListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(DepartmanUpdateDto updateDto)
        {
            var mevcut = await _context.Departmanlar.FindAsync(updateDto.Id);
            if (mevcut == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            // alan değişiyorsa kontrol et
            if (mevcut.SubeAlanId != updateDto.SubeAlanId)
            {
                bool alanVarMi = await _context.SubeAlanlar.AnyAsync(x => x.Id == updateDto.SubeAlanId);
                if (!alanVarMi)
                    return ServiceResponse<bool>.FailureResult("Yeni seçilen ofis bulunamadı.");
            }

            _mapper.Map(updateDto, mevcut);
            _context.Departmanlar.Update(mevcut);
            await _context.SaveChangesAsync();


            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {

            // Eğer departmanda pozisyon varsa silinmemeli, çünkü personel pozisyona bağlıdır
            bool pozisyonVarMi = await _context.DepartmanPozisyonlar.AnyAsync(x => x.DepartmanId == id);
            if (pozisyonVarMi)
                return ServiceResponse<bool>.FailureResult("Bu departmana bağlı pozisyonlar var. Önce onları silmelisiniz.");

            var kayit = await _context.Departmanlar.FindAsync(id);
            if (kayit == null)
                return ServiceResponse<bool>.FailureResult("Silinecek kayıt bulunamadı.");

            _context.Departmanlar.Remove(kayit);
            await _context.SaveChangesAsync();


            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}