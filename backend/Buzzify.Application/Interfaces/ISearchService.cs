using Buzzify.Application.DTOs.Search;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface ISearchService
    {
        Task<SearchResultDto> GlobalSearchAsync(string query);
        Task<SearchResultDto> SearchByTypeAsync(string query, string type, int page, int pageSize);
    }
}
