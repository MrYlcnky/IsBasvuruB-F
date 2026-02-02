using IsBasvuru.Domain.DTOs.PersonelDtos;
using IsBasvuru.Domain.DTOs.Shared;
using IsBasvuru.Domain.Entities;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers

{
    [Route("api/[controller]")]
    [ApiController]
    
    public class PersonelController(IPersonelService service, IImageService imageService) : BaseController
    {
        private readonly IPersonelService _service = service;
        private readonly IImageService _imageService = imageService;




        [HttpPost("test-personal")]
        [AllowAnonymous]
        public async Task<IActionResult> TestPersonal([FromForm] PersonelCreateDto dto)
        {
            if (dto == null)
                return BadRequest(new { ok = false, message = "DTO bind edilemedi (dto null)." });

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors?.Count > 0)
                    .ToDictionary(
                        k => k.Key,
                        v => v.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                return BadRequest(new
                {
                    ok = false,
                    message = "ModelState invalid. FormData key'leri DTO ile uyuşmuyor olabilir.",
                    errors
                });
            }

            if (dto.KisiselBilgiler == null)
                return BadRequest(new { ok = false, message = "KisiselBilgiler bind edilemedi." });

            // Create endpointindeki gibi
            dto.KisiselBilgiler.VesikalikFotograf = "";

            try
            {
                // ✅ Bu çağrı DB insert yapıyor mu? sorunun cevabı
                var createRes = await _service.CreateAsync(dto);

                if (createRes == null)
                    return StatusCode(500, new { ok = false, message = "Service response null." });

                if (!createRes.Success || createRes.Data == null)
                {
                    return Ok(new
                    {
                        ok = false,
                        message = "CreateAsync başarısız. DB insert olmamış olabilir.",
                        serviceMessage = createRes.Message,
                        serviceErrors = createRes.Errors
                    });
                }

                var createdId = createRes.Data.Id;
                var hasFile = dto.VesikalikDosyasi != null;

                // ✅ Test kaydını sil (DB’de kalmasın)
                var delRes = await _service.DeleteAsync(createdId);
                var deleted = delRes != null && delRes.Success;

                return Ok(new
                {
                    ok = true,
                    message = deleted
                        ? "✅ DB insert OK (kayıt oluştu) ve test için silindi."
                        : "✅ DB insert OK (kayıt oluştu) ama test kaydı silinemedi!",
                    createdId,
                    deleted,
                    hasFile,
                    bound = new
                    {
                        dto.KisiselBilgiler.Ad,
                        dto.KisiselBilgiler.Soyadi,
                        dto.KisiselBilgiler.Email,
                        dto.KisiselBilgiler.Telefon
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    ok = false,
                    message = "TestPersonal exception",
                    error = ex.Message,
                    detail = ex.InnerException?.Message
                });
            }
        }



        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
        {
            var response = await _service.GetAllAsync(filter);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _service.GetByIdAsync(id);
            return CreateActionResultInstance(response);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromForm] PersonelCreateDto dto)
        {
            // 1. DTO içindeki path'i temizle
            if (dto.KisiselBilgiler != null)
            {
                dto.KisiselBilgiler.VesikalikFotograf = "";
            }

            // Önce kaydı oluştur
            var response = await _service.CreateAsync(dto);

            // Başarısızsa veya Data null ise direkt dön
            if (!response.Success || response.Data == null)
                return CreateActionResultInstance(response);

            var createdPersonel = response.Data;

            // 2. Dosya yükleme işlemi
            if (dto.VesikalikDosyasi != null && createdPersonel.KisiselBilgiler != null)
            {
                string ozelIsim = $"{createdPersonel.Id}_{createdPersonel.KisiselBilgiler.Ad}_{createdPersonel.KisiselBilgiler.Soyadi}";

                var uploadResponse = await _imageService.UploadImageAsync(
                    dto.VesikalikDosyasi,
                    "personel-fotograflari",
                    ozelIsim
                );

                if (!uploadResponse.Success)
                {
                    return CreateActionResultInstance<string>(uploadResponse);
                }

                string kaydedilenDosyaAdi = uploadResponse.Data ?? string.Empty;

                // Veritabanını güncelle
                await _service.UpdateVesikalikAsync(createdPersonel.Id, kaydedilenDosyaAdi);

                // Response içindeki veriyi de güncelle
                createdPersonel.KisiselBilgiler.VesikalikFotograf = kaydedilenDosyaAdi;
            }

            return CreateActionResultInstance(response);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromForm] PersonelUpdateDto dto)
        {
            // Önce mevcut kaydı çekelim (Her durumda lazım olabilir)
            var mevcutKayitResponse = await _service.GetByIdAsync(dto.Id);
            if (!mevcutKayitResponse.Success || mevcutKayitResponse.Data == null)
            {
                return NotFound("Kayıt bulunamadı.");
            }
            var mevcutKayit = mevcutKayitResponse.Data;

            // --- YENİ DOSYA GELDİ Mİ? ---
            if (dto.VesikalikDosyasi != null)
            {
                if (mevcutKayit.KisiselBilgiler != null)
                {
                    // 1. ESKİ RESMİ SİL (Klasör ismine dikkat: "personel")
                    if (!string.IsNullOrEmpty(mevcutKayit.KisiselBilgiler.VesikalikFotograf))
                    {
                        // DİKKAT: Klasör adı Create işlemindekiyle AYNI olmalı
                        await _imageService.DeleteImageAsync(mevcutKayit.KisiselBilgiler.VesikalikFotograf, "personel");
                    }

                    string ad = dto.KisiselBilgiler?.Ad ?? mevcutKayit.KisiselBilgiler.Ad;
                    string soyad = dto.KisiselBilgiler?.Soyadi ?? mevcutKayit.KisiselBilgiler.Soyadi;
                    string ozelIsim = $"{dto.Id}_{ad}_{soyad}";

                    // 2. YENİ RESMİ YÜKLE
                    var uploadResponse = await _imageService.UploadImageAsync(
                        dto.VesikalikDosyasi,
                        "personel", // DİKKAT: Klasör adı "personel"
                        ozelIsim
                    );

                    if (!uploadResponse.Success)
                        return BadRequest(uploadResponse.Message); // Hata varsa dön

                    // DTO'ya yeni resim adını yaz
                    if (dto.KisiselBilgiler != null)
                    {
                        dto.KisiselBilgiler.VesikalikFotograf = uploadResponse.Data;
                    }
                }
            }
            // --- YENİ DOSYA YOKSA ---
            else
            {
                // 3. VERİ KORUMA: Eğer yeni resim gelmediyse, DTO'ya veritabanındaki eski resim adını geri yaz.
                // Böylece güncelleme sırasında resim alanı boşalmaz (null olmaz).
                if (dto.KisiselBilgiler != null && mevcutKayit.KisiselBilgiler != null)
                {
                    dto.KisiselBilgiler.VesikalikFotograf = mevcutKayit.KisiselBilgiler.VesikalikFotograf;
                }
            }

            var response = await _service.UpdateAsync(dto);
            return CreateActionResultInstance(response);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var getResponse = await _service.GetByIdAsync(id);

            if (getResponse.Success && getResponse.Data != null)
            {
                var data = getResponse.Data;
                if (data.KisiselBilgiler != null && !string.IsNullOrEmpty(data.KisiselBilgiler.VesikalikFotograf))
                {
                    await _imageService.DeleteImageAsync(data.KisiselBilgiler.VesikalikFotograf, "personel-fotograflari");
                }
            }

            var deleteResponse = await _service.DeleteAsync(id);
            return CreateActionResultInstance(deleteResponse);
        }

        [Authorize(Roles = "BasvuruYapan,Admin")]
        [HttpGet("basvurumu-getir")]
        public async Task<IActionResult> GetMyApplication()
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(userEmail))
            {
                return CreateActionResultInstance<PersonelListDto>(
                    ServiceResponse<PersonelListDto>.FailureResult("Geçersiz kimlik bilgisi (Token içinde e-posta bulunamadı).")
                );
            }

            var response = await _service.GetByEmailAsync(userEmail);
            return CreateActionResultInstance(response);
        }
    }
}