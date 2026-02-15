using AutoMapper;
using IsBasvuru.Domain.DTOs.LogDtos.BasvuruLogDtos;
using IsBasvuru.Domain.DTOs.LogDtos.CvLogDtos;
using IsBasvuru.Domain.Entities.Log;
using IsBasvuru.Domain.Enums;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class LogService : ILogService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        public LogService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // OKUMA

        public async Task<ServiceResponse<List<BasvuruIslemLogListDto>>> GetAllBasvuruLogsAsync()
        {
            var logs = await _context.BasvuruIslemLoglari
                .Include(x => x.PanelKullanici)
                    .ThenInclude(u => u.Rol) // İşlemi yapanın rolünü notları ayırmak için çektik
                .Include(x => x.MasterBasvuru)
                    .ThenInclude(m => m.Personel)
                        .ThenInclude(p => p.KisiselBilgiler) // Fotoğraf, Ad, Soyad
                .Include(x => x.MasterBasvuru)
                    .ThenInclude(m => m.Personel)
                        .ThenInclude(p => p.IsBasvuruDetay) // Kurumsal detaylara buradan giriyoruz
                            .ThenInclude(d => d.BasvuruSubeler).ThenInclude(s => s.Sube)
                .Include(x => x.MasterBasvuru)
                    .ThenInclude(m => m.Personel)
                        .ThenInclude(p => p.IsBasvuruDetay)
                            .ThenInclude(d => d.BasvuruAlanlar).ThenInclude(a => a.SubeAlan).ThenInclude(ma => ma.MasterAlan)
                .Include(x => x.MasterBasvuru)
                    .ThenInclude(m => m.Personel)
                        .ThenInclude(p => p.IsBasvuruDetay)
                            .ThenInclude(d => d.BasvuruDepartmanlar).ThenInclude(dep => dep.Departman).ThenInclude(md => md.MasterDepartman)
                .Include(x => x.MasterBasvuru)
                    .ThenInclude(m => m.Personel)
                        .ThenInclude(p => p.IsBasvuruDetay)
                            .ThenInclude(d => d.BasvuruPozisyonlar).ThenInclude(p => p.DepartmanPozisyon).ThenInclude(mp => mp.MasterPozisyon)
                .OrderByDescending(x => x.IslemTarihi)
                .ToListAsync();

            var mappedLogs = _mapper.Map<List<BasvuruIslemLogListDto>>(logs);
            return ServiceResponse<List<BasvuruIslemLogListDto>>.SuccessResult(mappedLogs);
        }
        // Belirli bir başvuruya ait logları getirir (Interface ismiyle eşitlendi)
        public async Task<ServiceResponse<List<BasvuruIslemLogListDto>>> GetBasvuruLogsAsync(int masterBasvuruId)
        {
            var logs = await _context.BasvuruIslemLoglari
                .Include(x => x.PanelKullanici)
                .Where(x => x.MasterBasvuruId == masterBasvuruId)
                .OrderByDescending(x => x.IslemTarihi)
                .ToListAsync();

            var mappedLogs = _mapper.Map<List<BasvuruIslemLogListDto>>(logs);
            return ServiceResponse<List<BasvuruIslemLogListDto>>.SuccessResult(mappedLogs);
        }

        public async Task<ServiceResponse<List<CvDegisiklikLogListDto>>> GetCvLogsAsync(int personelId)
        {
            var logs = await _context.CvDegisiklikLoglari
                .Where(x => x.PersonelId == personelId)
                .OrderByDescending(x => x.DegisiklikTarihi)
                .ToListAsync();

            var mappedLogs = _mapper.Map<List<CvDegisiklikLogListDto>>(logs);
            return ServiceResponse<List<CvDegisiklikLogListDto>>.SuccessResult(mappedLogs);
        }

        // YAZMA

        public async Task<ServiceResponse<bool>> LogBasvuruIslemAsync(int masterBasvuruId, int? panelKullaniciId, LogIslemTipi islemTipi, string islemAciklama)
        {
            var log = new BasvuruIslemLog
            {
                MasterBasvuruId = masterBasvuruId,
                PanelKullaniciId = panelKullaniciId,
                IslemTipi = islemTipi,
                IslemAciklama = islemAciklama,
                IslemTarihi = DateTime.Now
            };

            await _context.BasvuruIslemLoglari.AddAsync(log);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> LogCvDegisiklikAsync(int masterBasvuruId, int personelId, int degisenKayitId, string degisenTabloAdi, string degisenAlanAdi, string eskiDeger, string yeniDeger, LogIslemTipi degisiklikTipi)
        {
            // Değer değişmemişse loglama yapma
            if (eskiDeger == yeniDeger)
                return ServiceResponse<bool>.SuccessResult(true);

            var log = new CvDegisiklikLog
            {
                MasterBasvuruId = masterBasvuruId,
                PersonelId = personelId,
                DegisenKayitId = degisenKayitId,
                DegisenTabloAdi = degisenTabloAdi,
                DegisenAlanAdi = degisenAlanAdi,
                EskiDeger = eskiDeger ?? "",
                YeniDeger = yeniDeger ?? "",
                DegisiklikTipi = degisiklikTipi,
                DegisiklikTarihi = DateTime.Now
            };

            await _context.CvDegisiklikLoglari.AddAsync(log);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}