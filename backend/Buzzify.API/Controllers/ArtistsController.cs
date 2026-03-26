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

        [HttpPost("{id}/follow")]
        public async Task<IActionResult> Follow(string id, [FromQuery] string userId)
        {
            await _artistService.FollowArtistAsync(userId, id);
            return Ok(new { message = "Followed successfully" });
        }

        [HttpPost("{id}/unfollow")]
        public async Task<IActionResult> Unfollow(string id, [FromQuery] string userId)
        {
            await _artistService.UnfollowArtistAsync(userId, id);
            return Ok(new { message = "Unfollowed successfully" });
        }

        [HttpGet("{id}/is-followed")]
        public async Task<IActionResult> IsFollowed(string id, [FromQuery] string userId)
        {
            var isFollowed = await _artistService.IsFollowingAsync(userId, id);
            return Ok(new { isFollowed });
        }

        [HttpGet("followed")]
        public async Task<IActionResult> GetFollowed([FromQuery] string userId)
        {
            var artists = await _artistService.GetFollowedArtistsAsync(userId);
            return Ok(artists);
        }

        [HttpGet("me/stats")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "artist")]
        public async Task<IActionResult> GetMyStats([FromQuery] string range = "28d")
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var artist = await _artistService.GetArtistByProfileIdAsync(userId);
            if (artist == null) return NotFound(new { error = "Artist profile not found" });

            var stats = await _artistService.GetArtistStatsAsync(artist.Id, range);
            return Ok(stats);
        }
    }
}
