using Buzzify.Core.Entities;
using System.Threading.Tasks;

namespace Buzzify.Core.Interfaces
{
    public interface IProfileRepository : IRepository<Profile>
    {
        Task<Profile?> GetByEmailAsync(string email);
        Task<Profile?> GetByProviderAsync(string provider, string providerId);
    }
}
