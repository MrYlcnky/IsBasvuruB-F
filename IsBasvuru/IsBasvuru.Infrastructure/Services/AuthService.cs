using IsBasvuru.Domain.DTOs.AdminDtos;
using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;

namespace IsBasvuru.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IsBasvuruContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public AuthService(IsBasvuruContext context, IConfiguration configuration, IMapper mapper)
        {
            _context = context;
            _configuration = configuration;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<LoginResponseDto>> LoginAsync(AdminLoginDto dto)
        {
            // 1. Kullanıcıyı Bul (Rol Bilgisiyle Beraber)
            var kullanici = await _context.PanelKullanicilari
                .Include(x => x.Rol)
                .AsNoTracking() // Login sadece okuma işlemidir
                .FirstOrDefaultAsync(x => x.KullaniciAdi == dto.KullaniciAdi);

            // 2. Kullanıcı Yoksa Hata Dön
            if (kullanici == null)
                return ServiceResponse<LoginResponseDto>.FailureResult("Kullanıcı adı veya şifre hatalı.");

            // 3. Şifre Kontrolü (BCrypt)
            bool passwordValid = BCrypt.Net.BCrypt.Verify(dto.KullaniciSifre, kullanici.KullaniciSifre);
            if (!passwordValid)
                return ServiceResponse<LoginResponseDto>.FailureResult("Kullanıcı adı veya şifre hatalı.");

            // 4. Token Üret (Özel Claim'ler ile)
            var token = GenerateJwtToken(kullanici);

            // 5. Token Süresini Al (AppSettings'den)
            var durationStr = _configuration["JwtSettings:DurationInMinutes"];
            double duration = double.TryParse(durationStr, out var d) ? d : 60; // Varsayılan 60 dk

            // 6. Response Hazırla
            var response = new LoginResponseDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddMinutes(duration),
                UserInfo = _mapper.Map<PanelKullaniciListDto>(kullanici)
            };

            return ServiceResponse<LoginResponseDto>.SuccessResult(response, "Giriş başarılı.");
        }

        //  TOKEN OLUŞTURMA METODU
        private string GenerateJwtToken(IsBasvuru.Domain.Entities.AdminBilgileri.PanelKullanici user)
        {
            // A) Claim Listesi (Token'ın içine gömülen bilgiler)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.KullaniciAdi),
                new Claim(ClaimTypes.GivenName, $"{user.Adi} {user.Soyadi}"),
                
                //  Rol Bilgisi (Frontend ve Backend Authorization buna bakacak)
                new Claim(ClaimTypes.Role, user.Rol != null ? user.Rol.RolAdi : "User")
            };

            // B) Master Yapı Bilgilerini Token'a Ekle (Eğer varsa)
            if (user.MasterDepartmanId.HasValue)
            {
                claims.Add(new Claim("MasterDepartmanId", user.MasterDepartmanId.Value.ToString()));
            }

            if (user.MasterAlanId.HasValue)
            {
                claims.Add(new Claim("MasterAlanId", user.MasterAlanId.Value.ToString()));
            }

            if (user.SubeId.HasValue)
            {
                claims.Add(new Claim("SubeId", user.SubeId.Value.ToString()));
            }

            // C) Token İmzalama ve Oluşturma
            // 1. Önce değeri al
            var securityKey = _configuration["JwtSettings:Key"];

            // 2. Kontrol et: Eğer boşsa veya null ise hata fırlat
            if (string.IsNullOrEmpty(securityKey))
            {
                throw new InvalidOperationException("JwtSettings:Key yapılandırması appsettings.json dosyasında bulunamadı!");
            }

            // 3. Artık güvenle kullanabilirsin (securityKey'in dolu olduğuna eminiz)
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityKey));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiryDays = Convert.ToDouble(_configuration["JwtSettings:DurationInMinutes"]);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryDays),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}