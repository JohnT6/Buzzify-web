using Buzzify.Application.DTOs.Playlist;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IPlaylistService
    {
        Task<IEnumerable<PlaylistDto>> GetAllPlaylistsAsync();
        Task<PlaylistDto?> GetPlaylistByIdAsync(string id);
        Task<PlaylistDto> CreatePlaylistAsync(CreatePlaylistDto createDto, string creatorId);
        Task UpdatePlaylistAsync(string id, CreatePlaylistDto updateDto, string userId);
        Task DeletePlaylistAsync(string id, string userId);
        
        // Songs management
        Task AddSongToPlaylistAsync(string playlistId, string songId, string userId);
        Task RemoveSongFromPlaylistAsync(string playlistId, string songId, string userId);
    }
}
