using Buzzify.Application.DTOs.Artist;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IArtistService
    {
        Task<IEnumerable<ArtistDto>> GetAllArtistsAsync();
        Task<ArtistDto?> GetArtistByIdAsync(string id);
        Task<ArtistDto> CreateArtistAsync(CreateArtistDto createDto);
        Task UpdateArtistAsync(string id, CreateArtistDto updateDto);
        Task DeleteArtistAsync(string id);
    }
}
