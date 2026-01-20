using AutoMapper;
using IsBasvuru.Domain.DTOs.MasterBasvuruDtos;
using IsBasvuru.Domain.Entities;
using IsBasvuru.Domain.Enums;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class MasterBasvuruService : IMasterBasvuruService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        public MasterBasvuruService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<MasterBasvuruListDto>>> GetAllAsync()
        {
            var list = await _context.MasterBasvurular.ToListAsync();
            var mappedList = _mapper.Map<List<MasterBasvuruListDto>>(list);
            return ServiceResponse<List<MasterBasvuruListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<MasterBasvuruListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.MasterBasvurular.FindAsync(id);
            if (entity == null)
                return ServiceResponse<MasterBasvuruListDto>.FailureResult("Başvuru kaydı bulunamadı.");

            var mapped = _mapper.Map<MasterBasvuruListDto>(entity);
            return ServiceResponse<MasterBasvuruListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<MasterBasvuruListDto>> GetByPersonelIdAsync(int personelId)
        {
            var entity = await _context.MasterBasvurular
                .FirstOrDefaultAsync(x => x.PersonelId == personelId);

            if (entity == null)
                return ServiceResponse<MasterBasvuruListDto>.FailureResult("Bu personele ait başvuru bulunamadı.");

            var mapped = _mapper.Map<MasterBasvuruListDto>(entity);
            return ServiceResponse<MasterBasvuruListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<MasterBasvuruListDto>> CreateAsync(MasterBasvuruCreateDto dto)
        {
            // Bu personelin zaten başvurusu var mı?
            var existingEntity = await _context.MasterBasvurular
                .FirstOrDefaultAsync(x => x.PersonelId == dto.PersonelId);

            if (existingEntity != null)
            {
                // ZATEN BAŞVURUSU VAR -> GÜNCELLE VE VERSİYON ATLAT

                // 1. Yeni verileri mevcut kaydın üzerine yaz
                _mapper.Map(dto, existingEntity);

                // 2. Versiyonu Yükselt (Örn: v1.0 -> v2.0)
                existingEntity.BasvuruVersiyonNo = VersiyonYukselt(existingEntity.BasvuruVersiyonNo);

                // 3. Tarihi ve Durumu Sıfırla (Yeniden onaya düşmeli)
                existingEntity.BasvuruTarihi = DateTime.Now;
                existingEntity.BasvuruDurum = BasvuruDurum.Bekleyen;
                existingEntity.BasvuruOnayAsamasi = BasvuruOnayAsamasi.DepartmanMuduru;

                // 4. Güncelle
                _context.MasterBasvurular.Update(existingEntity);
                await _context.SaveChangesAsync();

                var mapped = _mapper.Map<MasterBasvuruListDto>(existingEntity);
                return ServiceResponse<MasterBasvuruListDto>.SuccessResult(mapped, "Mevcut başvuru güncellendi ve onaya gönderildi.");
            }
            else
            {
                // İLK KEZ BAŞVURUYOR 

                var entity = _mapper.Map<MasterBasvuru>(dto);

                // Otomatik Değerler
                entity.BasvuruTarihi = DateTime.Now;
                entity.BasvuruVersiyonNo = "v1.0"; // Başlangıç versiyonu
                entity.BasvuruDurum = BasvuruDurum.Bekleyen;
                entity.BasvuruOnayAsamasi = BasvuruOnayAsamasi.DepartmanMuduru;

                await _context.MasterBasvurular.AddAsync(entity);
                await _context.SaveChangesAsync();

                var mapped = _mapper.Map<MasterBasvuruListDto>(entity);
                return ServiceResponse<MasterBasvuruListDto>.SuccessResult(mapped, "Başvuru başarıyla oluşturuldu.");
            }
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(MasterBasvuruUpdateDto dto)
        {
            var entity = await _context.MasterBasvurular.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Güncellenecek başvuru bulunamadı.");

            _mapper.Map(dto, entity);

            entity.BasvuruVersiyonNo = VersiyonYukselt(entity.BasvuruVersiyonNo);
            entity.BasvuruTarihi = DateTime.Now; // Son güncelleme tarihi

            // Önemli: İçerik değiştiği için onay süreci başa döner
            entity.BasvuruDurum = BasvuruDurum.Bekleyen;
            entity.BasvuruOnayAsamasi = BasvuruOnayAsamasi.DepartmanMuduru;

            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Başvuru güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _context.MasterBasvurular.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Silinecek kayıt bulunamadı.");

            _context.MasterBasvurular.Remove(entity);
            await _context.SaveChangesAsync();
            return ServiceResponse<bool>.SuccessResult(true, "Başvuru silindi.");
        }

        // YARDIMCI METOT (HELPER)
        private string VersiyonYukselt(string mevcutVersiyon)
        {
            if (string.IsNullOrEmpty(mevcutVersiyon)) return "v1.0";

            try
            {
                string sayiKismi = mevcutVersiyon.Replace("v", "").Replace(".0", "");
                int versiyon = int.Parse(sayiKismi);
                versiyon++; // 1 artır

                return $"v{versiyon}.0";
            }
            catch
            {
                // Eğer format bozuksa güvenli bir şekilde v2.0 döndür
                return "v2.0";
            }
        }
    }
}