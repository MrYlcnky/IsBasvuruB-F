using FluentValidation;
using FluentValidation.AspNetCore;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Infrastructure.Services;
using IsBasvuru.Persistence.Context;
using IsBasvuru.WebAPI.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Reflection;
using System.Text;

// 1. SERILOG BOOTSTRAP YAPILANDIRMASI 
var bootstrapConfiguration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
    .AddEnvironmentVariables()
    .Build();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(bootstrapConfiguration)
    .CreateLogger();

try
{
    Log.Information("Uygulama baþlatýlýyor...");

    var builder = WebApplication.CreateBuilder(args);

    // 2. SERILOG'U HOST'A TAM ENTEGRE ET
    // Bu sayede appsettings.json içindeki Serilog ayarlarýný (File, Console vb.) dinamik okur.
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // VERÝTABANI BAÐLANTISI
    // User Secrets veya Env Variables'dan gelen güvenli connection string.
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<IsBasvuruContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

    //SERVÝS KAYITLARI (DEPENDENCY INJECTION)

    // Þirket ve Tanýmlamalar
    builder.Services.AddScoped<ISubeService, SubeService>();
    builder.Services.AddScoped<ISubeAlanService, SubeAlanService>();
    builder.Services.AddScoped<IDepartmanService, DepartmanService>();
    builder.Services.AddScoped<IDepartmanPozisyonService, DepartmanPozisyonService>();
    builder.Services.AddScoped<IPersonelEhliyetService, PersonelEhliyetService>();
    builder.Services.AddScoped<IUlkeService, UlkeService>();
    builder.Services.AddScoped<ISehirService, SehirService>();
    builder.Services.AddScoped<IIlceService, IlceService>();
    builder.Services.AddScoped<IUyrukService, UyrukService>();
    builder.Services.AddScoped<IDilService, DilService>();
    builder.Services.AddScoped<IEhliyetTuruService, EhliyetTuruService>();
    builder.Services.AddScoped<IKktcBelgeService, KktcBelgeService>();
    builder.Services.AddScoped<IKvkkService, KvkkService>();
    builder.Services.AddScoped<IOyunBilgisiService, OyunBilgisiService>();
    builder.Services.AddScoped<IProgramBilgisiService, ProgramBilgisiService>();

    // Dosya & Resim
    builder.Services.AddScoped<IImageService, ImageService>();

    // Personel Bilgileri
    builder.Services.AddScoped<IPersonelService, PersonelService>();
    builder.Services.AddScoped<IEgitimBilgisiService, EgitimBilgisiService>();
    builder.Services.AddScoped<IIsDeneyimiService, IsDeneyimiService>();
    builder.Services.AddScoped<IYabanciDilBilgisiService, YabanciDilBilgisiService>();
    builder.Services.AddScoped<ISertifikaBilgisiService, SertifikaBilgisiService>();
    builder.Services.AddScoped<IBilgisayarBilgisiService, BilgisayarBilgisiService>();
    builder.Services.AddScoped<IReferansBilgisiService, ReferansBilgisiService>();
    builder.Services.AddScoped<IDigerKisiselBilgilerService, DigerKisiselBilgilerService>();

    // Master Baþvuru & Admin & Auth
    builder.Services.AddScoped<IMasterBasvuruService, MasterBasvuruService>();
    builder.Services.AddScoped<IPanelKullaniciService, PanelKullaniciService>();
    builder.Services.AddScoped<IRolService, RolService>();
    builder.Services.AddScoped<ILogService, LogService>();
    builder.Services.AddScoped<IKimlikDogrulamaService, KimlikDogrulamaService>();

    // Mail Servisi
    builder.Services.AddScoped<IMailService, MailService>();

    // AutoMapper
    builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

    // Önbellekleme (Caching) 
    builder.Services.AddMemoryCache();

    // VALIDATION (Doðrulama)
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddFluentValidationClientsideAdapters();
    builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

    // CONTROLLER AYARLARI
    builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            })
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(e => e.Value != null && e.Value.Errors.Count > 0)
                        .SelectMany(x => x.Value!.Errors)
                        .Select(x => x.ErrorMessage)
                        .ToList();

                    var errorMsg = string.Join(" | ", errors);
                    var response = IsBasvuru.Domain.Wrappers.ServiceResponse<IsBasvuru.Domain.DTOs.Shared.NoContent>.FailureResult(errorMsg);

                    return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(response);
                };
            });

    builder.Services.AddEndpointsApiExplorer();

    //SWAGGER AYARLARI
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "IsBasvuru API", Version = "v1" });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Token'ý 'Bearer [boþluk] token' formatýnda giriniz.\nÖrnek: Bearer eyJhbGciOi...",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement()
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    },
                    Scheme = "oauth2",
                    Name = "Bearer",
                    In = ParameterLocation.Header,
                },
                new List<string>()
            }
        });
    });

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend",
            policy =>
            {
                policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
    });

    //JWT AUTHENTICATION
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["SecurityKey"];

    if (string.IsNullOrEmpty(secretKey))
    {
        throw new Exception("Kritik Hata: JWT SecurityKey yapýlandýrmada bulunamadý! (User Secrets veya Env Var kontrol edin)");
    }

    var key = Encoding.ASCII.GetBytes(secretKey);

    builder.Services.AddAuthentication(x =>
    {
        x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(x =>
    {
        //Development deðilse HTTPS zorunlu.
        x.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        x.SaveToken = true;
        x.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

    var app = builder.Build();

    //MIDDLEWARE

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        // PRODUCTION GÜVENLÝÐÝ: HSTS
        app.UseHsts();
    }

    app.UseHttpsRedirection();

    app.UseStaticFiles();

    app.UseCors("AllowFrontend");

    app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Uygulama beklenmedik bir hata ile durdu! (Fatal Error)");
}
finally
{
    Log.CloseAndFlush();
}