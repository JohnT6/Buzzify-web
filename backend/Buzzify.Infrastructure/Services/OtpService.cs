using Buzzify.Application.Interfaces;
using Buzzify.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace Buzzify.Infrastructure.Services
{
    public class OtpService : IOtpService
    {
        private readonly IProfileRepository _profileRepository;
        private const int ExpirationMinutes = 5;

        public OtpService(IProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        public async Task<string> GenerateOtpAsync(string email)
        {
            var user = await _profileRepository.GetByEmailAsync(email);
            if (user == null)
            {
                throw new Core.Exceptions.NotFoundException("User not found.");
            }

            var otp = new Random().Next(100000, 999999).ToString();
            
            user.VerificationCodeHash = BCrypt.Net.BCrypt.HashPassword(otp);
            user.VerificationCodeExpiry = DateTime.Now.AddMinutes(ExpirationMinutes);

            _profileRepository.Update(user);
            await _profileRepository.SaveChangesAsync();

            return otp;
        }

        public async Task<bool> VerifyOtpAsync(string email, string otp)
        {
            var user = await _profileRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return false;
            }

            if (user.VerificationCodeHash == null || user.VerificationCodeExpiry == null || user.VerificationCodeExpiry < DateTime.Now)
            {
                return false;
            }

            bool isValid = BCrypt.Net.BCrypt.Verify(otp, user.VerificationCodeHash);
            
            if (isValid)
            {
                // Invalidate OTP after successful use
                user.VerificationCodeHash = null;
                user.VerificationCodeExpiry = null;
                _profileRepository.Update(user);
                await _profileRepository.SaveChangesAsync();
            }

            return isValid;
        }
    }
}
