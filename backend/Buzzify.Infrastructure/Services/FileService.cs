using Buzzify.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Buzzify.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _environment;

        public FileService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folderName, string? subFolder = null, string? fileName = null)
        {
            if (file == null) return string.Empty;

            var publicPath = Path.Combine(Directory.GetCurrentDirectory(), "public");
            var folderPath = Path.Combine(publicPath, folderName);
            
            // Xử lý thư mục con phân cấp
            if (!string.IsNullOrEmpty(subFolder))
            {
                folderPath = Path.Combine(folderPath, subFolder.Replace('/', Path.DirectorySeparatorChar));
            }

            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            // Xử lý tên file (nếu không có thì dùng GUID)
            var extension = Path.GetExtension(file.FileName);
            var finalFileName = string.IsNullOrEmpty(fileName) 
                ? $"{Guid.NewGuid()}{extension}" 
                : $"{fileName}{extension}";

            var filePath = Path.Combine(folderPath, finalFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = string.IsNullOrEmpty(subFolder) 
                ? $"/{folderName}/{finalFileName}" 
                : $"/{folderName}/{subFolder.Trim('/')}/{finalFileName}";

            return relativePath;
        }

        public async Task<string> SaveFileFromBase64Async(string base64Data, string folderName, string? subFolder = null, string? fileName = null)
        {
            if (string.IsNullOrEmpty(base64Data)) return string.Empty;

            var publicPath = Path.Combine(Directory.GetCurrentDirectory(), "public");
            var folderPath = Path.Combine(publicPath, folderName);
            
            if (!string.IsNullOrEmpty(subFolder))
            {
                folderPath = Path.Combine(folderPath, subFolder.Replace('/', Path.DirectorySeparatorChar));
            }

            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            var extension = ".jpg";
            if (base64Data.Contains("image/png")) extension = ".png";
            else if (base64Data.Contains("image/gif")) extension = ".gif";
            else if (base64Data.Contains("image/webp")) extension = ".webp";

            var finalFileName = string.IsNullOrEmpty(fileName) 
                ? $"{Guid.NewGuid()}{extension}" 
                : $"{fileName}{extension}";

            var filePath = Path.Combine(folderPath, finalFileName);

            var base64Image = base64Data.Contains(",") ? base64Data.Split(',')[1] : base64Data;
            var bytes = Convert.FromBase64String(base64Image);
            await File.WriteAllBytesAsync(filePath, bytes);

            var relativePath = string.IsNullOrEmpty(subFolder) 
                ? $"/{folderName}/{finalFileName}" 
                : $"/{folderName}/{subFolder.Trim('/')}/{finalFileName}";

            return relativePath;
        }

        public void DeleteFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl) || fileUrl.StartsWith("http")) return;

            try
            {
                var publicPath = Path.Combine(Directory.GetCurrentDirectory(), "public");
                var filePath = Path.Combine(publicPath, fileUrl.TrimStart('/'));
                
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting file: {ex.Message}");
            }
        }
    }
}
