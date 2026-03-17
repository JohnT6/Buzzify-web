namespace Buzzify.Application.DTOs.Artist
{
    public class ArtistDto
    {
        public string Id { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string? AnhDaiDien { get; set; }
        public string? ProfileId { get; set; }
    }
}
