using Buzzify.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using System.Text.Json;
using System.Globalization;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/payments")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IMemoryCache _cache;
        private readonly IProfileRepository _profileRepository;

        public PaymentsController(IMemoryCache cache, IProfileRepository profileRepository)
        {
            _cache = cache;
            _profileRepository = profileRepository;
        }

        // Webhook Receiver model from SePay
        public class SepayWebhookDto
        {
            public int id { get; set; }
            public string gateway { get; set; } = string.Empty;
            public string transactionDate { get; set; } = string.Empty;
            public string accountNumber { get; set; } = string.Empty;
            public string subAccount { get; set; } = string.Empty;
            public decimal amountIn { get; set; }
            public decimal amountOut { get; set; }
            public decimal accumulated { get; set; }
            public string code { get; set; } = string.Empty;
            public string transactionContent { get; set; } = string.Empty;
            public string referenceNumber { get; set; } = string.Empty;
            public string body { get; set; } = string.Empty;
        }

        public class PaymentIntentDto
        {
            public string PaymentCode { get; set; } = string.Empty;
        }

        [Authorize]
        [HttpPost("intent")]
        public IActionResult CreateIntent([FromBody] PaymentIntentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (string.IsNullOrEmpty(dto.PaymentCode) || !dto.PaymentCode.StartsWith("BZFY"))
            {
                return BadRequest(new { error = "Mã thanh toán không hợp lệ" });
            }

            // Lưu cache ánh xạ PaymentCode => UserId trong 30 phút
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));

            // Chỉ lưu mã chính, ví dụ BZFY123456 (uppercase)
            _cache.Set($"payment_{dto.PaymentCode.ToUpper()}", userId, cacheOptions);

            return Ok(new { success = true, tempStore = dto.PaymentCode });
        }

        [HttpPost("sepay-webhook")]
        public async Task<IActionResult> SepayWebhook([FromBody] JsonElement rawData)
        {
            try
            {
                // Parse directly since Sepay structure might be dynamic
                var content = rawData.GetProperty("transactionContent").GetString()?.ToUpper() ?? "";
                var amountIn = rawData.GetProperty("amountIn").GetDecimal();
                
                // Trích xuất mã bắt đầu bằng BZFY
                var parts = content.Split(new[] { ' ', '.', ',' }, StringSplitOptions.RemoveEmptyEntries);
                var paymentCode = parts.FirstOrDefault(p => p.StartsWith("BZFY"));

                if (string.IsNullOrEmpty(paymentCode))
                {
                    return Ok(new { received = true, note = "No valid BZFY code found" });
                }

                // Kiểm tra mệnh giá (Gói VIP 3000 VNĐ)
                if (amountIn < 3000)
                {
                    return Ok(new { received = true, note = "Amount less than minimum" });
                }

                // Tìm trong Cache
                if (_cache.TryGetValue($"payment_{paymentCode}", out string userId) && !string.IsNullOrEmpty(userId))
                {
                    // Lấy profile thực từ DB
                    var profile = await _profileRepository.GetByIdAsync(userId);
                    if (profile != null)
                    {
                        // Nâng cấp loại tài khoản (Không đổi Role, chỉ thêm LoaiTaiKhoan là 'vip')
                        profile.LoaiTaiKhoan = "vip";
                        _profileRepository.Update(profile);
                        await _profileRepository.SaveChangesAsync();

                        // Xóa intent khỏi cache tránh quét lại
                        _cache.Remove($"payment_{paymentCode}");
                        
                        return Ok(new { success = true });
                    }
                }

                // Nếu không thấy trong Cache (đã hết hạn hoặc gõ sai mã)
                // Trong thực tế sẽ lưu log hoặc kiểm tra qua bảng db logs
                return Ok(new { received = true, note = "Payment code not found or expired" });
            }
            catch (Exception ex)
            {
                // SePay yêu cầu trả về HTTP 200 để xác nhận đã nhận IPN, kể cả lỗi 
                Console.WriteLine($"Webhook Error: {ex.Message}");
                return Ok(new { error = ex.Message });
            }
        }
    }
}
