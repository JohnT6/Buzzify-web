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

        public ArtistService(IArtistRepository artistRepository)
        {
            _artistRepository = artistRepository;
        }

        public async Task<IEnumerable<ArtistDto>> GetAllArtistsAsync()
        {
            var artists = await _artistRepository.GetAllAsync();
            return artists.Select(a => new ArtistDto
            {
                Id = a.Id,
                Ten = a.Ten,
                AnhDaiDien = a.AnhDaiDien,
                ProfileId = a.ProfileId
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
                ProfileId = a.ProfileId
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
    }
}
