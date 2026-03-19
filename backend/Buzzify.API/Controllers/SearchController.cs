using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet]
        public async Task<IActionResult> GlobalSearch([FromQuery] string query)
        {
            var results = await _searchService.GlobalSearchAsync(query);
            return Ok(results);
        }

        [HttpGet("all")]
        public async Task<IActionResult> SearchByType([FromQuery] string query, [FromQuery] string type, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var results = await _searchService.SearchByTypeAsync(query, type, page, pageSize);
            return Ok(results);
        }
    }
}
