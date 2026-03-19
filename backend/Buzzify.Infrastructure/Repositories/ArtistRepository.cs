using Buzzify.Core.Entities;
using Buzzify.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Buzzify.Infrastructure.Data;

namespace Buzzify.Infrastructure.Repositories
{
    public class ArtistRepository : Repository<Artist>, IArtistRepository
    {
        public ArtistRepository(BuzzifyDbContext context) : base(context)
        {
        }

        public async Task<Artist?> GetArtistWithFollowersAsync(string id)
        {
            return await _dbSet
                .Include(a => a.IdNguoiDungs)
                .FirstOrDefaultAsync(a => a.Id == id);
        }
    }
}
