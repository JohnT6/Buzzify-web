using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IOtpService
    {
        Task<string> GenerateOtpAsync(string email);
        Task<bool> VerifyOtpAsync(string email, string otp);
    }
}
