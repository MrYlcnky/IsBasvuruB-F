using FluentValidation;
using IsBasvuru.Domain.DTOs.TanimlamalarDtos.KvkkDtos;

namespace IsBasvuru.WebAPI.Validators.TanimlamalarValidators
{
    public class KvkkCreateValidator : AbstractValidator<KvkkCreateDto>
    {
        public KvkkCreateValidator()
        {
            RuleFor(x => x.KvkkVersiyon).NotEmpty().WithMessage("Versiyon bilgisi zorunludur.");
            RuleFor(x => x.KvkkAciklama).NotEmpty().WithMessage("KVKK açıklama metni zorunludur.");
            RuleFor(x => x.DogrulukAciklama).NotEmpty().WithMessage("Doğruluk beyanı metni zorunludur.");
            RuleFor(x => x.ReferansAciklama).NotEmpty().WithMessage("Referans açıklama metni zorunludur.");
        }
    }

    public class KvkkUpdateValidator : AbstractValidator<KvkkUpdateDto>
    {
        public KvkkUpdateValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçersiz ID.");
            RuleFor(x => x.KvkkVersiyon).NotEmpty().WithMessage("Versiyon bilgisi zorunludur.");
            RuleFor(x => x.KvkkAciklama).NotEmpty().WithMessage("KVKK açıklama metni zorunludur.");
            RuleFor(x => x.DogrulukAciklama).NotEmpty().WithMessage("Doğruluk beyanı metni zorunludur.");
            RuleFor(x => x.ReferansAciklama).NotEmpty().WithMessage("Referans açıklama metni zorunludur.");
        }
    }
}