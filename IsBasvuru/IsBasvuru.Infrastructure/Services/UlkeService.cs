using AutoMapper;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.UlkeDtos;
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
    public class UlkeService : IUlkeService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        private const string CacheKey = "ulke_list";

        public UlkeService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ServiceResponse<List<UlkeListDto>>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<UlkeListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<UlkeListDto>>.SuccessResult(cachedList);
            }

            var list = await _context.Ulkeler.ToListAsync();
            var mappedList = _mapper.Map<List<UlkeListDto>>(list) ?? new List<UlkeListDto>();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<UlkeListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<UlkeListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.Ulkeler.FindAsync(id);
            if (entity == null)
                return ServiceResponse<UlkeListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<UlkeListDto>(entity);
            return ServiceResponse<UlkeListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<UlkeListDto>> CreateAsync(UlkeCreateDto createDto)
        {
            if (await _context.Ulkeler.AnyAsync(x => x.UlkeAdi == createDto.UlkeAdi))
                return ServiceResponse<UlkeListDto>.FailureResult("Bu ülke zaten kayıtlı.");

            var entity = _mapper.Map<Ulke>(createDto);
            await _context.Ulkeler.AddAsync(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<UlkeListDto>(entity);
            return ServiceResponse<UlkeListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(UlkeUpdateDto updateDto)
        {
            var entity = await _context.Ulkeler.FindAsync(updateDto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            if (await _context.Ulkeler.AnyAsync(x => x.UlkeAdi == updateDto.UlkeAdi && x.Id != updateDto.Id))
                return ServiceResponse<bool>.FailureResult("Bu isimde başka bir ülke zaten var.");

            _mapper.Map(updateDto, entity);
            _context.Ulkeler.Update(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            if (await _context.Sehirler.AnyAsync(x => x.UlkeId == id))
                return ServiceResponse<bool>.FailureResult("Bu ülkeye bağlı şehirler var. Önce onları silmelisiniz.");

            if (await _context.Uyruklar.AnyAsync(x => x.UlkeId == id))
                return ServiceResponse<bool>.FailureResult("Bu ülkeye bağlı uyruk tanımları var.");

            var entity = await _context.Ulkeler.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.Ulkeler.Remove(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}