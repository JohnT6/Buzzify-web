using Buzzify.Application.DTOs.User;
using Buzzify.Application.Interfaces;
using Buzzify.Core.Exceptions;
using Buzzify.Core.Entities;
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
        private readonly IArtistRepository _artistRepository;
        private readonly IFileService _fileService;

        public UserService(IProfileRepository profileRepository, IArtistRepository artistRepository, IFileService fileService)
        {
            _profileRepository = profileRepository;
            _artistRepository = artistRepository;
            _fileService = fileService;
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
                Bio = u.Bio,
                Link = u.Link,
                AnhDaiDienProvider = u.AnhDaiDienProvider,
                IsLocked = u.IsLocked,
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
                Bio = u.Bio,
                Link = u.Link,
                AnhDaiDienProvider = u.AnhDaiDienProvider,
                IsLocked = u.IsLocked,
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

            // Nếu vai trò mới là artist, đảm bảo có bản ghi trong bảng Artists
            if (user.VaiTro == "artist")
            {
                var existingArtist = await _artistRepository.GetAllAsync(); // Check if this user is already an artist
                var artists = existingArtist.Where(a => a.ProfileId == id).ToList();
                
                if (!artists.Any())
                {
                    var newArtist = new Artist
                    {
                        Id = Guid.NewGuid().ToString(),
                        Ten = user.HoTen ?? "Nghệ sĩ mới",
                        ProfileId = user.Id,
                        FollowerCount = 0,
                        AnhDaiDien = user.AnhDaiDien
                    };
                    await _artistRepository.AddAsync(newArtist);
                }
            }

            _profileRepository.Update(user);
            await _profileRepository.SaveChangesAsync();
            await _artistRepository.SaveChangesAsync();
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

            // Xóa ảnh đại diện vật lý nếu có
            if (!string.IsNullOrEmpty(user.AnhDaiDien))
            {
                _fileService.DeleteFile(user.AnhDaiDien);
            }

            _profileRepository.Remove(user);
            await _profileRepository.SaveChangesAsync();
        }

        public async Task ToggleUserLockAsync(string id)
        {
            var user = await _profileRepository.GetByIdAsync(id);
            if (user == null) throw new NotFoundException("Không tìm thấy người dùng.");
            
            user.IsLocked = !user.IsLocked;
            _profileRepository.Update(user);
            await _profileRepository.SaveChangesAsync();
        }
        
        public async Task UpdateUserProfileAsync(string userId, UpdateUserProfileDto profileDto)
        {
            var user = await _profileRepository.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException("Không tìm thấy người dùng.");

            user.HoTen = profileDto.HoTen ?? user.HoTen;
            user.Bio = profileDto.Bio; // Có thể NULL
            user.Link = profileDto.Link; // Có thể NULL
            
            // Xử lý ảnh đại diện
            if (profileDto.AnhDaiDien != null)
            {
                if (string.IsNullOrEmpty(profileDto.AnhDaiDien))
                {
                    // Người dùng bấm "Xoá": gán null để hệ thống tự biết dùng provider image hoặc UI avatar
                    if (!string.IsNullOrEmpty(user.AnhDaiDien)) _fileService.DeleteFile(user.AnhDaiDien);
                    user.AnhDaiDien = null;
                }
                else if (profileDto.AnhDaiDien.StartsWith("data:image"))
                {
                    // Upload ảnh mới (Base64)
                    if (!string.IsNullOrEmpty(user.AnhDaiDien)) _fileService.DeleteFile(user.AnhDaiDien);
                    user.AnhDaiDien = await _fileService.SaveFileFromBase64Async(profileDto.AnhDaiDien, "images/profiles");
                }
            }

            _profileRepository.Update(user);
            await _profileRepository.SaveChangesAsync();
        }
    }
}
