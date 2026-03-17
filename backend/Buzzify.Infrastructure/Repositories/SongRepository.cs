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

        public async Task<(IEnumerable<Song> Item, int TotalCount)> GetPagedAsync(string? searchTerm, int page, int pageSize)
        {
            var query = _dbSet.AsNoTracking()
                .Include(s => s.Artist)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(s => s.TieuDe.Contains(searchTerm) || s.NgheSiHopTac.Contains(searchTerm));
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
