using Buzzify.Application.DTOs;
using Buzzify.Application.DTOs.Album;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IAlbumService
    {
        Task<PagedResultDto<AlbumDto>> GetAllAlbumsAsync(string? searchTerm, string? artistId, int page, int pageSize);
        Task<AlbumDto?> GetAlbumByIdAsync(string id);
        Task<AlbumDto> CreateAlbumAsync(CreateAlbumDto createDto);
        Task UpdateAlbumAsync(string id, CreateAlbumDto updateDto);
        Task DeleteAlbumAsync(string id);
        
        // Saved albums
        Task SaveAlbumAsync(string albumId, string userId);
        Task UnsaveAlbumAsync(string albumId, string userId);
        Task<bool> IsAlbumSavedAsync(string albumId, string userId);
        Task<IEnumerable<AlbumDto>> GetSavedAlbumsAsync(string userId);
    }
}
