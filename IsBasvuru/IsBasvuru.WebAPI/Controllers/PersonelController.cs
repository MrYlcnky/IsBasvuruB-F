using IsBasvuru.Domain.DTOs.PersonelDtos;
using IsBasvuru.Domain.DTOs.Shared;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class PersonelController(IPersonelService service, IImageService imageService) : BaseController
{
    private readonly IPersonelService _service = service;
    private readonly IImageService _imageService = imageService;

    [HttpGet("GetAll")]
    [Authorize(Roles = "SuperAdmin,Admin,IkAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
    {
        var response = await _service.GetAllAsync(filter);
        return Ok(response);
    }

    [HttpGet("GetById/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var response = await _service.GetByIdAsync(id);
        return CreateActionResultInstance(response);
    }

    [HttpPost("Create")]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromForm] PersonelCreateDto dto)
    {
        if (dto.KisiselBilgiler != null) dto.KisiselBilgiler.VesikalikFotograf = "";

        var response = await _service.CreateAsync(dto);
        if (!response.Success || response.Data == null) return CreateActionResultInstance(response);

        var createdPersonel = response.Data;
        if (dto.VesikalikDosyasi != null && createdPersonel.KisiselBilgiler != null)
        {
            string ozelIsim = $"{createdPersonel.Id}_{createdPersonel.KisiselBilgiler.Ad}_{createdPersonel.KisiselBilgiler.Soyadi}";
            var uploadResponse = await _imageService.UploadImageAsync(dto.VesikalikDosyasi, "personel-fotograflari", ozelIsim);

            if (!uploadResponse.Success) return CreateActionResultInstance<string>(uploadResponse);

            await _service.UpdateVesikalikAsync(createdPersonel.Id, uploadResponse.Data ?? "");
            createdPersonel.KisiselBilgiler.VesikalikFotograf = uploadResponse.Data;
        }
        return CreateActionResultInstance(response);
    }

    [HttpPut("Update")]
    [AllowAnonymous]
    public async Task<IActionResult> Update([FromForm] PersonelUpdateDto dto)
    {
        var mevcutKayitResponse = await _service.GetByIdAsync(dto.Id);
        if (!mevcutKayitResponse.Success || mevcutKayitResponse.Data == null) return NotFound("Kayıt bulunamadı.");

        var mevcutKayit = mevcutKayitResponse.Data;

        if (dto.VesikalikDosyasi != null && mevcutKayit.KisiselBilgiler != null)
        {
            if (!string.IsNullOrEmpty(mevcutKayit.KisiselBilgiler.VesikalikFotograf))
                await _imageService.DeleteImageAsync(mevcutKayit.KisiselBilgiler.VesikalikFotograf, "personel-fotograflari");

            string ozelIsim = $"{dto.Id}_{dto.KisiselBilgiler?.Ad ?? mevcutKayit.KisiselBilgiler.Ad}_{dto.KisiselBilgiler?.Soyadi ?? mevcutKayit.KisiselBilgiler.Soyadi}";
            var uploadResponse = await _imageService.UploadImageAsync(dto.VesikalikDosyasi, "personel-fotograflari", ozelIsim);

            if (!uploadResponse.Success) return BadRequest(uploadResponse.Message);
            if (dto.KisiselBilgiler != null) dto.KisiselBilgiler.VesikalikFotograf = uploadResponse.Data;
        }
        else if (dto.KisiselBilgiler != null && mevcutKayit.KisiselBilgiler != null)
        {
            dto.KisiselBilgiler.VesikalikFotograf = mevcutKayit.KisiselBilgiler.VesikalikFotograf;
        }

        var response = await _service.UpdateAsync(dto);
        return CreateActionResultInstance(response);
    }

    [HttpDelete("Delete/{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var getResponse = await _service.GetByIdAsync(id);
        if (getResponse.Success && getResponse.Data?.KisiselBilgiler != null)
        {
            if (!string.IsNullOrEmpty(getResponse.Data.KisiselBilgiler.VesikalikFotograf))
                await _imageService.DeleteImageAsync(getResponse.Data.KisiselBilgiler.VesikalikFotograf, "personel-fotograflari");
        }

        var deleteResponse = await _service.DeleteAsync(id);
        return CreateActionResultInstance(deleteResponse);
    }

    [HttpGet("basvurumu-getir")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBasvurumuGetir([FromQuery] string email)
    {
        if (string.IsNullOrEmpty(email)) return BadRequest("E-posta parametresi zorunludur.");
        var response = await _service.GetByEmailAsync(email);
        return CreateActionResultInstance(response);
    }
}