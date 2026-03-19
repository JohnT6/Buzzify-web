using Buzzify.Application.DTOs.Playlist;
using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PlaylistsController : ControllerBase
    {
        private readonly IPlaylistService _playlistService;

        public PlaylistsController(IPlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var playlists = await _playlistService.GetAllPlaylistsAsync();
            return Ok(playlists);
        }

        [Authorize]
        [HttpGet("liked")]
        public async Task<IActionResult> GetLiked()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var liked = await _playlistService.GetLikedSongsPlaylistAsync(userId);
            return Ok(liked);
        }

        [Authorize]
        [HttpGet("saved")]
        public async Task<IActionResult> GetSavedPlaylists()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var saved = await _playlistService.GetSavedPlaylistsAsync(userId);
            return Ok(saved);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPlaylists()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var playlists = await _playlistService.GetPlaylistsByUserAsync(userId);
            return Ok(playlists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var playlist = await _playlistService.GetPlaylistByIdAsync(id);
            if (playlist == null) return NotFound(new { error = "Playlist not found." });
            return Ok(playlist);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePlaylistDto createDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var created = await _playlistService.CreatePlaylistAsync(createDto, userId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreatePlaylistDto updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _playlistService.UpdatePlaylistAsync(id, updateDto, userId);
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _playlistService.DeletePlaylistAsync(id, userId);
            return NoContent();
        }

        [Authorize]
        [HttpPost("{playlistId}/Songs/{songId}")]
        public async Task<IActionResult> AddSongToPlaylist(string playlistId, string songId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _playlistService.AddSongToPlaylistAsync(playlistId, songId, userId);
            return Ok(new { message = "Song added to playlist successfully." });
        }

        [Authorize]
        [HttpDelete("{playlistId}/Songs/{songId}")]
        public async Task<IActionResult> RemoveSongFromPlaylist(string playlistId, string songId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _playlistService.RemoveSongFromPlaylistAsync(playlistId, songId, userId);
            return Ok(new { message = "Song removed from playlist successfully." });
        }

        [Authorize]
        [HttpPost("{id}/save")]
        public async Task<IActionResult> SavePlaylist(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _playlistService.SavePlaylistAsync(id, userId);
            return Ok(new { message = "Playlist saved successfully." });
        }

        [Authorize]
        [HttpDelete("{id}/save")]
        public async Task<IActionResult> UnsavePlaylist(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _playlistService.UnsavePlaylistAsync(id, userId);
            return Ok(new { message = "Playlist unsaved successfully." });
        }

        [Authorize]
        [HttpGet("{id}/is-saved")]
        public async Task<IActionResult> CheckIfSaved(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var isSaved = await _playlistService.IsPlaylistSavedAsync(id, userId);
            return Ok(new { isSaved });
        }

    }
}
