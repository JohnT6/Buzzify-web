using Buzzify.Application.DTOs.Artist;
using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ArtistsController : ControllerBase
    {
        private readonly IArtistService _artistService;

        public ArtistsController(IArtistService artistService)
        {
            _artistService = artistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var artists = await _artistService.GetAllArtistsAsync();
            return Ok(artists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var artist = await _artistService.GetArtistByIdAsync(id);
            if (artist == null) return NotFound(new { error = "Artist not found" });
            return Ok(artist);
        }
    }
}
