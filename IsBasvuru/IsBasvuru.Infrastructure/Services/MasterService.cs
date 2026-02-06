using AutoMapper;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterAlanDtos;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterDepartmanDtos;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterPozisyonDtos;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterSubeAlan;
using IsBasvuru.Domain.Entities.Tanimlamalar;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    // ==========================================
    // 1. MASTER ALAN SERVICE
    // ==========================================
    public class MasterAlanService : IMasterAlanService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        public MasterAlanService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<MasterAlanListDto>>> GetAllAsync()
        {
            var list = await _context.MasterAlanlar.AsNoTracking().ToListAsync();
            var mapped = _mapper.Map<List<MasterAlanListDto>>(list);
            return ServiceResponse<List<MasterAlanListDto>>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<MasterAlanListDto>> CreateAsync(MasterAlanCreateDto dto)
        {
            // Aynı isimde alan var mı?
            bool varMi = await _context.MasterAlanlar.AnyAsync(x => x.MasterAlanAdi == dto.MasterAlanAdi);
            if (varMi) return ServiceResponse<MasterAlanListDto>.FailureResult("Bu isimde bir alan zaten mevcut.");

            var entity = _mapper.Map<MasterAlan>(dto);
            await _context.MasterAlanlar.AddAsync(entity);
            await _context.SaveChangesAsync();

            var mapped = _mapper.Map<MasterAlanListDto>(entity);
            return ServiceResponse<MasterAlanListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(MasterAlanUpdateDto dto)
        {
            var entity = await _context.MasterAlanlar.FindAsync(dto.Id);
            if (entity == null) return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            // İsim çakışması (kendi ID'si hariç)
            bool cakisma = await _context.MasterAlanlar.AnyAsync(x => x.MasterAlanAdi == dto.MasterAlanAdi && x.Id != dto.Id);
            if (cakisma) return ServiceResponse<bool>.FailureResult("Bu isimde başka bir alan zaten var.");

            _mapper.Map(dto, entity);
            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            // Kullanılıyor mu?
            bool kullaniliyorMu = await _context.SubeAlanlar.AnyAsync(x => x.MasterAlanId == id);
            if (kullaniliyorMu) return ServiceResponse<bool>.FailureResult("Bu alan bir şubede kullanıldığı için silinemez.");

            var entity = await _context.MasterAlanlar.FindAsync(id);
            if (entity == null) return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.MasterAlanlar.Remove(entity);
            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true);
        }
    }

    // ==========================================
    // 2. MASTER DEPARTMAN SERVICE
    // ==========================================
    public class MasterDepartmanService : IMasterDepartmanService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        public MasterDepartmanService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<MasterDepartmanListDto>>> GetAllAsync()
        {
            var list = await _context.MasterDepartmanlar.AsNoTracking().ToListAsync();
            var mapped = _mapper.Map<List<MasterDepartmanListDto>>(list);
            return ServiceResponse<List<MasterDepartmanListDto>>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<MasterDepartmanListDto>> CreateAsync(MasterDepartmanCreateDto dto)
        {
            bool varMi = await _context.MasterDepartmanlar.AnyAsync(x => x.MasterDepartmanAdi == dto.MasterDepartmanAdi);
            if (varMi) return ServiceResponse<MasterDepartmanListDto>.FailureResult("Bu isimde bir departman zaten mevcut.");

            var entity = _mapper.Map<MasterDepartman>(dto);
            await _context.MasterDepartmanlar.AddAsync(entity);
            await _context.SaveChangesAsync();

            var mapped = _mapper.Map<MasterDepartmanListDto>(entity);
            return ServiceResponse<MasterDepartmanListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(MasterDepartmanUpdateDto dto)
        {
            var entity = await _context.MasterDepartmanlar.FindAsync(dto.Id);
            if (entity == null) return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            bool cakisma = await _context.MasterDepartmanlar.AnyAsync(x => x.MasterDepartmanAdi == dto.MasterDepartmanAdi && x.Id != dto.Id);
            if (cakisma) return ServiceResponse<bool>.FailureResult("Bu isimde başka bir departman zaten var.");

            _mapper.Map(dto, entity);
            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            bool kullaniliyorMu = await _context.Departmanlar.AnyAsync(x => x.MasterDepartmanId == id);
            if (kullaniliyorMu) return ServiceResponse<bool>.FailureResult("Bu departman kullanımda olduğu için silinemez.");

            var entity = await _context.MasterDepartmanlar.FindAsync(id);
            if (entity == null) return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.MasterDepartmanlar.Remove(entity);
            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true);
        }
    }

    // ==========================================
    // 3. MASTER POZİSYON SERVICE
    // ==========================================
    public class MasterPozisyonService : IMasterPozisyonService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        public MasterPozisyonService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<MasterPozisyonListDto>>> GetAllAsync()
        {
            var list = await _context.MasterPozisyonlar.AsNoTracking().ToListAsync();
            var mapped = _mapper.Map<List<MasterPozisyonListDto>>(list);
            return ServiceResponse<List<MasterPozisyonListDto>>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<MasterPozisyonListDto>> CreateAsync(MasterPozisyonCreateDto dto)
        {
            bool varMi = await _context.MasterPozisyonlar.AnyAsync(x => x.MasterPozisyonAdi == dto.MasterPozisyonAdi);
            if (varMi) return ServiceResponse<MasterPozisyonListDto>.FailureResult("Bu isimde bir pozisyon zaten mevcut.");

            var entity = _mapper.Map<MasterPozisyon>(dto);
            await _context.MasterPozisyonlar.AddAsync(entity);
            await _context.SaveChangesAsync();

            var mapped = _mapper.Map<MasterPozisyonListDto>(entity);
            return ServiceResponse<MasterPozisyonListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(MasterPozisyonUpdateDto dto)
        {
            var entity = await _context.MasterPozisyonlar.FindAsync(dto.Id);
            if (entity == null) return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            bool cakisma = await _context.MasterPozisyonlar.AnyAsync(x => x.MasterPozisyonAdi == dto.MasterPozisyonAdi && x.Id != dto.Id);
            if (cakisma) return ServiceResponse<bool>.FailureResult("Bu isimde başka bir pozisyon zaten var.");

            _mapper.Map(dto, entity);
            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            bool kullaniliyorMu = await _context.DepartmanPozisyonlar.AnyAsync(x => x.MasterPozisyonId == id);
            if (kullaniliyorMu) return ServiceResponse<bool>.FailureResult("Bu pozisyon kullanımda olduğu için silinemez.");

            var entity = await _context.MasterPozisyonlar.FindAsync(id);
            if (entity == null) return ServiceResponse<bool>.FailureResult("Kayıt bulunamadı.");

            _context.MasterPozisyonlar.Remove(entity);
            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}