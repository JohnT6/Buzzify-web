using Buzzify.Application.DTOs.Auth;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginWithGoogleAsync(GoogleAuthDto googleAuthDto);
        Task<AuthResponseDto> LoginWithFacebookAsync(FacebookAuthDto fbAuthDto);
        Task ForgotPasswordAsync(SendOtpDto sendOtpDto);
        Task ResetPasswordAsync(ResetPasswordDto resetDto);
        Task VerifyEmailAsync(string email, string otp);
        Task LogoutAsync(string userId);
    }
}
