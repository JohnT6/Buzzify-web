using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class LichSuNghe
{
    public long Id { get; set; }

    public string IdNguoiDung { get; set; } = null!;

    public string SongId { get; set; } = null!;

    public DateTime? NgayNghe { get; set; }

    public virtual Profile IdNguoiDungNavigation { get; set; } = null!;

    public virtual Song Song { get; set; } = null!;
}
