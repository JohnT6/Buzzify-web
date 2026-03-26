using Buzzify.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Core.Interfaces
{
    public interface ISongRepository : IRepository<Song>
    {
        Task<(IEnumerable<Song> Item, int TotalCount)> GetPagedAsync(string? searchTerm, string? artistId, int page, int pageSize, bool includeScheduled = false);
    }
}
