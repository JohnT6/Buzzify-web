using Buzzify.Application.DTOs.Song;
using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SongsController : ControllerBase
    {
        private readonly ISongService _songService;
        private readonly IArtistService _artistService;

        public SongsController(ISongService songService, IArtistService artistService)
        {
            _songService = songService;
            _artistService = artistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search = null, [FromQuery] string? artistId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var pagedResult = await _songService.GetAllSongsAsync(search, artistId, page, pageSize);
            return Ok(pagedResult);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var song = await _songService.GetSongByIdAsync(id);
            if (song == null) return NotFound(new { error = "Song not found." });
            return Ok(song);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSongDto createDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(string.IsNullOrEmpty(userId)) return Unauthorized();

            var createdSong = await _songService.CreateSongAsync(createDto, userId);
            return CreatedAtAction(nameof(GetById), new { id = createdSong.Id }, createdSong);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateSongDto updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _songService.UpdateSongAsync(id, updateDto, userId);
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _songService.DeleteSongAsync(id, userId);
            return NoContent();
        }

        [HttpPost("{id}/play")]
        public async Task<IActionResult> Play(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _songService.IncrementPlayCountAsync(id, userId);
            return Ok();
        }
        [Authorize(Roles = "artist")]
        [HttpGet("me")]
        public async Task<IActionResult> GetMySongs([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var artist = await _artistService.GetArtistByProfileIdAsync(userId);
            if (artist == null) return NotFound(new { error = "Artist profile not found" });

            var pagedResult = await _songService.GetSongsByArtistAsync(artist.Id, search, page, pageSize, true); 
            
            return Ok(pagedResult);
        }
    }
}
