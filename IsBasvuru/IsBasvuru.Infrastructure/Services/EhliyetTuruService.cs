using AutoMapper;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.EhliyetTuruDtos;
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
    public class EhliyetTuruService : IEhliyetTuruService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;


        private const string CacheKey = "ehliyet_turu_list";

        public EhliyetTuruService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ServiceResponse<List<EhliyetTuruListDto>>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<EhliyetTuruListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<EhliyetTuruListDto>>.SuccessResult(cachedList);
            }

            var list = await _context.EhliyetTurleri.ToListAsync();
            var mappedList = _mapper.Map<List<EhliyetTuruListDto>>(list) ?? new List<EhliyetTuruListDto>();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<EhliyetTuruListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<EhliyetTuruListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.EhliyetTurleri.FindAsync(id);
            if (entity == null)
                return ServiceResponse<EhliyetTuruListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<EhliyetTuruListDto>(entity);
            return ServiceResponse<EhliyetTuruListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<EhliyetTuruListDto>> CreateAsync(EhliyetTuruCreateDto dto)
        {
            // İsim Kontrolü
            if (await _context.EhliyetTurleri.AnyAsync(x => x.EhliyetTuruAdi == dto.EhliyetTuruAdi))
                return ServiceResponse<EhliyetTuruListDto>.FailureResult($"'{dto.EhliyetTuruAdi}' isimli ehliyet türü zaten kayıtlı.");

            var entity = _mapper.Map<EhliyetTuru>(dto);
            await _context.EhliyetTurleri.AddAsync(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<EhliyetTuruListDto>(entity);
            return ServiceResponse<EhliyetTuruListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(EhliyetTuruUpdateDto dto)
        {
            var entity = await _context.EhliyetTurleri.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            // İsim Çakışma Kontrolü 
            bool cakisma = await _context.EhliyetTurleri
                .AnyAsync(x => x.EhliyetTuruAdi == dto.EhliyetTuruAdi && x.Id != dto.Id);

            if (cakisma)
                return ServiceResponse<bool>.FailureResult($"'{dto.EhliyetTuruAdi}' isimli başka bir ehliyet türü zaten var.");

            _mapper.Map(dto, entity);
            _context.EhliyetTurleri.Update(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {

            // Eğer herhangi bir personele bu ehliyet tanımlanmışsa silme engellenir.
            bool kullanimdaMi = await _context.PersonelEhliyetleri.AnyAsync(x => x.EhliyetTuruId == id);

            if (kullanimdaMi)
                return ServiceResponse<bool>.FailureResult("Bu ehliyet türü personel kayıtlarında kullanıldığı için silinemez.");

            var entity = await _context.EhliyetTurleri.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.EhliyetTurleri.Remove(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}