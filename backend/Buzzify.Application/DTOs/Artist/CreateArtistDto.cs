using System.ComponentModel.DataAnnotations;

namespace Buzzify.Application.DTOs.Artist
{
    public class CreateArtistDto
    {
        [Required(ErrorMessage = "Tên nghệ sĩ không được để trống")]
        [MaxLength(255)]
        public string Ten { get; set; } = string.Empty;
        
        public string? AnhDaiDien { get; set; }

        public string? ProfileId { get; set; }
    }
}
