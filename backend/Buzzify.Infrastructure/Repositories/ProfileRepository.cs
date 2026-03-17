using Buzzify.Core.Entities;
using Buzzify.Core.Interfaces;
using Buzzify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Buzzify.Infrastructure.Repositories
{
    public class ProfileRepository : Repository<Profile>, IProfileRepository
    {
        public ProfileRepository(BuzzifyDbContext context) : base(context)
        {
        }

        public async Task<Profile?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.Email == email);
        }

        public async Task<Profile?> GetByProviderAsync(string provider, string providerId)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.Provider == provider && p.ProviderId == providerId);
        }
    }
}
