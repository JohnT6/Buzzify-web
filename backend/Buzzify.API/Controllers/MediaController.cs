using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly IFileService _fileService;

        public MediaController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [Authorize]
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(
            IFormFile file, 
            [FromQuery] string type = "other",
            [FromQuery] string? artistId = null,
            [FromQuery] string? albumId = null,
            [FromQuery] string? resourceId = null)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            var folder = "others";
            var subFolder = "";

            if (type == "audio")
            {
                folder = "audio";
                // audio/{artistId}/{albumId hoặc 'singles'}
                subFolder = $"{artistId ?? "unknown"}/{albumId ?? "singles"}";
            }
            else if (type == "album")
            {
                folder = "images/albums";
                // images/albums/{artistId}
                subFolder = artistId ?? "others";
            }
            else if (type == "song")
            {
                folder = "images/songs";
                // images/songs/{artistId}
                subFolder = artistId ?? "others";
            }
            else if (type == "user")
            {
                folder = "images/profiles";
            }
            else if (type == "playlist")
            {
                folder = "images/playlists";
            }
            else if (type == "image")
            {
                folder = "images/others";
            }

            // resourceId được dùng làm tên file nếu có
            var url = await _fileService.SaveFileAsync(file, folder, subFolder, resourceId);
            return Ok(new { url });
        }
    }
}
