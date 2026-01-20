using FluentValidation;
using IsBasvuru.Domain.DTOs.PersonelBilgileriDtos.KisiselBilgilerDtos;
using IsBasvuru.Domain.DTOs.PersonelDtos;

namespace IsBasvuru.WebAPI.Validators.PersonelValidators
{
    public class PersonelCreateValidator : AbstractValidator<PersonelCreateDto>
    {
        public PersonelCreateValidator()
        {
            // --- 1. Organizasyon ve Şirket Yapısı Kontrolleri ---

            RuleFor(x => x.SubeId)
                .GreaterThan(0).WithMessage("Şube seçimi zorunludur.");

            RuleFor(x => x.DepartmanId)
                .GreaterThan(0).WithMessage("Departman seçimi zorunludur.");

            RuleFor(x => x.DepartmanPozisyonId)
                .GreaterThan(0).WithMessage("Pozisyon seçimi zorunludur.");

            RuleFor(x => x.SubeAlanId)
                .GreaterThan(0).When(x => x.SubeAlanId.HasValue)
                .WithMessage("Geçersiz Alan seçimi.");

            // --- 2. Kişisel Bilgiler Validasyonu (Alt Validatör) ---

            RuleFor(x => x.KisiselBilgiler)
                .NotNull().WithMessage("Kişisel bilgiler eksik.")
                .SetValidator(new KisiselBilgilerValidator());

            RuleFor(x => x.DigerKisiselBilgiler)
                .NotNull().WithMessage("Diğer kişisel bilgiler eksik.")
                .SetValidator(new DigerKisiselBilgilerValidator());

            RuleForEach(x => x.EgitimBilgileri).SetValidator(new EgitimBilgisiValidator());
            RuleForEach(x => x.IsDeneyimleri).SetValidator(new IsDeneyimiValidator());
            RuleForEach(x => x.YabanciDilBilgileri).SetValidator(new YabanciDilBilgisiValidator());
            RuleForEach(x => x.SertifikaBilgileri).SetValidator(new SertifikaBilgisiValidator());
            RuleForEach(x => x.ReferansBilgileri).SetValidator(new ReferansBilgisiValidator());
            RuleForEach(x => x.BilgisayarBilgileri).SetValidator(new BilgisayarBilgisiValidator());


            // Foto
            RuleFor(x => x.VesikalikDosyasi)
                .NotNull().WithMessage("Lütfen bir vesikalık fotoğraf yükleyiniz.")
                .Must(x => x != null && x.Length > 0).WithMessage("Dosya içeriği boş olamaz.");


        }
    }
}