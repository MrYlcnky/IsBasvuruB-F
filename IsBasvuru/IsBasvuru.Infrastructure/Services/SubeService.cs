using AutoMapper;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.SubeDtos;
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
    public class SubeService : ISubeService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        private const string CacheKey = "sube_list";

        public SubeService(IsBasvuruContext context, IMapper mapper, IMemoryCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<ServiceResponse<List<SubeListDto>>> GetAllAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<SubeListDto>? cachedList) && cachedList is not null)
            {
                return ServiceResponse<List<SubeListDto>>.SuccessResult(cachedList);
            }

            var entityList = await _context.Subeler.ToListAsync();
            var mappedList = _mapper.Map<List<SubeListDto>>(entityList) ?? new List<SubeListDto>();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(CacheKey, mappedList, cacheOptions);

            return ServiceResponse<List<SubeListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<SubeListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.Subeler.FindAsync(id);
            if (entity == null)
                return ServiceResponse<SubeListDto>.FailureResult("Kayıt bulunamadı.");

            var mapped = _mapper.Map<SubeListDto>(entity);
            return ServiceResponse<SubeListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<SubeListDto>> CreateAsync(SubeCreateDto createDto)
        {
            bool varMi = await _context.Subeler.AnyAsync(x => x.SubeAdi == createDto.SubeAdi);
            if (varMi)
                return ServiceResponse<SubeListDto>.FailureResult($"'{createDto.SubeAdi}' isminde bir şube zaten var!");

            var yeniSube = _mapper.Map<Sube>(createDto);

            await _context.Subeler.AddAsync(yeniSube);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            var mapped = _mapper.Map<SubeListDto>(yeniSube);
            return ServiceResponse<SubeListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(SubeUpdateDto updateDto)
        {
            var mevcutSube = await _context.Subeler.FindAsync(updateDto.Id);
            if (mevcutSube == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            bool cakisma = await _context.Subeler
                .AnyAsync(x => x.SubeAdi == updateDto.SubeAdi && x.Id != updateDto.Id);

            if (cakisma)
                return ServiceResponse<bool>.FailureResult($"'{updateDto.SubeAdi}' isminde başka bir şube zaten var!");

            _mapper.Map(updateDto, mevcutSube);
            _context.Subeler.Update(mevcutSube);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            bool bagliAlanVarMi = await _context.SubeAlanlar.AnyAsync(x => x.SubeId == id);
            if (bagliAlanVarMi)
                return ServiceResponse<bool>.FailureResult("Bu şubeye bağlı alanlar var. Önce onları silmelisiniz.");

            var silinecek = await _context.Subeler.FindAsync(id);
            if (silinecek == null)
                return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.Subeler.Remove(silinecek);
            await _context.SaveChangesAsync();

            _cache.Remove(CacheKey);

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}