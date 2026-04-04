using Buzzify.Application.DTOs;
using Buzzify.Application.Interfaces;
using Buzzify.Core.Entities;
using Buzzify.Core.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.Application.Services
{
    public class TheLoaiService : ITheLoaiService
    {
        private readonly IRepository<TheLoai> _genreRepository;

        public TheLoaiService(IRepository<TheLoai> genreRepository)
        {
            _genreRepository = genreRepository;
        }

        public async Task<IEnumerable<TheLoaiDto>> GetAllGenresAsync()
        {
            var genres = await _genreRepository.GetAllAsync();
            return genres.Select(g => new TheLoaiDto
            {
                Id = g.Id,
                Ten = g.Ten,
                SearchTags = g.SearchTags
            });
        }
    }
}
