using IsBasvuru.Domain.DTOs.TanimlamalarDtos.SehirDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class SehirController : BaseController // 1. BaseController'dan miras al
    {
        private readonly ISehirService _service;

        public SehirController(ISehirService service)
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

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _service.GetByIdAsync(id);
            return CreateActionResultInstance(response);
        }

        [HttpGet("ulke/{ulkeId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByUlkeId(int ulkeId)
        {
            var response = await _service.GetByUlkeIdAsync(ulkeId);
            return CreateActionResultInstance(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create(SehirCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpPut]
        public async Task<IActionResult> Update(SehirUpdateDto dto)
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