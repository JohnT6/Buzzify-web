using System;
using System.Collections.Generic;

namespace Buzzify.Application.DTOs.Album
{
    public class AlbumDto
    {
        public string Id { get; set; } = string.Empty;
        public string TieuDe { get; set; } = string.Empty;
        public string? AnhBia { get; set; }
        public string? ArtistId { get; set; }
        public string? ArtistName { get; set; }
        public List<string> GenreNames { get; set; } = new();
        public DateOnly? NgayPhatHanh { get; set; }
    }
}
