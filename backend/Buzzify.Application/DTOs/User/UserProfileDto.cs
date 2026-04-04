namespace Buzzify.Application.DTOs.User
{
    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? HoTen { get; set; }
        public string? AnhDaiDien { get; set; }
        public string VaiTro { get; set; } = "user";
        public bool IsEmailVerified { get; set; }
        public string? Provider { get; set; }
        public string? Bio { get; set; }
        public string? Link { get; set; }
        public string? AnhDaiDienProvider { get; set; }
        public bool IsLocked { get; set; }
        public PlaybackStateDto? PlaybackState { get; set; }
    }
}
