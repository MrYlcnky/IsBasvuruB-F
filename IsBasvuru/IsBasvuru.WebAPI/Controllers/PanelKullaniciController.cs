using IsBasvuru.Domain.DTOs.AdminDtos;
using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PanelKullaniciController : BaseController // 1. BaseController'dan miras al
    {
        private readonly IPanelKullaniciService _service;

        public PanelKullaniciController(IPanelKullaniciService service)
        {
            _service = service;
        }

        // Login herkese açık olmalı (Authorize yok)
        [HttpPost("login")]
        public async Task<IActionResult> Login(AdminLoginDto dto)
        {
            var response = await _service.LoginAsync(dto);
            // BaseController, Success=false ise BadRequest döner, True ise Ok döner.
            return CreateActionResultInstance(response);
        }

        // Aşağıdaki metodlara sadece Token ile giriş yapmış kişiler erişebilir
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return CreateActionResultInstance(response);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _service.GetByIdAsync(id);
            return CreateActionResultInstance(response);
        }

        [Authorize(Roles = "Admin")] // Sadece Admin rolü olanlar ekleyebilsin 
        [HttpPost]
        public async Task<IActionResult> Create(PanelKullaniciCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> Update(PanelKullaniciUpdateDto dto)
        {
            var response = await _service.UpdateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _service.DeleteAsync(id);
            return CreateActionResultInstance(response);
        }
    }
}