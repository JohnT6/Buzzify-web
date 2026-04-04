using Buzzify.API.Hubs;
using Buzzify.API.Middlewares;
using Buzzify.Application.Interfaces;
using Buzzify.Application.Services;
using Buzzify.Core.Interfaces;
using Buzzify.Infrastructure.Data;
using Buzzify.Infrastructure.Repositories;
using Buzzify.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;




var builder = WebApplication.CreateBuilder(args);

// Load appsettings.Local.json if it exists
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173", "https://localhost:5173", "http://buzzify-frontend.genzo.io.vn", "https://buzzify-frontend.genzo.io.vn")
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR(); // Đăng ký SignalR cho Jam Feature

// Configure Rate Limiting (DDoS Protection)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddFixedWindowLimiter("OtpLimit", limiterOptions =>
    {
        limiterOptions.PermitLimit = 3;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
    });
});

// Configure DB Context
builder.Services.AddDbContext<BuzzifyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure caching (for OTP)
builder.Services.AddMemoryCache();

// Register Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<ISongRepository, SongRepository>();
builder.Services.AddScoped<IPlaylistRepository, PlaylistRepository>();
builder.Services.AddScoped<IArtistRepository, ArtistRepository>();
builder.Services.AddScoped<IAlbumRepository, AlbumRepository>();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<ISongService, SongService>();
builder.Services.AddScoped<IPlaylistService, PlaylistService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IArtistService, ArtistService>();
builder.Services.AddScoped<IAlbumService, AlbumService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<ITheLoaiService, TheLoaiService>();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "buzzify_super_secret_key_which_needs_to_be_at_least_32_characters_long";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set true in prod
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier
    };
});

// Configure Swagger with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Buzzify API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Phục vụ static files (hình ảnh, audio)
var publicPath = Path.Combine(builder.Environment.ContentRootPath, "public");
if (!Directory.Exists(publicPath)) Directory.CreateDirectory(publicPath);

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(publicPath),
    RequestPath = ""
});

app.UseHttpsRedirection();

// Kich hoat middleware Rate Limiter TRUOC controller
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<JamHub>("/hubs/jam"); // Cổng kết nối realtime

// Seed data và cập nhật Schema
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await DataSeeder.SeedAsync(services);
}

app.Run();
