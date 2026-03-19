using Buzzify.Application.DTOs.Artist;
using Buzzify.Application.Interfaces;
using Buzzify.Core.Entities;
using Buzzify.Core.Exceptions;
using Buzzify.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.Application.Services
{
    public class ArtistService : IArtistService
    {
        private readonly IArtistRepository _artistRepository;
        private readonly IProfileRepository _profileRepository;

        public ArtistService(IArtistRepository artistRepository, IProfileRepository profileRepository)
        {
            _artistRepository = artistRepository;
            _profileRepository = profileRepository;
        }

        public async Task<IEnumerable<ArtistDto>> GetAllArtistsAsync()
        {
            var artists = await _artistRepository.GetAllAsync();
            return artists.Select(a => new ArtistDto
            {
                Id = a.Id,
                Ten = a.Ten,
                AnhDaiDien = a.AnhDaiDien,
                ProfileId = a.ProfileId,
                FollowerCount = a.FollowerCount
            });
        }

        public async Task<ArtistDto?> GetArtistByIdAsync(string id)
        {
            var a = await _artistRepository.GetByIdAsync(id);
            if (a == null) return null;

            return new ArtistDto
            {
                Id = a.Id,
                Ten = a.Ten,
                AnhDaiDien = a.AnhDaiDien,
                ProfileId = a.ProfileId,
                FollowerCount = a.FollowerCount
            };
        }

        public async Task<ArtistDto> CreateArtistAsync(CreateArtistDto createDto)
        {
            var newArtist = new Artist
            {
                Id = Guid.NewGuid().ToString(),
                Ten = createDto.Ten,
                AnhDaiDien = createDto.AnhDaiDien,
                ProfileId = createDto.ProfileId
            };

            await _artistRepository.AddAsync(newArtist);
            await _artistRepository.SaveChangesAsync();

            return new ArtistDto
            {
                Id = newArtist.Id,
                Ten = newArtist.Ten,
                AnhDaiDien = newArtist.AnhDaiDien,
                ProfileId = newArtist.ProfileId
            };
        }

        public async Task UpdateArtistAsync(string id, CreateArtistDto updateDto)
        {
            var artist = await _artistRepository.GetByIdAsync(id);
            if (artist == null) throw new NotFoundException("Không tìm thấy nghệ sĩ.");

            artist.Ten = updateDto.Ten;
            artist.AnhDaiDien = updateDto.AnhDaiDien;
            artist.ProfileId = updateDto.ProfileId;

            _artistRepository.Update(artist);
            await _artistRepository.SaveChangesAsync();
        }

        public async Task DeleteArtistAsync(string id)
        {
            var artist = await _artistRepository.GetByIdAsync(id);
            if (artist == null) throw new NotFoundException("Không tìm thấy nghệ sĩ.");

            _artistRepository.Remove(artist);
            await _artistRepository.SaveChangesAsync();
        }

        public async Task FollowArtistAsync(string userId, string artistId)
        {
            var artist = await _artistRepository.GetArtistWithFollowersAsync(artistId);
            var user = await _profileRepository.GetByIdAsync(userId);

            if (artist != null && user != null)
            {
                if (!artist.IdNguoiDungs.Any(u => u.Id == userId))
                {
                    artist.IdNguoiDungs.Add(user);
                    artist.FollowerCount++;
                    _artistRepository.Update(artist);
                    await _artistRepository.SaveChangesAsync();
                }
            }
        }

        public async Task UnfollowArtistAsync(string userId, string artistId)
        {
            var artist = await _artistRepository.GetArtistWithFollowersAsync(artistId);
            var user = await _profileRepository.GetByIdAsync(userId);

            if (artist != null && user != null)
            {
                var follower = artist.IdNguoiDungs.FirstOrDefault(u => u.Id == userId);
                if (follower != null)
                {
                    artist.IdNguoiDungs.Remove(follower);
                    artist.FollowerCount = Math.Max(0, artist.FollowerCount - 1);
                    _artistRepository.Update(artist);
                    await _artistRepository.SaveChangesAsync();
                }
            }
        }

        public async Task<bool> IsFollowingAsync(string userId, string artistId)
        {
            var artist = await _artistRepository.GetArtistWithFollowersAsync(artistId);
            if (artist == null) return false;
            return artist.IdNguoiDungs.Any(u => u.Id == userId);
        }

        public async Task<IEnumerable<ArtistDto>> GetFollowedArtistsAsync(string userId)
        {
            var user = await _profileRepository.GetProfileWithArtistsAsync(userId);
            if (user == null) return Enumerable.Empty<ArtistDto>();

            return user.ArtistsNavigation.Select(a => new ArtistDto
            {
                Id = a.Id,
                Ten = a.Ten,
                AnhDaiDien = a.AnhDaiDien,
                ProfileId = a.ProfileId,
                FollowerCount = a.FollowerCount,
                IsFollowed = true
            });
        }
    }
}
