using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class BaiHatTrongPlaylist
{
    public string PlaylistId { get; set; } = null!;

    public string SongId { get; set; } = null!;

    public DateTime? NgayThem { get; set; }

    public virtual Playlist Playlist { get; set; } = null!;

    public virtual Song Song { get; set; } = null!;
}
