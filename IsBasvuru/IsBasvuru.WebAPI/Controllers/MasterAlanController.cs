using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterAlanDtos;
using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterSubeAlan;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize] // İstersen paneli sadece yetkililer görsün diye açabilirsin
    public class MasterAlanController : BaseController
    {
        private readonly IMasterAlanService _service;

        public MasterAlanController(IMasterAlanService service)
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous] // Dropdown doldurmak için herkese açık olabilir
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return CreateActionResultInstance(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create(MasterAlanCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpPut]
        public async Task<IActionResult> Update(MasterAlanUpdateDto dto)
        {
            var response = await _service.UpdateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _service.DeleteAsync(id);
            return CreateActionResultInstance(response);
        }
    }
}