using Buzzify.Application.DTOs.User;
using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Buzzify.API.Controllers.Admin
{
    [Route("api/v1/Admin/Users")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null) return NotFound(new { error = "User not found" });
            return Ok(user);
        }

        [HttpPut("{id}/Role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleDto updateRoleDto)
        {
            await _userService.UpdateUserRoleAsync(id, updateRoleDto.Role);
            return Ok(new { message = $"User role updated to '{updateRoleDto.Role}' successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            await _userService.DeleteUserAsync(id);
            return Ok(new { message = "User deleted successfully." });
        }
    }

    public class UpdateRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }
}
