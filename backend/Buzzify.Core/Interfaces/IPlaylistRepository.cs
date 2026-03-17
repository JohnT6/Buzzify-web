using Buzzify.Core.Entities;

namespace Buzzify.Core.Interfaces
{
    public interface IPlaylistRepository : IRepository<Playlist>
    {
        Task<Playlist?> GetPlaylistWithSongsAsync(string playlistId);
        Task AddSongAsync(string playlistId, string songId);
        Task RemoveSongAsync(string playlistId, string songId);
    }
}
