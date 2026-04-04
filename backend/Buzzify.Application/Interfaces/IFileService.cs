using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folderName, string? subFolder = null, string? fileName = null);
        Task<string> SaveFileFromBase64Async(string base64Data, string folderName, string? subFolder = null, string? fileName = null);
        void DeleteFile(string fileUrl);
    }
}
