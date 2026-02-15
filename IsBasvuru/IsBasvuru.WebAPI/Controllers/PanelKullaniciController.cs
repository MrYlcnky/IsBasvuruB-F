using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Varsayılan olarak tüm işlemler yetki gerektirir
    public class PanelKullaniciController : BaseController
    {
        private readonly IPanelKullaniciService _service;

        public PanelKullaniciController(IPanelKullaniciService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return CreateActionResultInstance(response);
        }

        [HttpGet("GetById/{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (id <= 0) return BadRequest("Geçersiz Kullanıcı ID.");

            var response = await _service.GetByIdAsync(id);
            return CreateActionResultInstance(response);
        }

        [HttpPost("Create")]
        //[Authorize(Roles = "SuperAdmin,Admin")] // Yeni panel kullanıcısını sadece mevcut yöneticiler ekleyebilmeli
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] PanelKullaniciCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpPut("Update")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Update([FromBody] PanelKullaniciUpdateDto dto)
        {
            var response = await _service.UpdateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpDelete("Delete/{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")] 
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (id <= 0) return BadRequest("Geçersiz ID.");

            var response = await _service.DeleteAsync(id);
            return CreateActionResultInstance(response);
        }
    }
}