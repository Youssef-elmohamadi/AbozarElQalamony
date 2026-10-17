using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Quran;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class QuranService : IQuranService
    {
        private readonly IQuranRepository _quranRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IFileService _fileService;

        private const string UploadFolder = "uploads/quran";

        public QuranService(
            IQuranRepository quranRepository,
            ICategoryRepository categoryRepository,
            IFileService fileService)
        {
            _quranRepository = quranRepository;
            _categoryRepository = categoryRepository;
            _fileService = fileService;
        }

        public async Task<ApiResponse<PagedResult<QuranResponseDto>>> GetPagedAsync(
            QuranQueryParams query, CancellationToken ct = default)
        {
            var title = !string.IsNullOrWhiteSpace(query.Title) ? query.Title : query.Name;
            var (items, totalCount) = await _quranRepository.GetPagedAsync(
                query.Page,
                query.PageSize,
                query.CategoryId,
                query.CategoryName,
                title,
                query.Search,
                query.SurahNumber,
                query.SurahName,
                query.Sort,
                ct);

            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<QuranResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<QuranResponseDto>>.SuccessResult(paged, "Quran items retrieved successfully.");
        }

        public async Task<ApiResponse<PagedResult<QuranResponseDto>>> GetPagedByCategoryIdAsync(
            int categoryId, QuranQueryParams query, CancellationToken ct = default)
        {
            var categoryExists = await _categoryRepository.ExistsAsync(categoryId, ct);
            if (!categoryExists)
                return ApiResponse<PagedResult<QuranResponseDto>>.FailureResult(
                    "Category not found.", "categoryId", $"Category with ID '{categoryId}' does not exist.", statusCode: 404);

            var searchTerm = !string.IsNullOrWhiteSpace(query.Title)
                ? query.Title
                : (!string.IsNullOrWhiteSpace(query.Name) ? query.Name : query.Search);

            var (items, totalCount) = await _quranRepository.GetPagedByCategoryIdAsync(
                categoryId, query.Page, query.PageSize, searchTerm, query.Sort, ct);

            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<QuranResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<QuranResponseDto>>.SuccessResult(paged, "Quran items retrieved successfully.");
        }

        public async Task<ApiResponse<QuranResponseDto>> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var quran = await _quranRepository.GetByIdAsync(id, ct);
            if (quran is null)
                return ApiResponse<QuranResponseDto>.FailureResult(
                    "Quran item not found.", "id", $"Quran item with ID '{id}' does not exist.", statusCode: 404);

            return ApiResponse<QuranResponseDto>.SuccessResult(MapToDto(quran), "Quran item retrieved successfully.");
        }

        public async Task<ApiResponse<QuranResponseDto>> CreateAsync(
            CreateQuranDto dto, CancellationToken ct = default)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, ct);
            if (category is null)
                return ApiResponse<QuranResponseDto>.FailureResult(
                    "Category not found.", "CategoryId", $"No category found with ID '{dto.CategoryId}'.", statusCode: 404);

            if (category.Type != CategoryType.Quran)
                return ApiResponse<QuranResponseDto>.FailureResult(
                    "Invalid category type.", "CategoryId", $"Category '{category.Name}' is not a Quran category.", statusCode: 400);

            string? audioPath = null;
            string? videoPath = null;
            string? thumbnailPath = null;

            try
            {
                if (dto.AudioFile != null && dto.AudioFile.Length > 0)
                    audioPath = await _fileService.SaveFileAsync(dto.AudioFile, UploadFolder);

                if (dto.VideoFile != null && dto.VideoFile.Length > 0)
                    videoPath = await _fileService.SaveFileAsync(dto.VideoFile, UploadFolder);

                if (dto.ThumbnailFile != null && dto.ThumbnailFile.Length > 0)
                    thumbnailPath = await _fileService.SaveFileAsync(dto.ThumbnailFile, UploadFolder);

                var quran = new Quran
                {
                    Title = dto.Title.Trim(),
                    Description = dto.Description?.Trim(),
                    DurationInMinutes = dto.DurationInMinutes,
                    SurahNumber = dto.SurahNumber,
                    SurahName = dto.SurahName?.Trim(),
                    PublishDate = dto.PublishDate ?? DateTime.UtcNow,
                    CategoryId = dto.CategoryId,
                    AudioFilePath = audioPath,
                    VideoFilePath = videoPath,
                    ThumbnailPath = thumbnailPath,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _quranRepository.AddAsync(quran, ct);
                created.Category = category;
                return ApiResponse<QuranResponseDto>.SuccessResult(MapToDto(created), "Quran item created successfully.", statusCode: 201);
            }
            catch
            {
                _fileService.DeleteFile(audioPath);
                _fileService.DeleteFile(videoPath);
                _fileService.DeleteFile(thumbnailPath);
                throw;
            }
        }

        public async Task<ApiResponse<QuranResponseDto>> UpdateAsync(
            int id, UpdateQuranDto dto, CancellationToken ct = default)
        {
            var quran = await _quranRepository.GetByIdAsync(id, ct);
            if (quran is null)
                return ApiResponse<QuranResponseDto>.FailureResult(
                    "Quran item not found.", "id", $"Quran item with ID '{id}' does not exist.", statusCode: 404);

            if (dto.CategoryId != quran.CategoryId)
            {
                var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, ct);
                if (category is null)
                    return ApiResponse<QuranResponseDto>.FailureResult(
                        "Category not found.", "CategoryId", $"No category found with ID '{dto.CategoryId}'.", statusCode: 404);

                if (category.Type != CategoryType.Quran)
                    return ApiResponse<QuranResponseDto>.FailureResult(
                        "Invalid category type.", "CategoryId", $"Category '{category.Name}' is not a Quran category.", statusCode: 400);

                quran.CategoryId = dto.CategoryId;
                quran.Category = category;
            }

            string? newAudioPath = null;
            string? newVideoPath = null;
            string? newThumbnailPath = null;

            try
            {
                if (dto.AudioFile != null && dto.AudioFile.Length > 0)
                {
                    newAudioPath = await _fileService.SaveFileAsync(dto.AudioFile, UploadFolder);
                    _fileService.DeleteFile(quran.AudioFilePath);
                    quran.AudioFilePath = newAudioPath;
                }

                if (dto.VideoFile != null && dto.VideoFile.Length > 0)
                {
                    newVideoPath = await _fileService.SaveFileAsync(dto.VideoFile, UploadFolder);
                    _fileService.DeleteFile(quran.VideoFilePath);
                    quran.VideoFilePath = newVideoPath;
                }

                if (dto.ThumbnailFile != null && dto.ThumbnailFile.Length > 0)
                {
                    newThumbnailPath = await _fileService.SaveFileAsync(dto.ThumbnailFile, UploadFolder);
                    _fileService.DeleteFile(quran.ThumbnailPath);
                    quran.ThumbnailPath = newThumbnailPath;
                }

                quran.Title = dto.Title.Trim();
                quran.Description = dto.Description?.Trim();
                quran.DurationInMinutes = dto.DurationInMinutes;
                quran.SurahNumber = dto.SurahNumber;
                quran.SurahName = dto.SurahName?.Trim();
                if (dto.PublishDate.HasValue)
                    quran.PublishDate = dto.PublishDate.Value;

                await _quranRepository.UpdateAsync(quran, ct);
                return ApiResponse<QuranResponseDto>.SuccessResult(MapToDto(quran), "Quran item updated successfully.");
            }
            catch
            {
                _fileService.DeleteFile(newAudioPath);
                _fileService.DeleteFile(newVideoPath);
                _fileService.DeleteFile(newThumbnailPath);
                throw;
            }
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default)
        {
            var quran = await _quranRepository.GetByIdAsync(id, ct);
            if (quran is null)
                return ApiResponse<object>.FailureResult(
                    "Quran item not found.", "id", $"Quran item with ID '{id}' does not exist.", statusCode: 404);

            _fileService.DeleteFile(quran.AudioFilePath);
            _fileService.DeleteFile(quran.VideoFilePath);
            _fileService.DeleteFile(quran.ThumbnailPath);

            await _quranRepository.DeleteAsync(quran, ct);
            return ApiResponse<object>.SuccessResult(null, "Quran item deleted successfully.");
        }

        private static QuranResponseDto MapToDto(Quran q) => new()
        {
            Id = q.Id,
            Title = q.Title,
            Description = q.Description,
            AudioFilePath = q.AudioFilePath,
            VideoFilePath = q.VideoFilePath,
            ThumbnailPath = q.ThumbnailPath,
            DurationInMinutes = q.DurationInMinutes,
            SurahNumber = q.SurahNumber,
            SurahName = q.SurahName,
            PublishDate = q.PublishDate,
            CreatedAt = q.CreatedAt,
            CategoryId = q.CategoryId,
            CategoryName = q.Category != null ? q.Category.Name : string.Empty
        };
    }
}
