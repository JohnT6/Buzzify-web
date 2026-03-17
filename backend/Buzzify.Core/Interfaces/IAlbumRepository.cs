using Buzzify.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Core.Interfaces
{
    public interface IAlbumRepository : IRepository<Album>
    {
        Task<(IEnumerable<Album> Item, int TotalCount)> GetPagedAsync(string? searchTerm, int page, int pageSize);
    }
}
