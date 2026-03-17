using Buzzify.Core.Entities;
using Buzzify.Core.Interfaces;
using Buzzify.Infrastructure.Data;

namespace Buzzify.Infrastructure.Repositories
{
    public class ArtistRepository : Repository<Artist>, IArtistRepository
    {
        public ArtistRepository(BuzzifyDbContext context) : base(context)
        {
        }
    }
}
