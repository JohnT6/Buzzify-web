using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class Album
{
    public string Id { get; set; } = null!;

    public string TieuDe { get; set; } = null!;

    public string? AnhBia { get; set; }

    public string? ArtistId { get; set; }

    public DateOnly? NgayPhatHanh { get; set; }

    public DateTime? ScheduledPublishDate { get; set; }

    public virtual Artist? Artist { get; set; }

    public virtual ICollection<Song> Songs { get; set; } = new List<Song>();

    public virtual ICollection<Profile> IdNguoiDungs { get; set; } = new List<Profile>();

    public virtual ICollection<TheLoai> IdTheLoais { get; set; } = new List<TheLoai>();
}
