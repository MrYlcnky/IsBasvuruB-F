using FluentValidation;
using IsBasvuru.Domain.DTOs.AdminDtos.RolDtos;

namespace IsBasvuru.WebAPI.Validators.AdminValidators
{
    public class RolCreateValidator : AbstractValidator<RolCreateDto>
    {
        public RolCreateValidator()
        {
            RuleFor(x => x.RolAdi).NotEmpty().WithMessage("Rol adı boş geçilemez.");
        }
    }

    public class RolUpdateValidator : AbstractValidator<RolUpdateDto>
    {
        public RolUpdateValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçersiz ID.");
            RuleFor(x => x.RolAdi).NotEmpty().WithMessage("Rol adı boş geçilemez.");
        }
    }
}