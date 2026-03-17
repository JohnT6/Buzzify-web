using System.Collections.Generic;

namespace Buzzify.Application.DTOs.Admin
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalArtists { get; set; }
        public int TotalSongs { get; set; }
        public int TotalPlaylists { get; set; }
        public int TotalStreams { get; set; }
    }

    public class StreamChartDto
    {
        public string Date { get; set; } = string.Empty;
        public int StreamCount { get; set; }
    }
}
