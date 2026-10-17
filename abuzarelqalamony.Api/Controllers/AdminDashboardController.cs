using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Dashboard;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Api.Controllers
{
    [Authorize]
    [Route("api/admin/dashboard")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IServiceScopeFactory _scopeFactory;

        public AdminDashboardController(
            ApplicationDbContext context,
            IServiceScopeFactory scopeFactory)
        {
            _context = context;
            _scopeFactory = scopeFactory;
        }


        // POST /api/admin/dashboard/seed
        [HttpPost("seed")]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Seed(
            [FromServices] abuzarelqalamony.Application.Interfaces.IHashPassword passwordHasher,
            [FromQuery] bool force = false)
        {
            var summary = await DatabaseSeeder.SeedAsync(_context, passwordHasher, force);
            var response = ApiResponse<string>.SuccessResult(
                summary,
                "Database seeded successfully with Islamic content.");
            return Ok(response);
        }

        [HttpGet("stats")]
        [ProducesResponseType(typeof(ApiResponse<DashboardStatsResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetStats(CancellationToken ct)
        {
            try
            {
                var now = DateTime.UtcNow;
                var firstDayOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                Task<int> RunQueryAsync(Func<ApplicationDbContext, Task<int>> query) =>
                    Task.Run(async () =>
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        return await query(db);
                    }, ct);

                var totalCategoriesTask = RunQueryAsync(db => db.Categories.CountAsync(ct));
                var emptyCategoriesTask = RunQueryAsync(db => db.Categories
                    .CountAsync(c => !c.Books.Any() && !c.Lessons.Any() && !c.Sermons.Any() && !c.Qurans.Any(), ct));
                var totalBooksTask = RunQueryAsync(db => db.Books.CountAsync(ct));
                var totalLessonsTask = RunQueryAsync(db => db.Lessons.CountAsync(ct));
                var totalSermonsTask = RunQueryAsync(db => db.Sermons.CountAsync(ct));
                var totalArticlesTask = RunQueryAsync(db => db.Articles.CountAsync(ct));

                var booksThisMonthTask = RunQueryAsync(db => db.Books
                    .CountAsync(b => b.PublishDate >= firstDayOfMonth && b.PublishDate <= now, ct));
                var lessonsThisMonthTask = RunQueryAsync(db => db.Lessons
                    .CountAsync(l => l.PublishDate >= firstDayOfMonth && l.PublishDate <= now, ct));
                var sermonsThisMonthTask = RunQueryAsync(db => db.Sermons
                    .CountAsync(s => s.PublishDate >= firstDayOfMonth && s.PublishDate <= now, ct));
                var articlesThisMonthTask = RunQueryAsync(db => db.Articles
                    .CountAsync(a => a.PublishDate >= firstDayOfMonth && a.PublishDate <= now, ct));

                var booksScheduledTask = RunQueryAsync(db => db.Books
                    .CountAsync(b => b.PublishDate > now, ct));
                var lessonsScheduledTask = RunQueryAsync(db => db.Lessons
                    .CountAsync(l => l.PublishDate > now, ct));
                var sermonsScheduledTask = RunQueryAsync(db => db.Sermons
                    .CountAsync(s => s.PublishDate > now, ct));
                var articlesScheduledTask = RunQueryAsync(db => db.Articles
                    .CountAsync(a => a.PublishDate > now, ct));

                var videoLessonsTask = RunQueryAsync(db => db.Lessons
                    .CountAsync(l => l.VideoFilePath != null, ct));
                var audioOnlyLessonsTask = RunQueryAsync(db => db.Lessons
                    .CountAsync(l => l.VideoFilePath == null, ct));

                var totalActiveAlertsTask = RunQueryAsync(db => db.SiteAlerts
                    .CountAsync(a => a.IsActive, ct));

                await Task.WhenAll(
                    totalCategoriesTask,
                    emptyCategoriesTask,
                    totalBooksTask,
                    totalLessonsTask,
                    totalSermonsTask,
                    totalArticlesTask,
                    booksThisMonthTask,
                    lessonsThisMonthTask,
                    sermonsThisMonthTask,
                    articlesThisMonthTask,
                    booksScheduledTask,
                    lessonsScheduledTask,
                    sermonsScheduledTask,
                    articlesScheduledTask,
                    videoLessonsTask,
                    audioOnlyLessonsTask,
                    totalActiveAlertsTask
                );

                var contentAddedThisMonth = booksThisMonthTask.Result +
                                           lessonsThisMonthTask.Result +
                                           sermonsThisMonthTask.Result +
                                           articlesThisMonthTask.Result;

                var scheduledContent = booksScheduledTask.Result +
                                       lessonsScheduledTask.Result +
                                       sermonsScheduledTask.Result +
                                       articlesScheduledTask.Result;

                var stats = new DashboardStatsResponseDto
                {
                    TotalCategories = totalCategoriesTask.Result,
                    EmptyCategories = emptyCategoriesTask.Result,
                    TotalBooks = totalBooksTask.Result,
                    TotalLessons = totalLessonsTask.Result,
                    TotalSermons = totalSermonsTask.Result,
                    TotalArticles = totalArticlesTask.Result,
                    ContentAddedThisMonth = contentAddedThisMonth,
                    ScheduledContent = scheduledContent,
                    MediaStats = new MediaStatsDto
                    {
                        VideoLessons = videoLessonsTask.Result,
                        AudioOnlyLessons = audioOnlyLessonsTask.Result
                    },
                    TotalActiveAlerts = totalActiveAlertsTask.Result
                };

                var response = ApiResponse<DashboardStatsResponseDto>.SuccessResult(
                    stats, "Dashboard statistics retrieved successfully.");

                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                var response = ApiResponse<object>.FailureResult(
                    "An error occurred while retrieving dashboard statistics.",
                    "dashboard",
                    ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError);

                return StatusCode(response.StatusCode, response);
            }
        }
    }
}
