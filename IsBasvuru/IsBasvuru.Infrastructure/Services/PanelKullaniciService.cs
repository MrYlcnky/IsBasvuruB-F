using AutoMapper;
using IsBasvuru.Domain.DTOs.AdminDtos;
using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.Entities.AdminBilgileri;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class PanelKullaniciService : IPanelKullaniciService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        // Login işlemi AuthService'e taşındığı için IConfiguration'ı buradan kaldırdık.
        public PanelKullaniciService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<PanelKullaniciListDto>> CreateAsync(PanelKullaniciCreateDto dto)
        {
            // Aynı kullanıcı adı var mı kontrolü
            var exist = await _context.PanelKullanicilari.AnyAsync(x => x.KullaniciAdi == dto.KullaniciAdi);
            if (exist)
                return ServiceResponse<PanelKullaniciListDto>.FailureResult("Bu kullanıcı adı zaten kullanılıyor.");

            var entity = _mapper.Map<PanelKullanici>(dto);

            // Yeni Yapı Kontrolü: AutoMapper, DTO'daki MasterDepartmanId'yi Entity'ye eşleyecektir.
            // Ancak manuel kontrol etmek istersen buraya bakabilirsin.
            // entity.MasterDepartmanId = dto.MasterDepartmanId; (AutoMapper yapıyorsa gerek yok)

            // Şifre Hashleme
            entity.KullaniciSifre = BCrypt.Net.BCrypt.HashPassword(dto.KullaniciSifre);
            entity.SonGirisTarihi = System.DateTime.Now; // İlk kayıt tarihi olarak atayabiliriz

            await _context.PanelKullanicilari.AddAsync(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<PanelKullaniciListDto>(entity);
            return ServiceResponse<PanelKullaniciListDto>.SuccessResult(responseDto);
        }

        public async Task<ServiceResponse<List<PanelKullaniciListDto>>> GetAllAsync()
        {
            var list = await _context.PanelKullanicilari
                .AsNoTracking()
                .Include(x => x.Rol)
                .Include(x => x.Sube)
                .Include(x => x.MasterDepartman) // Yeni Master Yapı
                .Include(x => x.MasterAlan)      // Yeni Master Yapı
                .OrderByDescending(x => x.Id)
                .ToListAsync();

            var map = _mapper.Map<List<PanelKullaniciListDto>>(list);
            return ServiceResponse<List<PanelKullaniciListDto>>.SuccessResult(map);
        }

        public async Task<ServiceResponse<PanelKullaniciListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.PanelKullanicilari
                .AsNoTracking()
                .Include(x => x.Rol)
                .Include(x => x.Sube)
                .Include(x => x.MasterDepartman) // Yeni Master Yapı
                .Include(x => x.MasterAlan)      // Yeni Master Yapı
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return ServiceResponse<PanelKullaniciListDto>.FailureResult("Kullanıcı bulunamadı.");

            var map = _mapper.Map<PanelKullaniciListDto>(entity);
            return ServiceResponse<PanelKullaniciListDto>.SuccessResult(map);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(PanelKullaniciUpdateDto dto)
        {
            var entity = await _context.PanelKullanicilari.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kullanıcı bulunamadı.");

            // Bilgileri Güncelle
            entity.Adi = dto.Adi;
            entity.Soyadi = dto.Soyadi;
            entity.KullaniciAdi = dto.KullaniciAdi;
            entity.RolId = dto.RolId;
            entity.SubeId = dto.SubeId;

            // Yeni Master alanların güncellenmesi
            entity.MasterAlanId = dto.MasterAlanId;
            entity.MasterDepartmanId = dto.MasterDepartmanId;

            // Şifre güncelleme isteği varsa
            if (!string.IsNullOrEmpty(dto.YeniKullaniciSifre))
            {
                entity.KullaniciSifre = BCrypt.Net.BCrypt.HashPassword(dto.YeniKullaniciSifre);
            }

            _context.PanelKullanicilari.Update(entity);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true, "Kullanıcı başarıyla güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _context.PanelKullanicilari.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kullanıcı bulunamadı.");

            _context.PanelKullanicilari.Remove(entity);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true, "Kullanıcı silindi.");
        }
    }
}