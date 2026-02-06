using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterPozisyonDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterPozisyonController : BaseController
    {
        private readonly IMasterPozisyonService _service;

        public MasterPozisyonController(IMasterPozisyonService service)
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return CreateActionResultInstance(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create(MasterPozisyonCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpPut]
        public async Task<IActionResult> Update(MasterPozisyonUpdateDto dto)
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