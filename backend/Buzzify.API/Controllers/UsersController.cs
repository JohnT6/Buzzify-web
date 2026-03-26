using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Buzzify.Application.DTOs.User;


namespace Buzzify.API.Controllers
{
    [Route("api/v1/users")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IUserService _userService;

        public ProfileController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { error = "Không tìm thấy người dùng." });

            return Ok(user);
        }

        [Authorize]
        [HttpPatch("me/playback-state")]
        public async Task<IActionResult> UpdatePlaybackState([FromBody] PlaybackStateDto state)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _userService.UpdatePlaybackStateAsync(userId, state);
            return NoContent();
        }

        [Authorize]
        [HttpPatch("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto profileDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _userService.UpdateUserProfileAsync(userId, profileDto);
            return NoContent();
        }
    }
}
