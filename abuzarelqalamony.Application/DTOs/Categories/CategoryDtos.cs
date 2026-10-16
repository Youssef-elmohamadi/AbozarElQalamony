using abuzarelqalamony.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs.Categories
{
    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(300, ErrorMessage = "Name cannot exceed 300 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category type is required.")]
        [EnumDataType(typeof(CategoryType), ErrorMessage = "Invalid category type. Allowed values: Book (1), Lesson (2), Sermon (3), Quran (4).")]
        public CategoryType Type { get; set; }

        public int? ParentId { get; set; }
    }

    public class UpdateCategoryDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(300, ErrorMessage = "Name cannot exceed 300 characters.")]
        public string Name { get; set; } = string.Empty;

        [EnumDataType(typeof(CategoryType), ErrorMessage = "Invalid category type. Allowed values: Book (1), Lesson (2), Sermon (3), Quran (4).")]
        public CategoryType? Type { get; set; }

        public int? ParentId { get; set; }
    }

    public class CategoryQueryParams
    {
        [EnumDataType(typeof(CategoryType), ErrorMessage = "Invalid category type. Allowed values: Book (1), Lesson (2), Sermon (3), Quran (4).")]
        public CategoryType? Type { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0.")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
        public int PageSize { get; set; } = 10;

        public string? Name { get; set; }

        public string? Search { get; set; }
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public CategoryType Type { get; set; }
        public int? ParentId { get; set; }
    }

    public class CategoryWithChildrenDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public CategoryType Type { get; set; }
        public int? ParentId { get; set; }
        public List<CategoryDto> Children { get; set; } = new();
    }
}
