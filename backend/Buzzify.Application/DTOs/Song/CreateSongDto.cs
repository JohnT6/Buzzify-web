using System.ComponentModel.DataAnnotations;

namespace Buzzify.Application.DTOs.Song
{
    public class CreateSongDto
    {
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        [MaxLength(255)]
        public string TieuDe { get; set; } = string.Empty;
        
        public int? ThoiLuongGiay { get; set; }
        public string? NgheSiHopTac { get; set; }
        
        [Required(ErrorMessage = "Url bài hát không được để trống")]
        public string Url { get; set; } = string.Empty;
        
        public string? AnhBia { get; set; }
        public string? ArtistId { get; set; }
        public string? IdAlbum { get; set; }
    }
}
