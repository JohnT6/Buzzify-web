namespace Buzzify.Application.DTOs.Artist
{
    public class UpdateArtistAdminDto
    {
        public bool IsVerified { get; set; }
        public string? Bio { get; set; }
        public string? CoverImage { get; set; }
    }
}
