using Buzzify.Application.DTOs.Song;
using System.Collections.Generic;

namespace Buzzify.Application.DTOs.Playlist
{
    public class PlaylistDto
    {
        public string Id { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public string? AnhBia { get; set; }
        public bool? CongKhai { get; set; }
        public string? IdNguoiTao { get; set; }
        public List<SongDto> Songs { get; set; } = new List<SongDto>();
    }
}
