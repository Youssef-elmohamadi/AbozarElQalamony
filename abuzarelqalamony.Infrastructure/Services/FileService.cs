using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public FileService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            var rootPath = _webHostEnvironment.WebRootPath
                           ?? Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");

            var normalizedFolder = folderName.Trim('/', '\\').Replace('/', Path.DirectorySeparatorChar);
            var targetFolder = Path.Combine(rootPath, normalizedFolder);

            if (!Directory.Exists(targetFolder))
                Directory.CreateDirectory(targetFolder);

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(targetFolder, fileName);

            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeFolder = folderName.Trim('/', '\\').Replace('\\', '/');
            return $"/{relativeFolder}/{fileName}";
        }

        public string SaveFile(IFormFile file, string folder, string name)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            var rootPath = _webHostEnvironment.WebRootPath
                           ?? Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");

            var normalizedFolder = folder.Trim('/', '\\').Replace('/', Path.DirectorySeparatorChar);
            var targetFolder = Path.Combine(rootPath, normalizedFolder);

            if (!Directory.Exists(targetFolder))
                Directory.CreateDirectory(targetFolder);

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{name}{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(targetFolder, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            var relativeFolder = folder.Trim('/', '\\').Replace('\\', '/');
            return $"/{relativeFolder}/{fileName}";
        }

        public void DeleteFile(string? filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                return;

            var rootPath = _webHostEnvironment.WebRootPath
                           ?? Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");

            var cleanPath = filePath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.Combine(rootPath, cleanPath);

            if (File.Exists(fullPath))
            {
                try
                {
                    File.Delete(fullPath);
                }
                catch
                {
                    // Ignore deletion errors during cleanup
                }
            }
        }
    }
}
