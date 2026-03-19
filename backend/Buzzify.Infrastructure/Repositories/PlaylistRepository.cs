using Buzzify.Core.Entities;
using Buzzify.Core.Interfaces;
using Buzzify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Buzzify.Infrastructure.Repositories
{
    public class PlaylistRepository : Repository<Playlist>, IPlaylistRepository
    {
        public PlaylistRepository(BuzzifyDbContext context) : base(context)
        {
        }

        public async Task<Playlist?> GetPlaylistWithSongsAsync(string playlistId)
        {
            return await _context.Playlists
                .Include(p => p.IdNguoiTaoNavigation)
                .Include(p => p.BaiHatTrongPlaylists)
                    .ThenInclude(bp => bp.Song)
                        .ThenInclude(s => s.Artist)
                .Include(p => p.BaiHatTrongPlaylists)
                    .ThenInclude(bp => bp.Song)
                        .ThenInclude(s => s.IdAlbumNavigation)
                .FirstOrDefaultAsync(p => p.Id == playlistId);
        }

        public async Task AddSongAsync(string playlistId, string songId)
        {
            var exists = await _context.BaiHatTrongPlaylists
                .AnyAsync(b => b.PlaylistId == playlistId && b.SongId == songId);

            if (!exists)
            {
                _context.BaiHatTrongPlaylists.Add(new BaiHatTrongPlaylist
                {
                    PlaylistId = playlistId,
                    SongId = songId,
                    NgayThem = System.DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }
        }

        public async Task RemoveSongAsync(string playlistId, string songId)
        {
            var item = await _context.BaiHatTrongPlaylists
                .FirstOrDefaultAsync(b => b.PlaylistId == playlistId && b.SongId == songId);

            if (item != null)
            {
                _context.BaiHatTrongPlaylists.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SavePlaylistAsync(string userId, string playlistId)
        {
            var exists = await IsPlaylistSavedByUserAsync(userId, playlistId);
            if (!exists)
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO playlist_da_luu (id_nguoi_dung, playlist_id) VALUES ({0}, {1})",
                    userId, playlistId);
            }
        }

        public async Task UnsavePlaylistAsync(string userId, string playlistId)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM playlist_da_luu WHERE id_nguoi_dung = {0} AND playlist_id = {1}",
                userId, playlistId);
        }

        public async Task<bool> IsPlaylistSavedByUserAsync(string userId, string playlistId)
        {
            var count = await _context.Playlists
                .Where(p => p.Id == playlistId)
                .SelectMany(p => p.IdNguoiDungs)
                .CountAsync(u => u.Id == userId);
            return count > 0;
        }

        public async Task<IEnumerable<Playlist>> GetAllWithSongsAsync()
        {
            return await _context.Playlists
                .Include(p => p.IdNguoiTaoNavigation)
                .Include(p => p.BaiHatTrongPlaylists)
                    .ThenInclude(bp => bp.Song)
                .ToListAsync();
        }

        public async Task<IEnumerable<Playlist>> GetPlaylistsByUserAsync(string userId)
        {
            return await _context.Playlists
                .Where(p => p.IdNguoiTao == userId)
                .Include(p => p.IdNguoiTaoNavigation)
                .Include(p => p.BaiHatTrongPlaylists)
                    .ThenInclude(bp => bp.Song)
                .ToListAsync();
        }

        public async Task<IEnumerable<Playlist>> GetSavedPlaylistsByUserAsync(string userId)
        {
            return await _context.Playlists
                .Where(p => p.IdNguoiDungs.Any(u => u.Id == userId))
                .Include(p => p.IdNguoiTaoNavigation)
                .Include(p => p.BaiHatTrongPlaylists)
                    .ThenInclude(bp => bp.Song)
                .ToListAsync();
        }
    }
}
