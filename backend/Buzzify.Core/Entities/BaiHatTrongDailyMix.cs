using System;
using System.Collections.Generic;

namespace Buzzify.Core.Entities;

public partial class BaiHatTrongDailyMix
{
    public string MixId { get; set; } = null!;

    public string SongId { get; set; } = null!;

    public int? ThuTu { get; set; }

    public virtual UserDailyMix Mix { get; set; } = null!;

    public virtual Song Song { get; set; } = null!;
}
