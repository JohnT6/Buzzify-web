using System;
using System.Collections.Generic;

namespace Buzzify.Application.DTOs.Album
{
    public class CreateAlbumDto
    {
        public string TieuDe { get; set; } = string.Empty;
        public string? AnhBia { get; set; }
        public string? ArtistId { get; set; }
        public DateOnly? NgayPhatHanh { get; set; }
        public List<string> IdTheLoais { get; set; } = new();
    }
}
