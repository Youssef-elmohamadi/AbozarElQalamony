using abuzarelqalamony.Application.DTOs.Articles;
using abuzarelqalamony.Application.DTOs.Books;
using abuzarelqalamony.Application.DTOs.Categories;
using abuzarelqalamony.Application.DTOs.Lessons;
using abuzarelqalamony.Application.DTOs.Quran;
using abuzarelqalamony.Application.DTOs.Sermons;
using abuzarelqalamony.Application.DTOs.SiteAlerts;

namespace abuzarelqalamony.Application.DTOs.Search
{
    public class GlobalSearchQueryParams
    {
        public string? Query { get; set; }
        public string? Q { get; set; }
        public string? Search { get; set; }
        public string Sort { get; set; } = "latest"; // "latest" or "oldest"
        public int LimitPerSection { get; set; } = 10;
        public string? Section { get; set; } // null or "all", "categories", "lessons", "sermons", "books", "quran", "articles", "alerts"
    }

    public class GlobalSearchResponseDto
    {
        public string Query { get; set; } = string.Empty;
        public string Sort { get; set; } = "latest";
        public int TotalResults { get; set; }

        public List<CategoryDto> Categories { get; set; } = new();
        public List<LessonResponseDto> Lessons { get; set; } = new();
        public List<SermonResponseDto> Sermons { get; set; } = new();
        public List<BookResponseDto> Books { get; set; } = new();
        public List<QuranResponseDto> Quran { get; set; } = new();
        public List<ArticleResponseDto> Articles { get; set; } = new();
        public List<SiteAlertResponseDto> Alerts { get; set; } = new();
    }
}
