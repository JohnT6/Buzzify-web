using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Buzzify.Application.Interfaces
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folderName);
        Task<string> SaveFileFromBase64Async(string base64Data, string folderName);
        void DeleteFile(string fileUrl);
    }
}
