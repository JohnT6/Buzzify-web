using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class VwUserFavoriteGenre
{
    public string IdNguoiDung { get; set; } = null!;

    public string IdTheLoai { get; set; } = null!;

    public string TenTheLoai { get; set; } = null!;

    public int? TongLuotNghe { get; set; }

    public DateTime? LanNgheCuoi { get; set; }
}
