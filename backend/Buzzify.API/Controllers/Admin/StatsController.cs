using Buzzify.Application.DTOs.Admin;
using Buzzify.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers.Admin
{
    [Route("api/v1/Admin/Stats")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class StatsController : ControllerBase
    {
        private readonly BuzzifyDbContext _context;

        public StatsController(BuzzifyDbContext context)
        {
            _context = context;
        }

        [HttpGet("Overview")]
        public async Task<IActionResult> GetOverviewStats()
        {
            var totalUsers = await _context.Profiles.CountAsync();
            var totalArtists = await _context.Artists.CountAsync();
            var totalSongs = await _context.Songs.CountAsync();
            var totalPlaylists = await _context.Playlists.CountAsync();
            
            // Using LichSuNghes for stream counts
            var totalStreams = await _context.LichSuNghes.CountAsync();

            var stats = new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                TotalArtists = totalArtists,
                TotalSongs = totalSongs,
                TotalPlaylists = totalPlaylists,
                TotalStreams = totalStreams
            };

            return Ok(stats);
        }

        [HttpGet("Streams/Daily")]
        public async Task<IActionResult> GetDailyStreams()
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var streams = await _context.LichSuNghes
                .Where(l => l.NgayNghe >= thirtyDaysAgo)
                .GroupBy(l => l.NgayNghe.HasValue ? l.NgayNghe.Value.Date : DateTime.MinValue.Date)
                .Select(g => new StreamChartDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    StreamCount = g.Count()
                })
                .OrderBy(s => s.Date)
                .ToListAsync();

            return Ok(streams);
        }
    }
}
