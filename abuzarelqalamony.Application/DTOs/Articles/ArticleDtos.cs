using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs.Articles
{

    public class CreateArticleDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(500, ErrorMessage = "Title cannot exceed 500 characters.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Body is required.")]
        public string Body { get; set; } = string.Empty;

        public DateTime? PublishDate { get; set; }
    }

    public class UpdateArticleDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(500, ErrorMessage = "Title cannot exceed 500 characters.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000, ErrorMessage = "Description cannot exceed 4000 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Body is required.")]
        public string Body { get; set; } = string.Empty;

        public DateTime? PublishDate { get; set; }
    }

    public class ArticleQueryParams
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0.")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
        public int PageSize { get; set; } = 10;
    }


    public class ArticleResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Body { get; set; } = string.Empty;
        public DateTime PublishDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
