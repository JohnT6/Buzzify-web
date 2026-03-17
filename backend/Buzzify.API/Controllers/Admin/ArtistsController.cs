using Buzzify.Application.DTOs.Artist;
using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers.Admin
{
    [Route("api/v1/Admin/Artists")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class ArtistsController : ControllerBase
    {
        private readonly IArtistService _artistService;

        public ArtistsController(IArtistService artistService)
        {
            _artistService = artistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllArtists()
        {
            var artists = await _artistService.GetAllArtistsAsync();
            return Ok(artists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArtistById(string id)
        {
            var artist = await _artistService.GetArtistByIdAsync(id);
            if (artist == null) return NotFound(new { error = "Artist not found" });
            return Ok(artist);
        }

        [HttpPost]
        public async Task<IActionResult> CreateArtist([FromBody] CreateArtistDto createDto)
        {
            var created = await _artistService.CreateArtistAsync(createDto);
            return CreatedAtAction(nameof(GetArtistById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArtist(string id, [FromBody] CreateArtistDto updateDto)
        {
            await _artistService.UpdateArtistAsync(id, updateDto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArtist(string id)
        {
            await _artistService.DeleteArtistAsync(id);
            return NoContent();
        }
    }
}
