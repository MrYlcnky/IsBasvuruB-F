using AutoMapper;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.OyunBilgisiDtos;
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
    // Fix 1: Use Primary Constructor (C# 12)
    public class OyunBilgisiService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache) : IOyunBilgisiService
    {
        private readonly IsBasvuruContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly IMemoryCache _cache = cache;

        private const string CacheKey = "oyun_list";

        public async Task<ServiceResponse<List<OyunBilgisiListDto>>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<OyunBilgisiListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<OyunBilgisiListDto>>.SuccessResult(cachedList);
            }

            var list = await _context.OyunBilgileri
                .Include(x => x.Departman)
                .ThenInclude(x => x!.MasterDepartman!) // Nullable warning suppression added
                .AsNoTracking()
                .ToListAsync();

            // Fix 2: Simplified collection initialization (Collection Expression)
            var mappedList = _mapper.Map<List<OyunBilgisiListDto>>(list) ?? [];

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<OyunBilgisiListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<OyunBilgisiListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.OyunBilgileri.FindAsync(id);
            if (entity == null)
                return ServiceResponse<OyunBilgisiListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<OyunBilgisiListDto>(entity);
            return ServiceResponse<OyunBilgisiListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<OyunBilgisiListDto>> CreateAsync(OyunBilgisiCreateDto dto)
        {
            // Aynı isimde oyun var mı?
            if (await _context.OyunBilgileri.AnyAsync(x => x.OyunAdi == dto.OyunAdi))
                return ServiceResponse<OyunBilgisiListDto>.FailureResult($"'{dto.OyunAdi}' isimli oyun zaten kayıtlı.");

            var entity = _mapper.Map<OyunBilgisi>(dto);
            await _context.OyunBilgileri.AddAsync(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<OyunBilgisiListDto>(entity);
            return ServiceResponse<OyunBilgisiListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(OyunBilgisiUpdateDto dto)
        {
            var entity = await _context.OyunBilgileri.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            if (await _context.OyunBilgileri.AnyAsync(x => x.OyunAdi == dto.OyunAdi && x.Id != dto.Id))
                return ServiceResponse<bool>.FailureResult($"'{dto.OyunAdi}' isimli başka bir oyun zaten var.");

            _mapper.Map(dto, entity);
            _context.OyunBilgileri.Update(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            // IsBasvuruDetayOyunlari
            bool kullanimdaMi = await _context.IsBasvuruDetayOyunlari.AnyAsync(x => x.OyunBilgisiId == id);

            if (kullanimdaMi)
                return ServiceResponse<bool>.FailureResult("Bu oyun bilgisi personel başvurularında kullanıldığı için silinemez.");

            var entity = await _context.OyunBilgileri.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.OyunBilgileri.Remove(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}