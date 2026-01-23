using IsBasvuru.Domain.DTOs.PersonelDtos;
using IsBasvuru.Domain.DTOs.Shared;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            if (dto.VesikalikDosyasi != null)
            {
                var mevcutKayitResponse = await _service.GetByIdAsync(dto.Id);

                if (mevcutKayitResponse.Success && mevcutKayitResponse.Data != null)
                {
                    var mevcutKayit = mevcutKayitResponse.Data;

                    if (mevcutKayit.KisiselBilgiler != null)
                    {
                        // Eski resmi sil
                        if (!string.IsNullOrEmpty(mevcutKayit.KisiselBilgiler.VesikalikFotograf))
                        {
                            await _imageService.DeleteImageAsync(mevcutKayit.KisiselBilgiler.VesikalikFotograf, "personel-fotograflari");
                        }

                        string ad = dto.KisiselBilgiler?.Ad ?? mevcutKayit.KisiselBilgiler.Ad;
                        string soyad = dto.KisiselBilgiler?.Soyadi ?? mevcutKayit.KisiselBilgiler.Soyadi;
                        string ozelIsim = $"{dto.Id}_{ad}_{soyad}";

                        // Upload işlemi
                        var uploadResponse = await _imageService.UploadImageAsync(
                            dto.VesikalikDosyasi,
                            "personel-fotograflari",
                            ozelIsim
                        );

                        if (!uploadResponse.Success)
                            return CreateActionResultInstance<string>(uploadResponse);

                        if (dto.KisiselBilgiler != null)
                        {
                            dto.KisiselBilgiler.VesikalikFotograf = uploadResponse.Data ?? string.Empty;
                        }
                    }
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