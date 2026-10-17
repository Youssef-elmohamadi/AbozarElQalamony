using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Articles;
using abuzarelqalamony.Application.DTOs.Books;
using abuzarelqalamony.Application.DTOs.Home;
using abuzarelqalamony.Application.DTOs.Lessons;
using abuzarelqalamony.Application.DTOs.Sermons;
using abuzarelqalamony.Application.DTOs.SiteAlerts;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Enums;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class HomeService : IHomeService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<HomeService> _logger;

        public HomeService(ApplicationDbContext context, ILogger<HomeService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ApiResponse<HomeResponseDto>> GetHomeDataAsync(HomeQueryParams query, CancellationToken ct = default)
        {
            try
            {
                // End of today UTC (or now + 1 day) to ensure items published on today's calendar date appear immediately regardless of local timezone differences
                var now = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

                // 1. أكثر التصنيفات محتوى (Categories with most content)
                var allCategoriesRaw = await _context.Categories
                    .AsNoTracking()
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Type,
                        c.ParentId,
                        ParentName = c.Parent != null ? c.Parent.Name : null,
                        DirectLessons = c.Lessons.Count(l => l.PublishDate == null || l.PublishDate <= now),
                        DirectSermons = c.Sermons.Count(s => s.PublishDate == null || s.PublishDate <= now),
                        DirectBooks = c.Books.Count(b => b.PublishDate == null || b.PublishDate <= now),
                        DirectQuran = c.Qurans.Count(q => q.PublishDate == null || q.PublishDate <= now)
                    })
                    .ToListAsync(ct);

                var categoryDtos = allCategoriesRaw.Select(c =>
                {
                    // Roll up child content counts if it is a root category
                    var isRoot = c.ParentId == null;
                    var childCategories = isRoot
                        ? allCategoriesRaw.Where(ch => ch.ParentId == c.Id).ToList()
                        : null;

                    var lessonsCount = c.DirectLessons + (childCategories?.Sum(ch => ch.DirectLessons) ?? 0);
                    var sermonsCount = c.DirectSermons + (childCategories?.Sum(ch => ch.DirectSermons) ?? 0);
                    var booksCount = c.DirectBooks + (childCategories?.Sum(ch => ch.DirectBooks) ?? 0);
                    var quranCount = c.DirectQuran + (childCategories?.Sum(ch => ch.DirectQuran) ?? 0);

                    return new HomeCategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Type = c.Type,
                        TypeName = GetCategoryTypeName(c.Type),
                        ParentId = c.ParentId,
                        ParentName = c.ParentName,
                        LessonsCount = lessonsCount,
                        SermonsCount = sermonsCount,
                        BooksCount = booksCount,
                        QuranCount = quranCount,
                        TotalContentCount = lessonsCount + sermonsCount + booksCount + quranCount
                    };
                })
                .Where(c => c.TotalContentCount > 0)
                .OrderByDescending(c => c.TotalContentCount)
                .Take(query.TopCategoriesCount)
                .ToList();

                // 2. أحدث الدروس (Latest Lessons)
                var latestLessons = await _context.Lessons
                    .AsNoTracking()
                    .Include(l => l.Category)
                    .Where(l => l.PublishDate == null || l.PublishDate <= now)
                    .OrderByDescending(l => l.PublishDate ?? l.CreatedAt)
                    .Take(query.LatestLessonsCount)
                    .Select(l => new LessonResponseDto
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
                        CategoryName = l.Category != null ? l.Category.Name : string.Empty
                    })
                    .ToListAsync(ct);

                _logger.LogInformation("HomeService: now={Now}, total Lessons in db={TotalCount}, latest count with filter={FilteredCount}", 
                    now, 
                    await _context.Lessons.CountAsync(ct), 
                    latestLessons.Count);

                // 3. أحدث الخطب (Latest Sermons)
                var latestSermons = await _context.Sermons
                    .AsNoTracking()
                    .Include(s => s.Category)
                    .Where(s => s.PublishDate == null || s.PublishDate <= now)
                    .OrderByDescending(s => s.KhutbahDate)
                    .Take(query.LatestSermonsCount)
                    .Select(s => new SermonResponseDto
                    {
                        Id = s.Id,
                        Title = s.Title,
                        Description = s.Description,
                        KhutbahDate = s.KhutbahDate,
                        AudioFilePath = s.AudioFilePath,
                        VideoFilePath = s.VideoFilePath,
                        PublishDate = s.PublishDate,
                        CreatedAt = s.CreatedAt,
                        CategoryId = s.CategoryId,
                        CategoryName = s.Category != null ? s.Category.Name : string.Empty
                    })
                    .ToListAsync(ct);

                // 4. أحدث الكتب (Latest Books)
                var latestBooks = await _context.Books
                    .AsNoTracking()
                    .Include(b => b.Category)
                    .Where(b => b.PublishDate == null || b.PublishDate <= now)
                    .OrderByDescending(b => b.PublishDate ?? b.CreatedAt)
                    .Take(query.LatestBooksCount)
                    .Select(b => new BookResponseDto
                    {
                        Id = b.Id,
                        Title = b.Title,
                        AuthorName = b.AuthorName,
                        Description = b.Description,
                        PdfFilePath = b.PdfFilePath,
                        CoverImagePath = b.CoverImagePath,
                        PublishDate = b.PublishDate,
                        CreatedAt = b.CreatedAt,
                        PagesCount = b.PagesCount,
                        FileSizeInMB = b.FileSizeInMB,
                        TableOfContentsJson = b.TableOfContentsJson,
                        CategoryId = b.CategoryId,
                        CategoryName = b.Category != null ? b.Category.Name : string.Empty
                    })
                    .ToListAsync(ct);

                // 5. أحدث المقالات (Latest Articles)
                var latestArticles = await _context.Articles
                    .AsNoTracking()
                    .Where(a => a.PublishDate <= now)
                    .OrderByDescending(a => a.PublishDate)
                    .Take(query.LatestArticlesCount)
                    .Select(a => new ArticleResponseDto
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Description = a.Description,
                        Body = a.Body,
                        PublishDate = a.PublishDate,
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync(ct);

                // 6. التنبيهات النشطة (Active Site Alerts)
                var activeAlerts = await _context.SiteAlerts
                    .AsNoTracking()
                    .Where(a => a.IsActive)
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(query.AlertsCount)
                    .Select(a => new SiteAlertResponseDto
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Content = a.Content,
                        IsActive = a.IsActive,
                        CreatedAt = a.CreatedAt
                    })
                    .ToListAsync(ct);

                var responseData = new HomeResponseDto
                {
                    TopCategories = categoryDtos,
                    LatestLessons = latestLessons,
                    LatestSermons = latestSermons,
                    LatestBooks = latestBooks,
                    LatestArticles = latestArticles,
                    ActiveAlerts = activeAlerts
                };

                return ApiResponse<HomeResponseDto>.SuccessResult(responseData, "Home data retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while retrieving home data for end users.");
                return ApiResponse<HomeResponseDto>.FailureResult(
                    "An error occurred while retrieving home page content.",
                    500);
            }
        }

        private static string GetCategoryTypeName(CategoryType type) => type switch
        {
            CategoryType.Book => "كتب ومؤلفات",
            CategoryType.Lesson => "دروس وسلاسل علمية",
            CategoryType.Sermon => "خطب جمعة",
            CategoryType.Quran => "تدبر القرآن الكريم",
            _ => type.ToString()
        };
    }
}
