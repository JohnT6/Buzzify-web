using System.Collections.Generic;

namespace Buzzify.Application.DTOs
{
    public class PagedResultDto<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int TotalItems { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public bool HasNextPage => (CurrentPage * PageSize) < TotalItems;
        public bool HasPreviousPage => CurrentPage > 1;
    }
}
