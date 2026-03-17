using Buzzify.Application.DTOs.User;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserProfileDto>> GetAllUsersAsync();
        Task<UserProfileDto?> GetUserByIdAsync(string id);
        Task UpdateUserRoleAsync(string id, string newRole);
        Task DeleteUserAsync(string id);
    }
}
