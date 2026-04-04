using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Buzzify.Application.DTOs.Playlist
{
    public class CreatePlaylistDto
    {
        [Required(ErrorMessage = "Tên Playlist không được để trống")]
        [MaxLength(255)]
        public string Ten { get; set; } = string.Empty;
        
        public string? MoTa { get; set; }
        public string? AnhBia { get; set; }
        public bool? CongKhai { get; set; }
        public bool IsSystem { get; set; } = false;

        public List<string> IdTheLoais { get; set; } = new();
    }
}
