using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Articles;
using abuzarelqalamony.Application.DTOs.Books;
using abuzarelqalamony.Application.DTOs.Categories;
using abuzarelqalamony.Application.DTOs.Lessons;
using abuzarelqalamony.Application.DTOs.Quran;
using abuzarelqalamony.Application.DTOs.Search;
using abuzarelqalamony.Application.DTOs.Sermons;
using abuzarelqalamony.Application.DTOs.SiteAlerts;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SearchService> _logger;

        public SearchService(ApplicationDbContext context, ILogger<SearchService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ApiResponse<GlobalSearchResponseDto>> GlobalSearchAsync(GlobalSearchQueryParams query, CancellationToken ct = default)
        {
            try
            {
                var term = query.Query ?? query.Q ?? query.Search ?? string.Empty;
                term = term.Trim();

                var isOldest = string.Equals(query.Sort, "oldest", StringComparison.OrdinalIgnoreCase) ||
                               string.Equals(query.Sort, "asc", StringComparison.OrdinalIgnoreCase);

                var limit = query.LimitPerSection > 0 ? query.LimitPerSection : 10;
                var section = query.Section?.Trim().ToLowerInvariant();
                var includeAll = string.IsNullOrWhiteSpace(section) || section == "all";

                var response = new GlobalSearchResponseDto
                {
                    Query = term,
                    Sort = isOldest ? "oldest" : "latest"
                };

                if (string.IsNullOrWhiteSpace(term))
                {
                    return ApiResponse<GlobalSearchResponseDto>.SuccessResult(response, "يرجى إدخال كلمة البحث.");
                }

                var now = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

                // 1. Categories (التصنيفات)
                if (includeAll || section == "categories")
                {
                    var catQuery = _context.Categories
                        .AsNoTracking()
                        .Include(c => c.Parent)
                        .Where(c => EF.Functions.Like(c.Name, $"%{term}%"));

                    catQuery = isOldest ? catQuery.OrderBy(c => c.Id) : catQuery.OrderByDescending(c => c.Id);

                    response.Categories = await catQuery
                        .Take(limit)
                        .Select(c => new CategoryDto
                        {
                            Id = c.Id,
                            Name = c.Name,
                            Type = c.Type,
                            ParentId = c.ParentId
                        })
                        .ToListAsync(ct);
                }

                // 2. Lessons (الدروس)
                if (includeAll || section == "lessons")
                {
                    var lessonQuery = _context.Lessons
                        .AsNoTracking()
                        .Include(l => l.Category)
                        .Where(l => l.PublishDate == null || l.PublishDate <= now)
                        .Where(l => EF.Functions.Like(l.Title, $"%{term}%") ||
                                    (l.Description != null && EF.Functions.Like(l.Description, $"%{term}%")) ||
                                    (l.Category != null && EF.Functions.Like(l.Category.Name, $"%{term}%")));

                    lessonQuery = isOldest
                        ? lessonQuery.OrderBy(l => l.PublishDate ?? l.CreatedAt)
                        : lessonQuery.OrderByDescending(l => l.PublishDate ?? l.CreatedAt);

                    response.Lessons = await lessonQuery
                        .Take(limit)
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
                }

                // 3. Sermons (الخطب)
                if (includeAll || section == "sermons")
                {
                    var sermonQuery = _context.Sermons
                        .AsNoTracking()
                        .Include(s => s.Category)
                        .Where(s => s.PublishDate == null || s.PublishDate <= now)
                        .Where(s => EF.Functions.Like(s.Title, $"%{term}%") ||
                                    (s.Description != null && EF.Functions.Like(s.Description, $"%{term}%")) ||
                                    (s.Category != null && EF.Functions.Like(s.Category.Name, $"%{term}%")));

                    sermonQuery = isOldest
                        ? sermonQuery.OrderBy(s => s.PublishDate ?? s.KhutbahDate)
                        : sermonQuery.OrderByDescending(s => s.PublishDate ?? s.KhutbahDate);

                    response.Sermons = await sermonQuery
                        .Take(limit)
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
                }

                // 4. Books (الكتب والمؤلفات)
                if (includeAll || section == "books")
                {
                    var bookQuery = _context.Books
                        .AsNoTracking()
                        .Include(b => b.Category)
                        .Where(b => b.PublishDate == null || b.PublishDate <= now)
                        .Where(b => EF.Functions.Like(b.Title, $"%{term}%") ||
                                    (b.Description != null && EF.Functions.Like(b.Description, $"%{term}%")) ||
                                    (b.AuthorName != null && EF.Functions.Like(b.AuthorName, $"%{term}%")) ||
                                    (b.Category != null && EF.Functions.Like(b.Category.Name, $"%{term}%")));

                    bookQuery = isOldest
                        ? bookQuery.OrderBy(b => b.PublishDate ?? b.CreatedAt)
                        : bookQuery.OrderByDescending(b => b.PublishDate ?? b.CreatedAt);

                    response.Books = await bookQuery
                        .Take(limit)
                        .Select(b => new BookResponseDto
                        {
                            Id = b.Id,
                            Title = b.Title,
                            Description = b.Description,
                            AuthorName = b.AuthorName,
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
                }

                // 5. Quran (القرآن الكريم وتدبر الآيات)
                if (includeAll || section == "quran")
                {
                    var quranQuery = _context.Qurans
                        .AsNoTracking()
                        .Include(q => q.Category)
                        .Where(q => q.PublishDate == null || q.PublishDate <= now)
                        .Where(q => EF.Functions.Like(q.Title, $"%{term}%") ||
                                    (q.Description != null && EF.Functions.Like(q.Description, $"%{term}%")) ||
                                    (q.SurahName != null && EF.Functions.Like(q.SurahName, $"%{term}%")) ||
                                    (q.Category != null && EF.Functions.Like(q.Category.Name, $"%{term}%")));

                    quranQuery = isOldest
                        ? quranQuery.OrderBy(q => q.PublishDate ?? q.CreatedAt)
                        : quranQuery.OrderByDescending(q => q.PublishDate ?? q.CreatedAt);

                    response.Quran = await quranQuery
                        .Take(limit)
                        .Select(q => new QuranResponseDto
                        {
                            Id = q.Id,
                            Title = q.Title,
                            Description = q.Description,
                            AudioFilePath = q.AudioFilePath,
                            VideoFilePath = q.VideoFilePath,
                            ThumbnailPath = q.ThumbnailPath,
                            DurationInMinutes = q.DurationInMinutes,
                            SurahNumber = q.SurahNumber,
                            SurahName = q.SurahName,
                            PublishDate = q.PublishDate,
                            CreatedAt = q.CreatedAt,
                            CategoryId = q.CategoryId,
                            CategoryName = q.Category != null ? q.Category.Name : string.Empty
                        })
                        .ToListAsync(ct);
                }

                // 6. Articles (المقالات والرسائل الدعوية)
                if (includeAll || section == "articles")
                {
                    var articleQuery = _context.Articles
                        .AsNoTracking()
                        .Where(a => a.PublishDate <= now)
                        .Where(a => EF.Functions.Like(a.Title, $"%{term}%") ||
                                    (a.Description != null && EF.Functions.Like(a.Description, $"%{term}%")) ||
                                    EF.Functions.Like(a.Body, $"%{term}%"));

                    articleQuery = isOldest
                        ? articleQuery.OrderBy(a => a.PublishDate)
                        : articleQuery.OrderByDescending(a => a.PublishDate);

                    response.Articles = await articleQuery
                        .Take(limit)
                        .Select(a => new ArticleResponseDto
                        {
                            Id = a.Id,
                            Title = a.Title,
                            Description = a.Description,
                            PublishDate = a.PublishDate,
                            CreatedAt = a.CreatedAt
                        })
                        .ToListAsync(ct);
                }

                // 7. SiteAlerts (تنبيهات وإعلانات الموقع)
                if (includeAll || section == "alerts" || section == "sitealerts")
                {
                    var alertQuery = _context.SiteAlerts
                        .AsNoTracking()
                        .Where(a => a.IsActive)
                        .Where(a => EF.Functions.Like(a.Title, $"%{term}%") ||
                                    EF.Functions.Like(a.Content, $"%{term}%"));

                    alertQuery = isOldest
                        ? alertQuery.OrderBy(a => a.CreatedAt)
                        : alertQuery.OrderByDescending(a => a.CreatedAt);

                    response.Alerts = await alertQuery
                        .Take(limit)
                        .Select(a => new SiteAlertResponseDto
                        {
                            Id = a.Id,
                            Title = a.Title,
                            Content = a.Content,
                            IsActive = a.IsActive,
                            CreatedAt = a.CreatedAt
                        })
                        .ToListAsync(ct);
                }

                response.TotalResults =
                    response.Categories.Count +
                    response.Lessons.Count +
                    response.Sermons.Count +
                    response.Books.Count +
                    response.Quran.Count +
                    response.Articles.Count +
                    response.Alerts.Count;

                return ApiResponse<GlobalSearchResponseDto>.SuccessResult(response, "تم إتمام البحث العام بنجاح.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during global search.");
                return ApiResponse<GlobalSearchResponseDto>.FailureResult("حدث خطأ أثناء إجراء البحث العام.", 500);
            }
        }
    }
}
