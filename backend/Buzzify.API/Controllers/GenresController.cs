using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/genres")]
    [ApiController]
    public class GenresController : ControllerBase
    {
        private readonly ITheLoaiService _theLoaiService;

        public GenresController(ITheLoaiService theLoaiService)
        {
            _theLoaiService = theLoaiService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var genres = await _theLoaiService.GetAllGenresAsync();
            return Ok(genres);
        }
    }
}
