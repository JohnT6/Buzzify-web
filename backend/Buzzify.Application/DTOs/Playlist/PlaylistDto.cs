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
        public string? LoaiPlaylist { get; set; }
        public string? CreatorName { get; set; }
        public int SongCount { get; set; }
        
        // Admin Controls
        public bool IsSystem { get; set; }
        public bool IsFeatured { get; set; }
        
        public List<string> TopSongImages { get; set; } = new();
        public List<SongDto> Songs { get; set; } = new List<SongDto>();
        public List<string> Genres { get; set; } = new();
        public List<string> GenreIds { get; set; } = new();
    }
}
