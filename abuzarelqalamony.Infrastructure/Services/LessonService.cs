using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Lessons;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class LessonService : ILessonService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IFileService _fileService;

        private const string UploadFolder = "uploads/lessons";

        public LessonService(
            ILessonRepository lessonRepository,
            ICategoryRepository categoryRepository,
            IFileService fileService)
        {
            _lessonRepository = lessonRepository;
            _categoryRepository = categoryRepository;
            _fileService = fileService;
        }

        public async Task<ApiResponse<PagedResult<LessonResponseDto>>> GetPagedAsync(
            LessonQueryParams query, CancellationToken ct = default)
        {
            var title = !string.IsNullOrWhiteSpace(query.Title) ? query.Title : query.Name;
            var (items, totalCount) = await _lessonRepository.GetPagedAsync(
                query.Page,
                query.PageSize,
                query.CategoryId,
                query.CategoryName,
                title,
                query.Search,
                query.Sort,
                ct);

            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<LessonResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<LessonResponseDto>>.SuccessResult(paged, "Lessons retrieved successfully.");
        }

        public async Task<ApiResponse<PagedResult<LessonResponseDto>>> GetPagedByCategoryIdAsync(
            int categoryId, LessonQueryParams query, CancellationToken ct = default)
        {
            var categoryExists = await _categoryRepository.ExistsAsync(categoryId, ct);
            if (!categoryExists)
                return ApiResponse<PagedResult<LessonResponseDto>>.FailureResult(
                    "Category not found.", "categoryId", $"Category with ID '{categoryId}' does not exist.", statusCode: 404);

            var searchTerm = !string.IsNullOrWhiteSpace(query.Title)
                ? query.Title
                : (!string.IsNullOrWhiteSpace(query.Name) ? query.Name : query.Search);

            var (items, totalCount) = await _lessonRepository.GetPagedByCategoryIdAsync(
                categoryId, query.Page, query.PageSize, searchTerm, query.Sort, ct);

            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<LessonResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<LessonResponseDto>>.SuccessResult(paged, "Lessons retrieved successfully.");
        }

        public async Task<ApiResponse<LessonResponseDto>> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var lesson = await _lessonRepository.GetByIdAsync(id, ct);
            if (lesson is null)
                return ApiResponse<LessonResponseDto>.FailureResult(
                    "Lesson not found.", "id", $"Lesson with ID '{id}' does not exist.", statusCode: 404);

            return ApiResponse<LessonResponseDto>.SuccessResult(MapToDto(lesson), "Lesson retrieved successfully.");
        }

        public async Task<ApiResponse<LessonResponseDto>> CreateAsync(
            CreateLessonDto dto, CancellationToken ct = default)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, ct);
            if (category is null)
                return ApiResponse<LessonResponseDto>.FailureResult(
                    "Category not found.", "CategoryId", $"No category found with ID '{dto.CategoryId}'.", statusCode: 404);

            if (category.Type != CategoryType.Lesson)
                return ApiResponse<LessonResponseDto>.FailureResult(
                    "Invalid category type.", "CategoryId", $"Category '{category.Name}' is not a Lesson category.", statusCode: 400);

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

                var lesson = new Lesson
                {
                    Title = dto.Title.Trim(),
                    Description = dto.Description?.Trim(),
                    DurationInMinutes = dto.DurationInMinutes,
                    PublishDate = dto.PublishDate ?? DateTime.UtcNow,
                    CategoryId = dto.CategoryId,
                    AudioFilePath = audioPath,
                    VideoFilePath = videoPath,
                    ThumbnailPath = thumbnailPath,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _lessonRepository.AddAsync(lesson, ct);
                return ApiResponse<LessonResponseDto>.SuccessResult(MapToDto(created), "Lesson created successfully.", statusCode: 201);
            }
            catch
            {
                _fileService.DeleteFile(audioPath);
                _fileService.DeleteFile(videoPath);
                _fileService.DeleteFile(thumbnailPath);
                throw;
            }
        }

        public async Task<ApiResponse<LessonResponseDto>> UpdateAsync(
            int id, UpdateLessonDto dto, CancellationToken ct = default)
        {
            var lesson = await _lessonRepository.GetByIdAsync(id, ct);
            if (lesson is null)
                return ApiResponse<LessonResponseDto>.FailureResult(
                    "Lesson not found.", "id", $"Lesson with ID '{id}' does not exist.", statusCode: 404);

            if (dto.CategoryId != lesson.CategoryId)
            {
                var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, ct);
                if (category is null)
                    return ApiResponse<LessonResponseDto>.FailureResult(
                        "Category not found.", "CategoryId", $"No category found with ID '{dto.CategoryId}'.", statusCode: 404);

                if (category.Type != CategoryType.Lesson)
                    return ApiResponse<LessonResponseDto>.FailureResult(
                        "Invalid category type.", "CategoryId", $"Category '{category.Name}' is not a Lesson category.", statusCode: 400);

                lesson.CategoryId = dto.CategoryId;
            }

            string? newAudioPath = null;
            string? newVideoPath = null;
            string? newThumbnailPath = null;

            try
            {
                if (dto.AudioFile != null && dto.AudioFile.Length > 0)
                {
                    newAudioPath = await _fileService.SaveFileAsync(dto.AudioFile, UploadFolder);
                    _fileService.DeleteFile(lesson.AudioFilePath);
                    lesson.AudioFilePath = newAudioPath;
                }

                if (dto.VideoFile != null && dto.VideoFile.Length > 0)
                {
                    newVideoPath = await _fileService.SaveFileAsync(dto.VideoFile, UploadFolder);
                    _fileService.DeleteFile(lesson.VideoFilePath);
                    lesson.VideoFilePath = newVideoPath;
                }

                if (dto.ThumbnailFile != null && dto.ThumbnailFile.Length > 0)
                {
                    newThumbnailPath = await _fileService.SaveFileAsync(dto.ThumbnailFile, UploadFolder);
                    _fileService.DeleteFile(lesson.ThumbnailPath);
                    lesson.ThumbnailPath = newThumbnailPath;
                }

                lesson.Title = dto.Title.Trim();
                lesson.Description = dto.Description?.Trim();
                lesson.DurationInMinutes = dto.DurationInMinutes;
                if (dto.PublishDate.HasValue)
                    lesson.PublishDate = dto.PublishDate.Value;

                await _lessonRepository.UpdateAsync(lesson, ct);
                return ApiResponse<LessonResponseDto>.SuccessResult(MapToDto(lesson), "Lesson updated successfully.");
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
            var lesson = await _lessonRepository.GetByIdAsync(id, ct);
            if (lesson is null)
                return ApiResponse<object>.FailureResult(
                    "Lesson not found.", "id", $"Lesson with ID '{id}' does not exist.", statusCode: 404);

            _fileService.DeleteFile(lesson.AudioFilePath);
            _fileService.DeleteFile(lesson.VideoFilePath);
            _fileService.DeleteFile(lesson.ThumbnailPath);

            await _lessonRepository.DeleteAsync(lesson, ct);
            return ApiResponse<object>.SuccessResult(null, "Lesson deleted successfully.");
        }

        private static LessonResponseDto MapToDto(Lesson l) => new()
        {
            Id = l.Id,
            Title = l.Title,
            Description = l.Description,
            AudioFilePath = l.AudioFilePath,
            VideoFilePath = l.VideoFilePath,
            ThumbnailPath = l.ThumbnailPath,
            DurationInMinutes = l.DurationInMinutes,
            PublishDate = l.PublishDate,
            CreatedAt = l.CreatedAt,
            CategoryId = l.CategoryId,
            CategoryName = l.Category?.Name ?? string.Empty
        };
    }
}
