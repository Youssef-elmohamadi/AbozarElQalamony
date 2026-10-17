using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs.Lessons
{
    public class CreateLessonDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(500, ErrorMessage = "Title cannot exceed 500 characters.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        [Range(0, 10000, ErrorMessage = "Duration must be a positive number.")]
        public int? DurationInMinutes { get; set; }

        public DateTime? PublishDate { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public int CategoryId { get; set; }

        public IFormFile? AudioFile { get; set; }
        public IFormFile? VideoFile { get; set; }
        public IFormFile? ThumbnailFile { get; set; }
    }

    public class UpdateLessonDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(500, ErrorMessage = "Title cannot exceed 500 characters.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        [Range(0, 10000, ErrorMessage = "Duration must be a positive number.")]
        public int? DurationInMinutes { get; set; }

        public DateTime? PublishDate { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public int CategoryId { get; set; }

        public IFormFile? AudioFile { get; set; }
        public IFormFile? VideoFile { get; set; }
        public IFormFile? ThumbnailFile { get; set; }
    }

    public class LessonQueryParams
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0.")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
        public int PageSize { get; set; } = 10;

        public int? CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public string? Title { get; set; }

        public string? Name { get; set; }

        public string? Search { get; set; }

        public string? Sort { get; set; }
    }

    public class LessonResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? AudioFilePath { get; set; }
        public string? VideoFilePath { get; set; }
        public string? ThumbnailPath { get; set; }
        public int? DurationInMinutes { get; set; }
        public DateTime? PublishDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
