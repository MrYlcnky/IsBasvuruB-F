using FluentValidation;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanDtos;

namespace IsBasvuru.WebAPI.Validators.SirketYapisiValidators
{
    public class DepartmanCreateValidator : AbstractValidator<DepartmanCreateDto>
    {
        public DepartmanCreateValidator()
        {
            // Bir departman mutlaka bir Şube Alanına (Ofise) bağlı olmalıdır
            RuleFor(x => x.SubeAlanId).GreaterThan(0).WithMessage("Bağlı olunacak ofis/alan seçilmelidir.");

            RuleFor(x => x.DepartmanAdi)
                .NotEmpty().WithMessage("Departman adı boş geçilemez.")
                .MaximumLength(100).WithMessage("Departman adı en fazla 100 karakter olabilir.");
        }
    }

    public class DepartmanUpdateValidator : AbstractValidator<DepartmanUpdateDto>
    {
        public DepartmanUpdateValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçersiz ID.");

            // Güncellemede de bağlı olduğu alan geçerli olmalı
            RuleFor(x => x.SubeAlanId).GreaterThan(0).WithMessage("Bağlı olunacak ofis/alan seçilmelidir.");

            RuleFor(x => x.DepartmanAdi)
                .NotEmpty().WithMessage("Departman adı boş geçilemez.")
                .MaximumLength(100).WithMessage("Departman adı en fazla 100 karakter olabilir.");
        }
    }
}