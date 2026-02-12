using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PanelKullaniciController : BaseController
    {
        private readonly IPanelKullaniciService _service;

        public PanelKullaniciController(IPanelKullaniciService service)
        {
            _service = service;
        }

        // 1. LİSTELEME
        [HttpGet("getall")]      
        [Authorize(Roles = "SuperAdmin, Admin")]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return CreateActionResultInstance(response);
        }

        // 2. DETAY GETİRME
        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin, Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _service.GetByIdAsync(id);
            return CreateActionResultInstance(response);
        }

        // 3. EKLEME
        [HttpPost("create")]
        //[Authorize(Roles = "SuperAdmin, Admin")]
        [AllowAnonymous]
        public async Task<IActionResult> Create(PanelKullaniciCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        // 4. GÜNCELLEME
        [HttpPut("update")]
        [Authorize(Roles = "SuperAdmin, Admin")]
        public async Task<IActionResult> Update(PanelKullaniciUpdateDto dto)
        {
            var response = await _service.UpdateAsync(dto);
            return CreateActionResultInstance(response);
        }

        // 5. SİLME
        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _service.DeleteAsync(id);
            return CreateActionResultInstance(response);
        }
    }
}