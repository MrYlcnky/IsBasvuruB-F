using IsBasvuru.Domain.DTOs.MasterBasvuruDtos;
using IsBasvuru.Domain.Wrappers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Interfaces
{
    public interface IMasterBasvuruService
    {
        Task<ServiceResponse<List<MasterBasvuruListDto>>> GetAllAsync();
        Task<ServiceResponse<MasterBasvuruListDto>> GetByIdAsync(int id);
        Task<ServiceResponse<MasterBasvuruListDto>> GetByPersonelIdAsync(int personelId);
        Task<ServiceResponse<MasterBasvuruListDto>> CreateAsync(MasterBasvuruCreateDto dto);
        Task<ServiceResponse<bool>> UpdateAsync(MasterBasvuruUpdateDto dto);
        Task<ServiceResponse<bool>> DeleteAsync(int id);
    }
}