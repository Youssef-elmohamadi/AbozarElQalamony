using abuzarelqalamony.Application.DTOs.Articles;
using abuzarelqalamony.Application.DTOs.Books;
using abuzarelqalamony.Application.DTOs.Lessons;
using abuzarelqalamony.Application.DTOs.Sermons;
using abuzarelqalamony.Application.DTOs.SiteAlerts;
using abuzarelqalamony.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs.Home
{
    public class HomeCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public CategoryType Type { get; set; }
        public string TypeName { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public int LessonsCount { get; set; }
        public int SermonsCount { get; set; }
        public int BooksCount { get; set; }
        public int QuranCount { get; set; }
        public int TotalContentCount { get; set; }
    }

    public class HomeQueryParams
    {
        [Range(1, 50, ErrorMessage = "TopCategoriesCount must be between 1 and 50.")]
        public int TopCategoriesCount { get; set; } = 6;

        [Range(1, 50, ErrorMessage = "LatestLessonsCount must be between 1 and 50.")]
        public int LatestLessonsCount { get; set; } = 6;

        [Range(1, 50, ErrorMessage = "LatestSermonsCount must be between 1 and 50.")]
        public int LatestSermonsCount { get; set; } = 6;

        [Range(1, 50, ErrorMessage = "LatestBooksCount must be between 1 and 50.")]
        public int LatestBooksCount { get; set; } = 4;

        [Range(1, 50, ErrorMessage = "LatestArticlesCount must be between 1 and 50.")]
        public int LatestArticlesCount { get; set; } = 4;

        [Range(1, 20, ErrorMessage = "AlertsCount must be between 1 and 20.")]
        public int AlertsCount { get; set; } = 5;
    }

    public class HomeResponseDto
    {
        public IReadOnlyList<HomeCategoryDto> TopCategories { get; set; } = new List<HomeCategoryDto>();
        public IReadOnlyList<LessonResponseDto> LatestLessons { get; set; } = new List<LessonResponseDto>();
        public IReadOnlyList<SermonResponseDto> LatestSermons { get; set; } = new List<SermonResponseDto>();
        public IReadOnlyList<BookResponseDto> LatestBooks { get; set; } = new List<BookResponseDto>();
        public IReadOnlyList<ArticleResponseDto> LatestArticles { get; set; } = new List<ArticleResponseDto>();
        public IReadOnlyList<SiteAlertResponseDto> ActiveAlerts { get; set; } = new List<SiteAlertResponseDto>();
    }
}
