using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Sermons;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class SermonService : ISermonService
    {
        private readonly ISermonRepository _sermonRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IFileService _fileService;

        private const string UploadFolder = "uploads/sermons";

        public SermonService(
            ISermonRepository sermonRepository,
            ICategoryRepository categoryRepository,
            IFileService fileService)
        {
            _sermonRepository = sermonRepository;
            _categoryRepository = categoryRepository;
            _fileService = fileService;
        }

        public async Task<ApiResponse<PagedResult<SermonResponseDto>>> GetPagedAsync(
            SermonQueryParams query, CancellationToken ct = default)
        {
            var title = !string.IsNullOrWhiteSpace(query.Title) ? query.Title : query.Name;
            var (items, totalCount) = await _sermonRepository.GetPagedAsync(
                query.Page,
                query.PageSize,
                query.CategoryId,
                query.CategoryName,
                title,
                query.Search,
                ct);

            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<SermonResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<SermonResponseDto>>.SuccessResult(paged, "Sermons retrieved successfully.");
        }

        public async Task<ApiResponse<PagedResult<SermonResponseDto>>> GetPagedByCategoryIdAsync(
            int categoryId, SermonQueryParams query, CancellationToken ct = default)
        {
            var categoryExists = await _categoryRepository.ExistsAsync(categoryId, ct);
            if (!categoryExists)
                return ApiResponse<PagedResult<SermonResponseDto>>.FailureResult(
                    "Category not found.", "categoryId", $"Category with ID '{categoryId}' does not exist.", statusCode: 404);

            var searchTerm = !string.IsNullOrWhiteSpace(query.Title)
                ? query.Title
                : (!string.IsNullOrWhiteSpace(query.Name) ? query.Name : query.Search);

            var (items, totalCount) = await _sermonRepository.GetPagedByCategoryIdAsync(
                categoryId, query.Page, query.PageSize, searchTerm, ct);

            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<SermonResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<SermonResponseDto>>.SuccessResult(paged, "Sermons retrieved successfully.");
        }

        public async Task<ApiResponse<SermonResponseDto>> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var sermon = await _sermonRepository.GetByIdAsync(id, ct);
            if (sermon is null)
                return ApiResponse<SermonResponseDto>.FailureResult(
                    "Sermon not found.", "id", $"Sermon with ID '{id}' does not exist.", statusCode: 404);

            return ApiResponse<SermonResponseDto>.SuccessResult(MapToDto(sermon), "Sermon retrieved successfully.");
        }

        public async Task<ApiResponse<SermonResponseDto>> CreateAsync(
            CreateSermonDto dto, CancellationToken ct = default)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, ct);
            if (category is null)
                return ApiResponse<SermonResponseDto>.FailureResult(
                    "Category not found.", "CategoryId", $"No category found with ID '{dto.CategoryId}'.", statusCode: 404);

            if (category.Type != CategoryType.Sermon)
                return ApiResponse<SermonResponseDto>.FailureResult(
                    "Invalid category type.", "CategoryId", $"Category '{category.Name}' is not a Sermon category.", statusCode: 400);

            string? audioPath = null;
            string? videoPath = null;

            try
            {
                if (dto.AudioFile != null && dto.AudioFile.Length > 0)
                    audioPath = await _fileService.SaveFileAsync(dto.AudioFile, UploadFolder);

                if (dto.VideoFile != null && dto.VideoFile.Length > 0)
                    videoPath = await _fileService.SaveFileAsync(dto.VideoFile, UploadFolder);

                var sermon = new Sermon
                {
                    Title = dto.Title.Trim(),
                    Description = dto.Description?.Trim(),
                    KhutbahDate = dto.KhutbahDate,
                    PublishDate = dto.PublishDate ?? DateTime.UtcNow,
                    CategoryId = dto.CategoryId,
                    AudioFilePath = audioPath,
                    VideoFilePath = videoPath,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _sermonRepository.AddAsync(sermon, ct);
                return ApiResponse<SermonResponseDto>.SuccessResult(MapToDto(created), "Sermon created successfully.", statusCode: 201);
            }
            catch
            {
                _fileService.DeleteFile(audioPath);
                _fileService.DeleteFile(videoPath);
                throw;
            }
        }

        public async Task<ApiResponse<SermonResponseDto>> UpdateAsync(
            int id, UpdateSermonDto dto, CancellationToken ct = default)
        {
            var sermon = await _sermonRepository.GetByIdAsync(id, ct);
            if (sermon is null)
                return ApiResponse<SermonResponseDto>.FailureResult(
                    "Sermon not found.", "id", $"Sermon with ID '{id}' does not exist.", statusCode: 404);

            if (dto.CategoryId != sermon.CategoryId)
            {
                var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, ct);
                if (category is null)
                    return ApiResponse<SermonResponseDto>.FailureResult(
                        "Category not found.", "CategoryId", $"No category found with ID '{dto.CategoryId}'.", statusCode: 404);

                if (category.Type != CategoryType.Sermon)
                    return ApiResponse<SermonResponseDto>.FailureResult(
                        "Invalid category type.", "CategoryId", $"Category '{category.Name}' is not a Sermon category.", statusCode: 400);

                sermon.CategoryId = dto.CategoryId;
            }

            string? newAudioPath = null;
            string? newVideoPath = null;

            try
            {
                if (dto.AudioFile != null && dto.AudioFile.Length > 0)
                {
                    newAudioPath = await _fileService.SaveFileAsync(dto.AudioFile, UploadFolder);
                    _fileService.DeleteFile(sermon.AudioFilePath);
                    sermon.AudioFilePath = newAudioPath;
                }

                if (dto.VideoFile != null && dto.VideoFile.Length > 0)
                {
                    newVideoPath = await _fileService.SaveFileAsync(dto.VideoFile, UploadFolder);
                    _fileService.DeleteFile(sermon.VideoFilePath);
                    sermon.VideoFilePath = newVideoPath;
                }

                sermon.Title = dto.Title.Trim();
                sermon.Description = dto.Description?.Trim();
                sermon.KhutbahDate = dto.KhutbahDate;
                if (dto.PublishDate.HasValue)
                    sermon.PublishDate = dto.PublishDate.Value;

                await _sermonRepository.UpdateAsync(sermon, ct);
                return ApiResponse<SermonResponseDto>.SuccessResult(MapToDto(sermon), "Sermon updated successfully.");
            }
            catch
            {
                _fileService.DeleteFile(newAudioPath);
                _fileService.DeleteFile(newVideoPath);
                throw;
            }
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default)
        {
            var sermon = await _sermonRepository.GetByIdAsync(id, ct);
            if (sermon is null)
                return ApiResponse<object>.FailureResult(
                    "Sermon not found.", "id", $"Sermon with ID '{id}' does not exist.", statusCode: 404);

            _fileService.DeleteFile(sermon.AudioFilePath);
            _fileService.DeleteFile(sermon.VideoFilePath);

            await _sermonRepository.DeleteAsync(sermon, ct);
            return ApiResponse<object>.SuccessResult(null, "Sermon deleted successfully.");
        }

        private static SermonResponseDto MapToDto(Sermon s) => new()
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            KhutbahDate = s.KhutbahDate,
            AudioFilePath = s.AudioFilePath,
            VideoFilePath = s.VideoFilePath,
            PublishDate = s.PublishDate,
            CreatedAt = s.CreatedAt,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? string.Empty
        };
    }
}
