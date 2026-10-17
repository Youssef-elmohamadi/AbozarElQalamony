using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs.Quran
{
    public class CreateQuranDto
    {
        [Required(ErrorMessage = "العنوان مطلوب.")]
        [MaxLength(500, ErrorMessage = "العنوان لا يمكن أن يتجاوز 500 حرف.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "الوصف لا يمكن أن يتجاوز 4000 حرف.")]
        public string? Description { get; set; }

        [Range(0, 10000, ErrorMessage = "المدة يجب أن تكون رقماً موجباً.")]
        public int? DurationInMinutes { get; set; }

        [Range(1, 114, ErrorMessage = "رقم السورة يجب أن يكون بين 1 و 114.")]
        public int? SurahNumber { get; set; }

        [MaxLength(200, ErrorMessage = "اسم السورة لا يمكن أن يتجاوز 200 حرف.")]
        public string? SurahName { get; set; }

        public DateTime? PublishDate { get; set; }

        [Required(ErrorMessage = "التصنيف مطلوب.")]
        public int CategoryId { get; set; }

        public IFormFile? AudioFile { get; set; }
        public IFormFile? VideoFile { get; set; }
        public IFormFile? ThumbnailFile { get; set; }
    }

    public class UpdateQuranDto
    {
        [Required(ErrorMessage = "العنوان مطلوب.")]
        [MaxLength(500, ErrorMessage = "العنوان لا يمكن أن يتجاوز 500 حرف.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "الوصف لا يمكن أن يتجاوز 4000 حرف.")]
        public string? Description { get; set; }

        [Range(0, 10000, ErrorMessage = "المدة يجب أن تكون رقماً موجباً.")]
        public int? DurationInMinutes { get; set; }

        [Range(1, 114, ErrorMessage = "رقم السورة يجب أن يكون بين 1 و 114.")]
        public int? SurahNumber { get; set; }

        [MaxLength(200, ErrorMessage = "اسم السورة لا يمكن أن يتجاوز 200 حرف.")]
        public string? SurahName { get; set; }

        public DateTime? PublishDate { get; set; }

        [Required(ErrorMessage = "التصنيف مطلوب.")]
        public int CategoryId { get; set; }

        public IFormFile? AudioFile { get; set; }
        public IFormFile? VideoFile { get; set; }
        public IFormFile? ThumbnailFile { get; set; }
    }

    public class QuranQueryParams
    {
        [Range(1, int.MaxValue, ErrorMessage = "رقم الصفحة يجب أن يكون أكبر من 0.")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "حجم الصفحة يجب أن يكون بين 1 و 100.")]
        public int PageSize { get; set; } = 10;

        public int? CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public string? Title { get; set; }

        public string? Name { get; set; }

        public string? Search { get; set; }

        public int? SurahNumber { get; set; }

        public string? SurahName { get; set; }

        // Sort: "latest" (default) or "oldest"
        public string? Sort { get; set; }
    }

    public class QuranResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? AudioFilePath { get; set; }
        public string? VideoFilePath { get; set; }
        public string? ThumbnailPath { get; set; }
        public int? DurationInMinutes { get; set; }
        public int? SurahNumber { get; set; }
        public string? SurahName { get; set; }
        public DateTime? PublishDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
