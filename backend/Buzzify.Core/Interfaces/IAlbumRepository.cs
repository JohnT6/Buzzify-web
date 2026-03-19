using Buzzify.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Core.Interfaces
{
    public interface IAlbumRepository : IRepository<Album>
    {
        Task<(IEnumerable<Album> Item, int TotalCount)> GetPagedAsync(string? searchTerm, string? artistId, int page, int pageSize);
        Task<Album?> GetAlbumWithSongsByIdAsync(string id);
        Task SaveAlbumAsync(string userId, string albumId);
        Task UnsaveAlbumAsync(string userId, string albumId);
        Task<bool> IsAlbumSavedByUserAsync(string userId, string albumId);
        Task<IEnumerable<Album>> GetSavedAlbumsByUserAsync(string userId);
    }
}
