using AutoMapper;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.ProgramBilgisiDtos;
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
    public class ProgramBilgisiService : IProgramBilgisiService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        private const string CacheKey = "program_list";

        public ProgramBilgisiService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ServiceResponse<List<ProgramBilgisiListDto>>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<ProgramBilgisiListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<ProgramBilgisiListDto>>.SuccessResult(cachedList);
            }

            var list = await _context.ProgramBilgileri
                .Include(x => x.Departman)
                .ThenInclude(x => x.MasterDepartman) 
                .AsNoTracking()
                .ToListAsync();

            var mappedList = _mapper.Map<List<ProgramBilgisiListDto>>(list) ?? new List<ProgramBilgisiListDto>();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<ProgramBilgisiListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<ProgramBilgisiListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.ProgramBilgileri
                .Include(x => x.Departman)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return ServiceResponse<ProgramBilgisiListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<ProgramBilgisiListDto>(entity);
            return ServiceResponse<ProgramBilgisiListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<ProgramBilgisiListDto>> CreateAsync(ProgramBilgisiCreateDto dto)
        {
            if (!await _context.Departmanlar.AnyAsync(x => x.Id == dto.DepartmanId))
                return ServiceResponse<ProgramBilgisiListDto>.FailureResult("Seçilen departman bulunamadı.");

            if (await _context.ProgramBilgileri.AnyAsync(x => x.DepartmanId == dto.DepartmanId && x.ProgramAdi == dto.ProgramAdi))
                return ServiceResponse<ProgramBilgisiListDto>.FailureResult("Bu departmanda bu program zaten kayıtlı.");

            var entity = _mapper.Map<ProgramBilgisi>(dto);
            await _context.ProgramBilgileri.AddAsync(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<ProgramBilgisiListDto>(entity);
            return ServiceResponse<ProgramBilgisiListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(ProgramBilgisiUpdateDto dto)
        {
            var entity = await _context.ProgramBilgileri.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            if (entity.DepartmanId != dto.DepartmanId)
            {
                if (!await _context.Departmanlar.AnyAsync(x => x.Id == dto.DepartmanId))
                    return ServiceResponse<bool>.FailureResult("Yeni seçilen departman geçersiz.");
            }

            bool cakisma = await _context.ProgramBilgileri.AnyAsync(x => x.DepartmanId == dto.DepartmanId && x.ProgramAdi == dto.ProgramAdi && x.Id != dto.Id);
            if (cakisma)
                return ServiceResponse<bool>.FailureResult("Bu departmanda bu isimde başka bir program var.");

            _mapper.Map(dto, entity);
            _context.ProgramBilgileri.Update(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            bool kullanimdaMi = await _context.IsBasvuruDetayProgramlari.AnyAsync(x => x.ProgramBilgisiId == id);

            if (kullanimdaMi)
                return ServiceResponse<bool>.FailureResult("Bu program bilgisi personel başvurularında kullanıldığı için silinemez.");

            var entity = await _context.ProgramBilgileri.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.ProgramBilgileri.Remove(entity);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}