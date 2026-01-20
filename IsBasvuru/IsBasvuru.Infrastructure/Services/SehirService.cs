using AutoMapper;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.SehirDtos;
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
    public class SehirService : ISehirService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        private const string CacheKey = "sehir_list";

        public SehirService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ServiceResponse<List<SehirListDto>>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<SehirListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<SehirListDto>>.SuccessResult(cachedList);
            }

            var list = await _context.Sehirler.Include(x => x.Ulke).ToListAsync();
            var mappedList = _mapper.Map<List<SehirListDto>>(list) ?? new List<SehirListDto>();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<SehirListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<SehirListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.Sehirler.Include(x => x.Ulke).FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
                return ServiceResponse<SehirListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<SehirListDto>(entity);
            return ServiceResponse<SehirListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<SehirListDto>> CreateAsync(SehirCreateDto createDto)
        {
            if (!await _context.Ulkeler.AnyAsync(x => x.Id == createDto.UlkeId))
                return ServiceResponse<SehirListDto>.FailureResult("Seçilen ülke bulunamadı.");

            // İsim çakışması
            if (await _context.Sehirler.AnyAsync(x => x.UlkeId == createDto.UlkeId && x.SehirAdi == createDto.SehirAdi))
                return ServiceResponse<SehirListDto>.FailureResult("Bu ülkede bu şehir zaten kayıtlı.");

            var entity = _mapper.Map<Sehir>(createDto);
            await _context.Sehirler.AddAsync(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<SehirListDto>(entity);
            return ServiceResponse<SehirListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(SehirUpdateDto updateDto)
        {
            var entity = await _context.Sehirler.FindAsync(updateDto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            if (entity.UlkeId != updateDto.UlkeId)
            {
                if (!await _context.Ulkeler.AnyAsync(x => x.Id == updateDto.UlkeId))
                    return ServiceResponse<bool>.FailureResult("Yeni seçilen ülke geçersiz.");
            }

            _mapper.Map(updateDto, entity);
            _context.Sehirler.Update(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            // İlçe var mı
            if (await _context.Ilceler.AnyAsync(x => x.SehirId == id))
                return ServiceResponse<bool>.FailureResult("Bu şehre bağlı ilçeler var.");

            var entity = await _context.Sehirler.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.Sehirler.Remove(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}