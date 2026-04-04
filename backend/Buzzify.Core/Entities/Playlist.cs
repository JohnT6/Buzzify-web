using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class Playlist
{
    public string Id { get; set; } = null!;

    public string Ten { get; set; } = null!;

    public string IdNguoiTao { get; set; } = null!;

    public string? AnhBia { get; set; }

    public string? MoTa { get; set; }

    public string LoaiPlaylist { get; set; } = null!;

    public bool? CongKhai { get; set; }

    // Admin Controls
    public bool IsSystem { get; set; } = false;
    public bool IsFeatured { get; set; } = false;

    public virtual ICollection<BaiHatTrongPlaylist> BaiHatTrongPlaylists { get; set; } = new List<BaiHatTrongPlaylist>();

    public virtual Profile IdNguoiTaoNavigation { get; set; } = null!;

    public virtual ICollection<Profile> IdNguoiDungs { get; set; } = new List<Profile>();

    public virtual ICollection<TheLoai> IdTheLoais { get; set; } = new List<TheLoai>();
}
