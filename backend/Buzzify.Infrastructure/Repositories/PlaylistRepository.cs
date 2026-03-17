using Buzzify.Core.Entities;
using Buzzify.Core.Interfaces;
using Buzzify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

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
                .Include(p => p.BaiHatTrongPlaylists)
                    .ThenInclude(bp => bp.Song)
                        .ThenInclude(s => s.Artist)
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
    }
}
