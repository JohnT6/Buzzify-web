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
        Task<PlaylistDto> GetLikedSongsPlaylistAsync(string userId);
        
        // Admin Controls
        Task<IEnumerable<PlaylistDto>> GetAdminPlaylistsAsync();
        Task ToggleFeaturedPlaylistAsync(string id);
        Task DeletePlaylistAdminAsync(string id);
        Task<PlaylistDto> CreateAdminPlaylistAsync(CreatePlaylistDto createDto, string creatorId);
        Task UpdateAdminPlaylistAsync(string id, CreatePlaylistDto updateDto);
        
        // Admin Song Management (no user check)
        Task AddSongToAdminPlaylistAsync(string playlistId, string songId);
        Task RemoveSongFromAdminPlaylistAsync(string playlistId, string songId);
        
        // Songs management
        Task AddSongToPlaylistAsync(string playlistId, string songId, string userId);
        Task RemoveSongFromPlaylistAsync(string playlistId, string songId, string userId);

        // Saved playlists management
        Task SavePlaylistAsync(string playlistId, string userId);
        Task UnsavePlaylistAsync(string playlistId, string userId);
        Task<bool> IsPlaylistSavedAsync(string playlistId, string userId);
        Task<IEnumerable<PlaylistDto>> GetSavedPlaylistsAsync(string userId);
        Task<IEnumerable<PlaylistDto>> GetPlaylistsByUserAsync(string userId);
    }
}
