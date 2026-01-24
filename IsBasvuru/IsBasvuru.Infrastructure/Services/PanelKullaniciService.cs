using AutoMapper;
using IsBasvuru.Domain.DTOs.AdminDtos;
using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.Entities.AdminBilgileri;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Infrastructure.Tools;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class PanelKullaniciService : IPanelKullaniciService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public PanelKullaniciService(IsBasvuruContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<ServiceResponse<PanelKullaniciListDto>> CreateAsync(PanelKullaniciCreateDto dto)
        {
            var exist = await _context.PanelKullanicilari.AnyAsync(x => x.KullaniciAdi == dto.KullaniciAdi);
            if (exist)
                return ServiceResponse<PanelKullaniciListDto>.FailureResult("Bu kullanıcı adı zaten kullanılıyor.");

            var entity = _mapper.Map<PanelKullanici>(dto);

            // GÜVENLİK: Şifre Hashleme
            entity.KullaniciSifre = BCrypt.Net.BCrypt.HashPassword(dto.KullaniciSifre);

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
                .Include(x => x.Departman)  
                .Include(x => x.SubeAlan)
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
                .Include(x => x.Departman)
                .Include(x => x.SubeAlan)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return ServiceResponse<PanelKullaniciListDto>.FailureResult("Kullanıcı bulunamadı.");

            var map = _mapper.Map<PanelKullaniciListDto>(entity);
            return ServiceResponse<PanelKullaniciListDto>.SuccessResult(map);
        }

        public async Task<ServiceResponse<LoginResponseDto>> LoginAsync(AdminLoginDto dto)
        {
            var kullanici = await _context.PanelKullanicilari
                .Include(x => x.Rol)
                .FirstOrDefaultAsync(x => x.KullaniciAdi == dto.KullaniciAdi);

            if (kullanici == null)
                return ServiceResponse<LoginResponseDto>.FailureResult("Kullanıcı adı veya şifre hatalı.");

            // GÜVENLİK: Hash Kontrolü
            bool passwordValid = BCrypt.Net.BCrypt.Verify(dto.KullaniciSifre, kullanici.KullaniciSifre);

            if (!passwordValid)
            {
                return ServiceResponse<LoginResponseDto>.FailureResult("Kullanıcı adı veya şifre hatalı.");
            }

      
            var jwtHelper = new JwtHelper(_configuration);
            var token = jwtHelper.GenerateToken(kullanici);

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var durationValue = jwtSettings["DurationInMinutes"];
            if (string.IsNullOrWhiteSpace(durationValue))
            {
                throw new InvalidOperationException("JwtSettings:DurationInMinutes yapılandırması bulunamadı veya boş.");
            }

            if (!double.TryParse(durationValue, NumberStyles.Float, CultureInfo.InvariantCulture, out var durationInMinutes))
            {
                throw new InvalidOperationException("JwtSettings:DurationInMinutes geçerli bir sayı değil.");
            }

            var loginResponse = new LoginResponseDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddMinutes(durationInMinutes),
                UserInfo = _mapper.Map<PanelKullaniciListDto>(kullanici)
            };

            return ServiceResponse<LoginResponseDto>.SuccessResult(loginResponse);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(PanelKullaniciUpdateDto dto)
        {
            var entity = await _context.PanelKullanicilari.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kullanıcı bulunamadı.");

            entity.Adi = dto.Adi;
            entity.Soyadi = dto.Soyadi;
            entity.KullaniciAdi = dto.KullaniciAdi;
            entity.RolId = dto.RolId;
            entity.SubeId = dto.SubeId;
            entity.SubeAlanId = dto.SubeAlanId;
            entity.DepartmanId = dto.DepartmanId;

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