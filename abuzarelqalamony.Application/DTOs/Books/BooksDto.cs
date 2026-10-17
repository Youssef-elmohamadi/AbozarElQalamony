using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs.Books
{
    public class CreateBookDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(500, ErrorMessage = "Title cannot exceed 500 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Author name is required.")]
        [MaxLength(300, ErrorMessage = "Author name cannot exceed 300 characters.")]
        public string AuthorName { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        public DateTime? PublishDate { get; set; }

        public int? PagesCount { get; set; }
        public double? FileSizeInMB { get; set; }
        public string? TableOfContentsJson { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public int CategoryId { get; set; }

        public IFormFile? PdfFile { get; set; }
        public IFormFile? CoverImageFile { get; set; }
    }

    public class UpdateBookDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(500, ErrorMessage = "Title cannot exceed 500 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Author name is required.")]
        [MaxLength(300, ErrorMessage = "Author name cannot exceed 300 characters.")]
        public string AuthorName { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        public DateTime? PublishDate { get; set; }

        public int? PagesCount { get; set; }
        public double? FileSizeInMB { get; set; }
        public string? TableOfContentsJson { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public int CategoryId { get; set; }

        public IFormFile? PdfFile { get; set; }
        public IFormFile? CoverImageFile { get; set; }
    }

    public class BookQueryParams
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0.")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
        public int PageSize { get; set; } = 10;

        public int? CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public string? Title { get; set; }

        public string? Name { get; set; }

        public string? AuthorName { get; set; }

        public string? Search { get; set; }

        public string? Sort { get; set; }
    }

    public class BookResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? PdfFilePath { get; set; }
        public string? CoverImagePath { get; set; }
        public DateTime? PublishDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? PagesCount { get; set; }
        public double? FileSizeInMB { get; set; }
        public string? TableOfContentsJson { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
