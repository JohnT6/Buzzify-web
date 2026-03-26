using Buzzify.Core.Entities;
using Buzzify.Core.Interfaces;
using Buzzify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.Infrastructure.Repositories
{
    public class SongRepository : Repository<Song>, ISongRepository
    {
        public SongRepository(BuzzifyDbContext context) : base(context)
        {
        }

        public async Task<Song?> GetByIdAsync(object id)
        {
            return await _dbSet.AsNoTracking()
                .Include(s => s.Artist)
                .Include(s => s.IdAlbumNavigation)
                .FirstOrDefaultAsync(s => s.Id == (string)id);
        }

        public async Task<(IEnumerable<Song> Item, int TotalCount)> GetPagedAsync(string? searchTerm, string? artistId, int page, int pageSize, bool includeScheduled = false)
        {
            var query = _dbSet.AsNoTracking()
                .Include(s => s.Artist)
                .Include(s => s.IdAlbumNavigation)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(s => s.TieuDe.Contains(searchTerm) || s.NgheSiHopTac.Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(artistId))
            {
                query = query.Where(s => s.ArtistId == artistId);
            }

            if (!includeScheduled)
            {
                var now = System.DateTime.Now;
                query = query.Where(s => s.TrangThai == "published" && (s.ScheduledPublishDate == null || s.ScheduledPublishDate <= now));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(s => s.NgayTaiLen)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
