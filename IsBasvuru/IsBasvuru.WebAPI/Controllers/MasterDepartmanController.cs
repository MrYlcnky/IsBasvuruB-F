using IsBasvuru.Domain.DTOs.SirketMasterYapisiDtos.MasterDepartmanDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterDepartmanController : BaseController
    {
        private readonly IMasterDepartmanService _service;

        public MasterDepartmanController(IMasterDepartmanService service)
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
        public async Task<IActionResult> Create(MasterDepartmanCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpPut]
        public async Task<IActionResult> Update(MasterDepartmanUpdateDto dto)
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