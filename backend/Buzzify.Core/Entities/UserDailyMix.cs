using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class UserDailyMix
{
    public string Id { get; set; } = null!;

    public string IdNguoiDung { get; set; } = null!;

    public string TieuDe { get; set; } = null!;

    public string? IdTheLoaiChinh { get; set; }

    public DateOnly? NgayTao { get; set; }

    public virtual ICollection<BaiHatTrongDailyMix> BaiHatTrongDailyMixes { get; set; } = new List<BaiHatTrongDailyMix>();

    public virtual Profile IdNguoiDungNavigation { get; set; } = null!;

    public virtual TheLoai? IdTheLoaiChinhNavigation { get; set; }
}
