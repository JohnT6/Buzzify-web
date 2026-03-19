using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class Artist
{
    public string Id { get; set; } = null!;

    public string Ten { get; set; } = null!;

    public string? AnhDaiDien { get; set; }

    public string? ProfileId { get; set; }
    public int FollowerCount { get; set; }

    public virtual ICollection<Album> Albums { get; set; } = new List<Album>();

    public virtual Profile? Profile { get; set; }

    public virtual ICollection<Song> Songs { get; set; } = new List<Song>();

    public virtual ICollection<Profile> IdNguoiDungs { get; set; } = new List<Profile>();

    public virtual ICollection<TheLoai> IdTheLoais { get; set; } = new List<TheLoai>();
}
