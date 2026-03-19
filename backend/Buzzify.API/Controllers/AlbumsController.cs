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

        public AlbumsController(IAlbumService albumService)
        {
            _albumService = albumService;
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
            var album = await _albumService.GetAlbumByIdAsync(id);
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


        [Authorize(Roles = "admin")] 
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAlbumDto createDto)
        {
            var created = await _albumService.CreateAlbumAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [Authorize(Roles = "admin")] 
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateAlbumDto updateDto)
        {
            await _albumService.UpdateAlbumAsync(id, updateDto);
            return NoContent();
        }

        [Authorize(Roles = "admin")] 
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _albumService.DeleteAlbumAsync(id);
            return NoContent();
        }
    }
}
