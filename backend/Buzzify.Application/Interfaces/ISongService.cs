using Buzzify.Application.DTOs;
using Buzzify.Application.DTOs.Song;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface ISongService
    {
        Task<PagedResultDto<SongDto>> GetAllSongsAsync(string? searchTerm, string? artistId, int page, int pageSize);
        Task<PagedResultDto<SongDto>> GetSongsByArtistAsync(string artistId, string? searchTerm, int page, int pageSize, bool includeScheduled = false);
        Task<SongDto?> GetSongByIdAsync(string id);
        Task<SongDto> CreateSongAsync(CreateSongDto createDto, string uploaderId);
        Task UpdateSongAsync(string id, CreateSongDto updateDto, string userId);
        Task DeleteSongAsync(string id, string userId);
        Task IncrementPlayCountAsync(string id, string? userId = null);
        
        // Admin Controls
        Task ToggleMuteSongAsync(string id);
        Task ToggleHideSongAsync(string id);
    }
}
