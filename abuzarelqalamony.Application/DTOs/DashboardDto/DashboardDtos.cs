namespace abuzarelqalamony.Application.DTOs.Dashboard
{
    public class MediaStatsDto
    {
        public int VideoLessons { get; set; }
        public int AudioOnlyLessons { get; set; }
    }

    public class DashboardStatsResponseDto
    {
        public int TotalCategories { get; set; }
        public int EmptyCategories { get; set; }
        public int TotalBooks { get; set; }
        public int TotalLessons { get; set; }
        public int TotalSermons { get; set; }
        public int TotalArticles { get; set; }
        public int ContentAddedThisMonth { get; set; }
        public int ScheduledContent { get; set; }
        public MediaStatsDto MediaStats { get; set; } = new();
        public int TotalActiveAlerts { get; set; }
    }
}
