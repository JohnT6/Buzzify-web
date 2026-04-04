using Buzzify.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface ITheLoaiService
    {
        Task<IEnumerable<TheLoaiDto>> GetAllGenresAsync();
    }
}
