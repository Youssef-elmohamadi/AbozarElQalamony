using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs.Sermons
{
    public class CreateSermonDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(500, ErrorMessage = "Title cannot exceed 500 characters.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Khutbah date is required.")]
        public DateTime KhutbahDate { get; set; }

        public DateTime? PublishDate { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public int CategoryId { get; set; }

        public IFormFile? AudioFile { get; set; }
        public IFormFile? VideoFile { get; set; }
    }

    public class UpdateSermonDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(500, ErrorMessage = "Title cannot exceed 500 characters.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Khutbah date is required.")]
        public DateTime KhutbahDate { get; set; }

        public DateTime? PublishDate { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public int CategoryId { get; set; }

        public IFormFile? AudioFile { get; set; }
        public IFormFile? VideoFile { get; set; }
    }

    public class SermonQueryParams
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


    public class SermonResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime KhutbahDate { get; set; }
        public string? AudioFilePath { get; set; }
        public string? VideoFilePath { get; set; }
        public DateTime? PublishDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
