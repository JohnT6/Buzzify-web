using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class Song
{
    public string Id { get; set; } = null!;

    public string TieuDe { get; set; } = null!;

    public string Url { get; set; } = null!;

    public string? AnhBia { get; set; }

    public int? ThoiLuongGiay { get; set; }

    public int? LuotNghe { get; set; }

    public string? ArtistId { get; set; }

    public string? IdAlbum { get; set; }

    public string? NgheSiHopTac { get; set; }

    public int? TrackNumber { get; set; }

    public string? UploaderId { get; set; }

    public DateTime? NgayTaiLen { get; set; }

    public DateTime? ScheduledPublishDate { get; set; }

    public string? TrangThai { get; set; }

    public virtual Artist? Artist { get; set; }

    public virtual ICollection<BaiHatTrongDailyMix> BaiHatTrongDailyMixes { get; set; } = new List<BaiHatTrongDailyMix>();

    public virtual ICollection<BaiHatTrongPlaylist> BaiHatTrongPlaylists { get; set; } = new List<BaiHatTrongPlaylist>();

    public virtual Album? IdAlbumNavigation { get; set; }

    public virtual ICollection<LichSuNghe> LichSuNghes { get; set; } = new List<LichSuNghe>();

    public virtual Profile? Uploader { get; set; }
}
