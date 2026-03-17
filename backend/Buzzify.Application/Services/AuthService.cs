using Buzzify.Application.DTOs.Auth;
using Buzzify.Application.Interfaces;
using Buzzify.Core.Entities;
using Buzzify.Core.Exceptions;
using Buzzify.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Google.Apis.Auth;

namespace Buzzify.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IConfiguration _config;
        private readonly IOtpService _otpService;
        private readonly IEmailService _emailService;
        private readonly IPlaylistRepository _playlistRepository;

        public AuthService(IProfileRepository profileRepository, IConfiguration config, IOtpService otpService, IEmailService emailService, IPlaylistRepository playlistRepository)
        {
            _profileRepository = profileRepository;
            _config = config;
            _otpService = otpService;
            _emailService = emailService;
            _playlistRepository = playlistRepository;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _profileRepository.GetByEmailAsync(loginDto.Email);
            if (user == null || user.Provider != "email")
            {
                throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");
            }

            if (!user.IsEmailVerified)
            {
                throw new UnauthorizedException("Địa chỉ email chưa được xác thực. Vui lòng kiểm tra hộp thư của bạn.");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.HoTen,
                Role = user.VaiTro,
                Token = token
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            var existingUser = await _profileRepository.GetByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                throw new BadRequestException("Địa chỉ email đã được đăng ký trên hệ thống.");
            }

            var newUser = new Profile
            {
                Id = Guid.NewGuid().ToString(),
                Email = registerDto.Email,
                HoTen = registerDto.FullName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Provider = "email",
                ProviderId = registerDto.Email,
                IsEmailVerified = false,
                AnhDaiDien = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(registerDto.FullName)}&background=random&color=fff&bold=true",
                VaiTro = "user"
            };

            var otp = new Random().Next(100000, 999999).ToString();
            newUser.VerificationCodeHash = BCrypt.Net.BCrypt.HashPassword(otp);
            newUser.VerificationCodeExpiry = DateTime.Now.AddMinutes(5);

            await _profileRepository.AddAsync(newUser);

            // Tự động tạo Playlist Yêu Thích cho người dùng mới
            var favoritePlaylist = new Playlist
            {
                Id = Guid.NewGuid().ToString(),
                Ten = "Bài Hát Yêu Thích",
                IdNguoiTao = newUser.Id,
                IdNguoiTaoNavigation = newUser, // Gán trực tiếp navigation property
                LoaiPlaylist = "liked_songs",
                CongKhai = false,
                MoTa = "Danh sách những bài hát bạn yêu thích nhất."
            };
            
            await _playlistRepository.AddAsync(favoritePlaylist);
            
            // Chỉ gọi SaveChanges 1 lần duy nhất cho tất cả các thay đổi trong context
            await _profileRepository.SaveChangesAsync();

            // Gửi OTP xác thực qua email
            string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;'>
                    <h2 style='color: #0f5e8f;'>Xác Nhận Đăng Ký Buzzify</h2>
                    <p>Chào <strong>{newUser.HoTen}</strong>,</p>
                    <p>Cảm ơn bạn đã tham gia Buzzify! Mã OTP xác thực của bạn là:</p>
                    <div style='background: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #333;'>
                        {otp}
                    </div>
                    <p style='color: #666; font-size: 13px;'>Mã này sẽ hết hạn trong 5 phút nữa. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                </div>
            ";
            await _emailService.SendEmailAsync(newUser.Email, "Xác Nhận Đăng Ký Buzzify - OTP", emailBody);

            return new AuthResponseDto
            {
                UserId = newUser.Id,
                Email = newUser.Email,
                FullName = newUser.HoTen,
                Role = newUser.VaiTro,
                Token = "" // Require verification before generating token
            };
        }

        public async Task<AuthResponseDto> LoginWithFacebookAsync(FacebookAuthDto fbAuthDto)
        {
            try
            {
                // Verify the token with Facebook Graph API
                using var httpClient = new System.Net.Http.HttpClient();
                
                var response = await httpClient.GetAsync($"https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token={fbAuthDto.Token}");
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new UnauthorizedException("Facebook token không hợp lệ hoặc đã hết hạn.");
                }

                var content = await response.Content.ReadAsStringAsync();
                var userInfo = System.Text.Json.JsonDocument.Parse(content).RootElement;
                
                var facebookId = userInfo.GetProperty("id").GetString();
                var name = userInfo.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : "Facebook User";
                var email = userInfo.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : $"{facebookId}@facebook.com"; // Fallback if no email provided by FB (depends on user privacy)
                
                // Get Large Profile Picture
                string pictureUrl = null;
                if (userInfo.TryGetProperty("picture", out var picElement) && 
                    picElement.TryGetProperty("data", out var dataElement) && 
                    dataElement.TryGetProperty("url", out var urlElement))
                {
                    pictureUrl = urlElement.GetString();
                }

                // Check if user exists by email (if exists, merge account or simply login)
                // Using FacebookID directly as ProviderId would be more robust but we prioritize email if it matches.
                var user = await _profileRepository.GetByEmailAsync(email);

                if (user != null && user.Provider != "facebook")
                {
                    throw new BadRequestException("Email này đã được sử dụng với phương thức đăng nhập khác.");
                }

                if (user == null)
                {
                    user = new Profile
                    {
                        Id = Guid.NewGuid().ToString(),
                        Email = email,
                        HoTen = name,
                        Provider = "facebook",
                        ProviderId = facebookId,
                        IsEmailVerified = true, // We trust Facebook verification
                        AnhDaiDien = string.IsNullOrEmpty(pictureUrl) ? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(name)}&background=random&color=fff&bold=true" : pictureUrl,
                        VaiTro = "user"
                    };

                    await _profileRepository.AddAsync(user);
                    
                    var favoritePlaylist = new Playlist
                    {
                        Id = Guid.NewGuid().ToString(),
                        Ten = "Bài Hát Yêu Thích",
                        IdNguoiTao = user.Id,
                        IdNguoiTaoNavigation = user,
                        LoaiPlaylist = "liked_songs",
                        CongKhai = false,
                        MoTa = "Danh sách những bài hát bạn yêu thích nhất."
                    };
                    await _playlistRepository.AddAsync(favoritePlaylist);
                    await _profileRepository.SaveChangesAsync();
                }

                var token = GenerateJwtToken(user);

                return new AuthResponseDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FullName = user.HoTen,
                    Role = user.VaiTro,
                    Token = token
                };
            }
            catch (UnauthorizedException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new UnauthorizedException($"Lỗi đăng nhập Facebook: {ex.Message}");
            }
        }

        public async Task<AuthResponseDto> LoginWithGoogleAsync(GoogleAuthDto googleAuthDto)
        {
            try
            {
                // Gọi Google UserInfo API với access_token để lấy thông tin người dùng
                using var httpClient = new System.Net.Http.HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", googleAuthDto.IdToken);
                
                var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new UnauthorizedException("Google token không hợp lệ.");
                }

                var content = await response.Content.ReadAsStringAsync();
                var userInfo = System.Text.Json.JsonDocument.Parse(content).RootElement;
                
                var email = userInfo.GetProperty("email").GetString();
                var name = userInfo.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : email;
                var picture = userInfo.TryGetProperty("picture", out var picProp) ? picProp.GetString() : null;
                var sub = userInfo.GetProperty("sub").GetString();
                
                if (string.IsNullOrEmpty(email))
                {
                    throw new UnauthorizedException("Không thể lấy thông tin email từ Google.");
                }

                var user = await _profileRepository.GetByEmailAsync(email);

                if (user != null && user.Provider != "google")
                {
                    throw new BadRequestException("Email này đã được sử dụng với phương thức đăng nhập khác.");
                }

                if (user == null)
                {
                    user = new Profile
                    {
                        Id = Guid.NewGuid().ToString(),
                        Email = email,
                        HoTen = name,
                        Provider = "google",
                        ProviderId = sub,
                        IsEmailVerified = true,
                        AnhDaiDien = string.IsNullOrEmpty(picture) ? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(name)}&background=random&color=fff&bold=true" : picture,
                        VaiTro = "user"
                    };

                    await _profileRepository.AddAsync(user);
                    
                    var favoritePlaylist = new Playlist
                    {
                        Id = Guid.NewGuid().ToString(),
                        Ten = "Bài Hát Yêu Thích",
                        IdNguoiTao = user.Id,
                        IdNguoiTaoNavigation = user,
                        LoaiPlaylist = "liked_songs",
                        CongKhai = false,
                        MoTa = "Danh sách những bài hát bạn yêu thích nhất."
                    };
                    await _playlistRepository.AddAsync(favoritePlaylist);
                    await _profileRepository.SaveChangesAsync();
                }

                var token = GenerateJwtToken(user);

                return new AuthResponseDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FullName = user.HoTen,
                    Role = user.VaiTro,
                    Token = token
                };
            }
            catch (UnauthorizedException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new UnauthorizedException($"Lỗi đăng nhập Google: {ex.Message}");
            }
        }

        public async Task ForgotPasswordAsync(SendOtpDto sendOtpDto)
        {
            var user = await _profileRepository.GetByEmailAsync(sendOtpDto.Email);
            if (user == null || user.Provider != "email")
            {
                throw new NotFoundException("Địa chỉ email không tồn tại trên hệ thống.");
            }

            var otp = await _otpService.GenerateOtpAsync(user.Email);
            
            string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto;'>
                    <h2 style='color: #f44336;'>Quên Mật Khẩu Buzzify</h2>
                    <p>Chào bạn,</p>
                    <p>Mã OTP để khôi phục mật khẩu là: <strong style='font-size: 24px; color: #333;'>{otp}</strong></p>
                    <p>Mã này sẽ hết hạn trong 5 phút nữa. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
                </div>
            ";
            
            await _emailService.SendEmailAsync(user.Email, "Khôi Phục Mật Khẩu Buzzify - OTP", emailBody);
        }

        public async Task ResetPasswordAsync(ResetPasswordDto resetDto)
        {
            var isValid = await _otpService.VerifyOtpAsync(resetDto.Email, resetDto.Otp);
            if (!isValid)
            {
                throw new BadRequestException("Mã OTP không hợp lệ hoặc đã hết hạn.");
            }

            var user = await _profileRepository.GetByEmailAsync(resetDto.Email);
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetDto.NewPassword);
            _profileRepository.Update(user);
            await _profileRepository.SaveChangesAsync();
        }

        public async Task VerifyEmailAsync(string email, string otp)
        {
            var isValid = await _otpService.VerifyOtpAsync(email, otp);
            if (!isValid)
            {
                throw new BadRequestException("Mã OTP không hợp lệ hoặc đã hết hạn.");
            }

            var user = await _profileRepository.GetByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy thông tin người dùng.");
            }

            user.IsEmailVerified = true;
            _profileRepository.Update(user);
            await _profileRepository.SaveChangesAsync();
        }

        public async Task LogoutAsync(string userId)
        {
            // Placeholder: Ở đây bạn có thể thêm logic để lưu log đăng xuất vào Database
            // Hoặc nếu dùng Token Blacklist (Redis), bạn sẽ thêm token vào danh sách bị cấm ở đây.
            await Task.CompletedTask;
        }

        private string GenerateJwtToken(Profile user)
        {
            var keyStr = _config["Jwt:Key"] ?? "default_secret_key_needs_to_be_long_enough";
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            string role = user.VaiTro ?? "user";

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Role, role) // <-- Added this to support [Authorize(Roles="...")]
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), // Adjust expiration as needed
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
