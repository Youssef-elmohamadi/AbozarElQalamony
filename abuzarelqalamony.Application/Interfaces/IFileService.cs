using Microsoft.AspNetCore.Http;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folderName);
        string SaveFile(IFormFile file, string folder, string name);
        void DeleteFile(string? filePath);
    }
}
