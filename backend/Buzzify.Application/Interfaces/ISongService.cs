using Buzzify.Application.DTOs;
using Buzzify.Application.DTOs.Song;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface ISongService
    {
        Task<PagedResultDto<SongDto>> GetAllSongsAsync(string? searchTerm, int page, int pageSize);
        Task<SongDto?> GetSongByIdAsync(string id);
        Task<SongDto> CreateSongAsync(CreateSongDto createDto, string uploaderId);
        Task UpdateSongAsync(string id, CreateSongDto updateDto, string userId);
        Task DeleteSongAsync(string id, string userId);
        Task IncrementPlayCountAsync(string id);
    }
}
