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

        public async Task<(IEnumerable<Album> Item, int TotalCount)> GetPagedAsync(string? searchTerm, string? artistId, int page, int pageSize)
        {
            var query = _dbSet.AsNoTracking()
                .Include(a => a.Artist)
                .Include(a => a.IdTheLoais)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(a => a.TieuDe.Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(artistId))
            {
                query = query.Where(a => a.ArtistId == artistId);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(a => a.NgayPhatHanh)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Album?> GetAlbumWithSongsByIdAsync(string id)
        {
            return await _dbSet.AsNoTracking()
                .Include(a => a.Artist)
                .Include(a => a.IdTheLoais)
                .Include(a => a.Songs)
                    .ThenInclude(s => s.Artist)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task SaveAlbumAsync(string userId, string albumId)
        {
            var exists = await IsAlbumSavedByUserAsync(userId, albumId);
            if (!exists)
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO album_da_luu (id_nguoi_dung, id_album) VALUES ({0}, {1})",
                    userId, albumId);
            }
        }

        public async Task UnsaveAlbumAsync(string userId, string albumId)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM album_da_luu WHERE id_nguoi_dung = {0} AND id_album = {1}",
                userId, albumId);
        }

        public async Task<bool> IsAlbumSavedByUserAsync(string userId, string albumId)
        {
            var count = await _context.Profiles
                .Where(u => u.Id == userId)
                .SelectMany(u => u.IdAlbums)
                .CountAsync(a => a.Id == albumId);
            return count > 0;
        }

        public async Task<IEnumerable<Album>> GetSavedAlbumsByUserAsync(string userId)
        {
            return await _context.Albums
                .Where(a => a.IdNguoiDungs.Any(u => u.Id == userId))
                .Include(a => a.Artist)
                .Include(a => a.Songs)
                .ToListAsync();
        }
    }
}
