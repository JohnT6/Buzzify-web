using Buzzify.Application.DTOs;
using Buzzify.Application.DTOs.Album;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IAlbumService
    {
        Task<PagedResultDto<AlbumDto>> GetAllAlbumsAsync(string? searchTerm, int page, int pageSize);
        Task<AlbumDto?> GetAlbumByIdAsync(string id);
        Task<AlbumDto> CreateAlbumAsync(CreateAlbumDto createDto);
        Task UpdateAlbumAsync(string id, CreateAlbumDto updateDto);
        Task DeleteAlbumAsync(string id);
    }
}
