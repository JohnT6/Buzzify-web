namespace Buzzify.Application.DTOs.Artist
{
    public class ArtistDto
    {
        public string Id { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string? AnhDaiDien { get; set; }
        public string? ProfileId { get; set; }
        public int FollowerCount { get; set; }
        public bool IsFollowed { get; set; }
        
        // Admin & Profile Info
        public bool IsVerified { get; set; }
        public string? Bio { get; set; }
        public string? CoverImage { get; set; }
    }
}
