using Buzzify.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Core.Interfaces
{
    public interface IPlaylistRepository : IRepository<Playlist>
    {
        Task<Playlist?> GetPlaylistWithSongsAsync(string playlistId);
        Task AddSongAsync(string playlistId, string songId);
        Task RemoveSongAsync(string playlistId, string songId);
        Task SavePlaylistAsync(string userId, string playlistId);
        Task UnsavePlaylistAsync(string userId, string playlistId);
        Task<bool> IsPlaylistSavedByUserAsync(string userId, string playlistId);
        Task<IEnumerable<Playlist>> GetAllWithSongsAsync();
        Task<IEnumerable<Playlist>> GetPlaylistsByUserAsync(string userId);
        Task<IEnumerable<Playlist>> GetSavedPlaylistsByUserAsync(string userId);
    }
}
