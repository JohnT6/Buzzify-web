using Buzzify.Application.DTOs.User;
using Buzzify.Application.Interfaces;
using Buzzify.Core.Exceptions;
using Buzzify.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IProfileRepository _profileRepository;

        public UserService(IProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        public async Task<IEnumerable<UserProfileDto>> GetAllUsersAsync()
        {
            var users = await _profileRepository.GetAllAsync();
            return users.Select(u => new UserProfileDto
            {
                Id = u.Id,
                Email = u.Email,
                HoTen = u.HoTen,
                AnhDaiDien = u.AnhDaiDien,
                VaiTro = u.VaiTro ?? "user",
                IsEmailVerified = u.IsEmailVerified,
                Provider = u.Provider,
                PlaybackState = new PlaybackStateDto
                {
                    LastSongId = u.LastSongId,
                    LastQueueIds = u.LastQueueIds,
                    LastSourceInfo = u.LastSourceInfo,
                    LastPosition = u.LastPosition
                }
            });
        }

        public async Task<UserProfileDto?> GetUserByIdAsync(string id)
        {
            var u = await _profileRepository.GetByIdAsync(id);
            if (u == null) return null;

            return new UserProfileDto
            {
                Id = u.Id,
                Email = u.Email,
                HoTen = u.HoTen,
                AnhDaiDien = u.AnhDaiDien,
                VaiTro = u.VaiTro ?? "user",
                IsEmailVerified = u.IsEmailVerified,
                Provider = u.Provider,
                PlaybackState = new PlaybackStateDto
                {
                    LastSongId = u.LastSongId,
                    LastQueueIds = u.LastQueueIds,
                    LastSourceInfo = u.LastSourceInfo,
                    LastPosition = u.LastPosition
                }
            };
        }

        public async Task UpdateUserRoleAsync(string id, string newRole)
        {
            var user = await _profileRepository.GetByIdAsync(id);
            if (user == null) throw new NotFoundException("Không tìm thấy người dùng.");

            var validRoles = new[] { "admin", "artist", "user" };
            if (!validRoles.Contains(newRole.ToLower()))
            {
                throw new BadRequestException("Vai trò không hợp lệ. Phải là 'admin', 'artist' hoặc 'user'.");
            }

            user.VaiTro = newRole.ToLower();
            _profileRepository.Update(user);
            await _profileRepository.SaveChangesAsync();
        }

        public async Task UpdatePlaybackStateAsync(string userId, PlaybackStateDto state)
        {
            var user = await _profileRepository.GetByIdAsync(userId);
            if (user == null) return;

            user.LastSongId = state.LastSongId;
            user.LastQueueIds = state.LastQueueIds;
            user.LastSourceInfo = state.LastSourceInfo;
            user.LastPosition = state.LastPosition;

            _profileRepository.Update(user);
            await _profileRepository.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(string id)
        {
            var user = await _profileRepository.GetByIdAsync(id);
            if (user == null) throw new NotFoundException("Không tìm thấy người dùng.");

            // TODO: In a real app we might want to do soft-delete or handle cascades for user data
            _profileRepository.Remove(user);
            await _profileRepository.SaveChangesAsync();
        }
    }
}
