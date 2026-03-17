using Buzzify.Application.DTOs.Auth;
using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            return Ok(result);
        }

        [HttpPost("register")]
        [EnableRateLimiting("OtpLimit")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            return Ok(new { message = "Registration successful. Please check your email for OTP.", data = result });
        }

        [HttpPost("forgot-password")]
        [EnableRateLimiting("OtpLimit")]
        public async Task<IActionResult> ForgotPassword([FromBody] SendOtpDto sendOtpDto)
        {
            await _authService.ForgotPasswordAsync(sendOtpDto);
            return Ok(new { message = "OTP sent to your email." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
        {
            await _authService.ResetPasswordAsync(resetDto);
            return Ok(new { message = "Password reset successfully." });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyOtpDto verifyDto)
        {
            await _authService.VerifyEmailAsync(verifyDto.Email, verifyDto.Otp);
            return Ok(new { message = "Email verified successfully." });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId != null)
            {
                await _authService.LogoutAsync(userId);
            }
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthDto googleAuthDto)
        {
            var result = await _authService.LoginWithGoogleAsync(googleAuthDto);
            return Ok(result);
        }

        [HttpPost("facebook-login")]
        public async Task<IActionResult> FacebookLogin([FromBody] FacebookAuthDto facebookAuthDto)
        {
            var result = await _authService.LoginWithFacebookAsync(facebookAuthDto);
            return Ok(result);
        }
    }
}
