using AutoMapper;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.DilDtos;
using IsBasvuru.Domain.Entities.Tanimlamalar;
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
    public class DilService : IDilService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        private const string CacheKey = "dil_list";

        public DilService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ServiceResponse<List<DilListDto>>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<DilListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<DilListDto>>.SuccessResult(cachedList);
            }

            var list = await _context.Diller.ToListAsync();
            var mappedList = _mapper.Map<List<DilListDto>>(list) ?? new List<DilListDto>();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<DilListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<DilListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.Diller.FindAsync(id);
            if (entity == null)
                return ServiceResponse<DilListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<DilListDto>(entity);
            return ServiceResponse<DilListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<DilListDto>> CreateAsync(DilCreateDto dto)
        {
            // Aynı isimde dil var mı?
            if (await _context.Diller.AnyAsync(x => x.DilAdi == dto.DilAdi))
                return ServiceResponse<DilListDto>.FailureResult($"'{dto.DilAdi}' isimli dil zaten kayıtlı.");

            var entity = _mapper.Map<Dil>(dto);
            await _context.Diller.AddAsync(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<DilListDto>(entity);
            return ServiceResponse<DilListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(DilUpdateDto dto)
        {
            var entity = await _context.Diller.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            // İsim Çakışma Kontrolü
            bool cakisma = await _context.Diller
                .AnyAsync(x => x.DilAdi == dto.DilAdi && x.Id != dto.Id);

            if (cakisma)
                return ServiceResponse<bool>.FailureResult($"'{dto.DilAdi}' isimli başka bir dil zaten var.");

            _mapper.Map(dto, entity);
            _context.Diller.Update(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _context.Diller.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            // Bu dil herhangi bir personelin Yabancı Dil bilgisinde kullanılıyor mu?
            bool isUsed = await _context.YabanciDilBilgileri.AnyAsync(x => x.DilId == id);

            if (isUsed)
            {
                return ServiceResponse<bool>.FailureResult($"Bu dil ({entity.DilAdi}) şu anda kullanımda olduğu için silinemez. Önce ilgili personel kayıtlarını kaldırmalısınız.");
            }

            _context.Diller.Remove(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}