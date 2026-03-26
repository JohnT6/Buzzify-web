using System;
using System.Collections.Generic;

namespace Buzzify.Application.DTOs.Artist
{
    public class ArtistStatsDto
    {
        public int TotalStreams { get; set; }
        public int TotalSaves { get; set; }
        public int PlaylistAdds { get; set; }
        public int RealTimeListeners { get; set; }
        public int FollowerCount { get; set; }
        public int FollowerChangeMonth { get; set; }
        public List<StatDataPoint> SongDistribution { get; set; } = new List<StatDataPoint>();
        public List<StatDataPoint> StreamTrend { get; set; } = new List<StatDataPoint>();
    }

    public class StatDataPoint
    {
        public string Date { get; set; } = null!;
        public int Value { get; set; }
    }
}
