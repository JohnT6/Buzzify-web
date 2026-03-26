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
        public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string type = "other")
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            // Mapping folder dựa trên type
            var folder = "images/others";
            if (type == "audio") folder = "audio";
            else if (type == "album") folder = "images/albums";
            else if (type == "song") folder = "images/songs";
            else if (type == "user") folder = "images/profiles";
            else if (type == "playlist") folder = "images/playlists";
            else if (type == "image") folder = "images/others";

            var url = await _fileService.SaveFileAsync(file, folder);
            return Ok(new { url });
        }
    }
}
