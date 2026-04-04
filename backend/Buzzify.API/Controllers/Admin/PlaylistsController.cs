using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers.Admin
{
    [Route("api/v1/Admin/Playlists")]
    [ApiController]
    [Authorize(Roles = "admin")]
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
            var playlists = await _playlistService.GetAdminPlaylistsAsync();
            return Ok(playlists);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Application.DTOs.Playlist.CreatePlaylistDto createDto)
        {
            var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var created = await _playlistService.CreateAdminPlaylistAsync(createDto, userId);
            return Ok(created);
        }

        [HttpPut("{id}/ToggleFeatured")]
        public async Task<IActionResult> ToggleFeatured(string id)
        {
            await _playlistService.ToggleFeaturedPlaylistAsync(id);
            return Ok(new { message = "Playlist featured status toggled." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Application.DTOs.Playlist.CreatePlaylistDto updateDto)
        {
            await _playlistService.UpdateAdminPlaylistAsync(id, updateDto);
            return Ok(new { message = "Playlist updated successfully." });
        }

        [HttpPost("{id}/Songs/{songId}")]
        public async Task<IActionResult> AddSong(string id, string songId)
        {
            await _playlistService.AddSongToAdminPlaylistAsync(id, songId);
            return Ok(new { message = "Song added to playlist." });
        }

        [HttpDelete("{id}/Songs/{songId}")]
        public async Task<IActionResult> RemoveSong(string id, string songId)
        {
            await _playlistService.RemoveSongFromAdminPlaylistAsync(id, songId);
            return Ok(new { message = "Song removed from playlist." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlaylist(string id)
        {
            await _playlistService.DeletePlaylistAdminAsync(id);
            return NoContent();
        }
    }
}
