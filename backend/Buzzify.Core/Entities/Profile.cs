using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class Profile
{
    public string Id { get; set; } = null!;

    public string? HoTen { get; set; }

    public string? AnhDaiDien { get; set; }

    public string? VaiTro { get; set; }

    public string? Email { get; set; }

    public string Provider { get; set; } = null!;

    public string ProviderId { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public bool IsEmailVerified { get; set; }

    public string? VerificationCodeHash { get; set; }

    public DateTime? VerificationCodeExpiry { get; set; }

    public virtual ICollection<Artist> Artists { get; set; } = new List<Artist>();

    public virtual ICollection<LichSuNghe> LichSuNghes { get; set; } = new List<LichSuNghe>();

    public virtual ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();

    public virtual ICollection<Song> Songs { get; set; } = new List<Song>();

    public virtual ICollection<UserDailyMix> UserDailyMixes { get; set; } = new List<UserDailyMix>();

    public virtual ICollection<Artist> ArtistsNavigation { get; set; } = new List<Artist>();

    public virtual ICollection<Album> IdAlbums { get; set; } = new List<Album>();

    public virtual ICollection<Playlist> PlaylistsNavigation { get; set; } = new List<Playlist>();

    // Playback state persistence
    public string? LastSongId { get; set; }
    public string? LastQueueIds { get; set; }
    public string? LastSourceInfo { get; set; }
    public double? LastPosition { get; set; }

    // User profile extensions
    public string? Bio { get; set; }
    public string? Link { get; set; }
    public string? AnhDaiDienProvider { get; set; }

    // Admin Controls
    public bool IsLocked { get; set; } = false;
}
