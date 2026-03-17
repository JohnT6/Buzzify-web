using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class TheLoai
{
    public string Id { get; set; } = null!;

    public string Ten { get; set; } = null!;

    public string? SearchTags { get; set; }

    public virtual ICollection<UserDailyMix> UserDailyMixes { get; set; } = new List<UserDailyMix>();

    public virtual ICollection<Artist> Artists { get; set; } = new List<Artist>();

    public virtual ICollection<Album> IdAlbums { get; set; } = new List<Album>();

    public virtual ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
}
