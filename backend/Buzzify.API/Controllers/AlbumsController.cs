using Buzzify.Application.DTOs.Album;
using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AlbumsController : ControllerBase
    {
        private readonly IAlbumService _albumService;
        private readonly IArtistService _artistService;

        public AlbumsController(IAlbumService albumService, IArtistService artistService)
        {
            _albumService = albumService;
            _artistService = artistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search = null, [FromQuery] string? artistId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var pagedResult = await _albumService.GetAllAlbumsAsync(search, artistId, page, pageSize);
            return Ok(pagedResult);
        }

        [Authorize]
        [HttpGet("saved")]
        public async Task<IActionResult> GetSavedAlbums()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var saved = await _albumService.GetSavedAlbumsAsync(userId);
            return Ok(saved);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var album = await _albumService.GetAlbumByIdAsync(id, userId, userRole);
            if (album == null) return NotFound(new { error = "Album not found." });
            return Ok(album);
        }

        [Authorize]
        [HttpPost("{id}/save")]
        public async Task<IActionResult> SaveAlbum(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _albumService.SaveAlbumAsync(id, userId);
            return Ok(new { message = "Album saved successfully." });
        }

        [Authorize]
        [HttpDelete("{id}/save")]
        public async Task<IActionResult> UnsaveAlbum(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _albumService.UnsaveAlbumAsync(id, userId);
            return Ok(new { message = "Album unsaved successfully." });
        }

        [Authorize]
        [HttpGet("{id}/is-saved")]
        public async Task<IActionResult> CheckIfSaved(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var isSaved = await _albumService.IsAlbumSavedAsync(id, userId);
            return Ok(new { isSaved });
        }

        [Authorize(Roles = "admin,artist")] 
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAlbumDto createDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var artist = await _artistService.GetArtistByProfileIdAsync(userId);
            if (artist == null) return NotFound(new { error = "Artist profile not found" });

            createDto.ArtistId = artist.Id; // Gán cứng ArtistId từ token
            var created = await _albumService.CreateAlbumAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [Authorize(Roles = "admin,artist")] 
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateAlbumDto updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var artist = await _artistService.GetArtistByProfileIdAsync(userId);
            if (artist == null) return NotFound(new { error = "Artist profile not found" });

            await _albumService.UpdateAlbumAsync(id, updateDto, artist.Id);
            return NoContent();
        }

        [Authorize(Roles = "admin,artist")]
        [HttpPut("{id}/reorder-tracks")]
        public async Task<IActionResult> ReorderTracks(string id, [FromBody] List<string> songIds)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var artist = await _artistService.GetArtistByProfileIdAsync(userId);
            if (artist == null) return NotFound(new { error = "Artist profile not found" });

            // Gọi AlbumService
            await _albumService.ReorderTracksAsync(id, songIds, artist.Id);
            return NoContent();
        }

        [Authorize(Roles = "admin,artist")] 
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var artist = await _artistService.GetArtistByProfileIdAsync(userId);
            if (artist == null) return NotFound(new { error = "Artist profile not found" });

            await _albumService.DeleteAlbumAsync(id, artist.Id);
            return NoContent();
        }
        [Authorize(Roles = "artist")]
        [HttpGet("me")]
        public async Task<IActionResult> GetMyAlbums([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var artist = await _artistService.GetArtistByProfileIdAsync(userId);
            if (artist == null) return NotFound(new { error = "Artist profile not found" });

            return Ok(await _albumService.GetAllAlbumsAsync(search, artist.Id, page, pageSize));
        }
    }
}
