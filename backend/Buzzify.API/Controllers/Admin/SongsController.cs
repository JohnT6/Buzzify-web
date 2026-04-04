using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers.Admin
{
    [Route("api/v1/Admin/Songs")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class SongsController : ControllerBase
    {
        private readonly ISongService _songService;

        public SongsController(ISongService songService)
        {
            _songService = songService;
        }

        [HttpPut("{id}/ToggleMute")]
        public async Task<IActionResult> ToggleMute(string id)
        {
            await _songService.ToggleMuteSongAsync(id);
            return Ok(new { message = "Song mute status toggled." });
        }

        [HttpPut("{id}/ToggleHide")]
        public async Task<IActionResult> ToggleHide(string id)
        {
            await _songService.ToggleHideSongAsync(id);
            return Ok(new { message = "Song visibility status toggled." });
        }
    }
}
