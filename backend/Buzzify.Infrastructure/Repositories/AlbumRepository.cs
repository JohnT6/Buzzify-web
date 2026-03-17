using Buzzify.Core.Entities;
using Buzzify.Core.Interfaces;
using Buzzify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.Infrastructure.Repositories
{
    public class AlbumRepository : Repository<Album>, IAlbumRepository
    {
        public AlbumRepository(BuzzifyDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Album> Item, int TotalCount)> GetPagedAsync(string? searchTerm, int page, int pageSize)
        {
            var query = _dbSet.AsNoTracking()
                .Include(a => a.Artist)
                .Include(a => a.IdTheLoais)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(a => a.TieuDe.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(a => a.NgayPhatHanh)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
