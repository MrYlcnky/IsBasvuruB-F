using FluentValidation;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.DepartmanPozisyonDtos;

namespace IsBasvuru.WebAPI.Validators.SirketYapisiValidators
{
    public class DepartmanPozisyonCreateValidator : AbstractValidator<DepartmanPozisyonCreateDto>
    {
        public DepartmanPozisyonCreateValidator()
        {
            // Bir pozisyon mutlaka bir departmana bağlı olmalıdır
            RuleFor(x => x.DepartmanId).GreaterThan(0).WithMessage("Bağlı olunacak departman seçilmelidir.");

            RuleFor(x => x.DepartmanPozisyonAdi)
                .NotEmpty().WithMessage("Pozisyon adı boş geçilemez.")
                .MaximumLength(100).WithMessage("Pozisyon adı en fazla 100 karakter olabilir.");
        }
    }

    public class DepartmanPozisyonUpdateValidator : AbstractValidator<DepartmanPozisyonUpdateDto>
    {
        public DepartmanPozisyonUpdateValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçersiz ID.");

            RuleFor(x => x.DepartmanId).GreaterThan(0).WithMessage("Bağlı olunacak departman seçilmelidir.");

            RuleFor(x => x.DepartmanPozisyonAdi)
                .NotEmpty().WithMessage("Pozisyon adı boş geçilemez.")
                .MaximumLength(100).WithMessage("Pozisyon adı en fazla 100 karakter olabilir.");
        }
    }
}