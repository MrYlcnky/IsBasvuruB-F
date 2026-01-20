using AutoMapper;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.KvkkDtos;
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
    public class KvkkService : IKvkkService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        private const string CacheKey = "kvkk_list";

        public KvkkService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ServiceResponse<List<KvkkListDto>>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<KvkkListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<KvkkListDto>>.SuccessResult(cachedList);
            }

            var list = await _context.Kvkklar.ToListAsync();
            var mappedList = _mapper.Map<List<KvkkListDto>>(list) ?? new List<KvkkListDto>();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<KvkkListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<KvkkListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.Kvkklar.FindAsync(id);
            if (entity == null)
                return ServiceResponse<KvkkListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<KvkkListDto>(entity);
            return ServiceResponse<KvkkListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<KvkkListDto>> CreateAsync(KvkkCreateDto dto)
        {
            if (await _context.Kvkklar.AnyAsync(x => x.KvkkVersiyon == dto.KvkkVersiyon))
                return ServiceResponse<KvkkListDto>.FailureResult($"'{dto.KvkkVersiyon}' versiyon numarası zaten kullanılıyor.");

            var entity = _mapper.Map<Kvkk>(dto);
            entity.GuncellemeTarihi = DateTime.Now;

            await _context.Kvkklar.AddAsync(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<KvkkListDto>(entity);
            return ServiceResponse<KvkkListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(KvkkUpdateDto dto)
        {
            var entity = await _context.Kvkklar.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            if (await _context.Kvkklar.AnyAsync(x => x.KvkkVersiyon == dto.KvkkVersiyon && x.Id != dto.Id))
                return ServiceResponse<bool>.FailureResult($"'{dto.KvkkVersiyon}' versiyon numarası başka bir kayıtta kullanılıyor.");

            _mapper.Map(dto, entity);
            entity.GuncellemeTarihi = DateTime.Now;

            _context.Kvkklar.Update(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _context.Kvkklar.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.Kvkklar.Remove(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}