using System;

namespace Buzzify.Application.DTOs.Song
{
    public class SongDto
    {
        public string Id { get; set; } = string.Empty;
        public string TieuDe { get; set; } = string.Empty;
        public int? ThoiLuongGiay { get; set; }
        public string? NgheSiHopTac { get; set; }
        public string? Url { get; set; }
        public string? AnhBia { get; set; }
        public int? LuotNghe { get; set; }
        public DateTime? NgayTaiLen { get; set; }
        public string? TrangThai { get; set; }
        // Thông tin nghệ sĩ chính
        public string? TenNgheSi { get; set; }
        public string? AnhNgheSi { get; set; }
        public string? ArtistId { get; set; }
        // Thông tin Album
        public string? TenAlbum { get; set; }
        public string? IdAlbum { get; set; }
        public DateOnly? NgayPhatHanh { get; set; }
        public int? TrackNumber { get; set; }
    }
}
