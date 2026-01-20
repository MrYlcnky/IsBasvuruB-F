using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogController : BaseController // 1. BaseController'dan miras al
    {
        private readonly ILogService _service;

        public LogController(ILogService service)
        {
            _service = service;
        }

        [HttpGet("basvuru-logs/{masterBasvuruId}")]
        public async Task<IActionResult> GetBasvuruLogs(int masterBasvuruId)
        {
            var response = await _service.GetBasvuruLogsAsync(masterBasvuruId);
            return CreateActionResultInstance(response);
        }

        [HttpGet("cv-logs/{personelId}")]
        public async Task<IActionResult> GetCvLogs(int personelId)
        {
            var response = await _service.GetCvLogsAsync(personelId);
            return CreateActionResultInstance(response);
        }
    }
}