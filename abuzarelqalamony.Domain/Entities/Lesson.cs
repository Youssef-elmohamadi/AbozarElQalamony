namespace abuzarelqalamony.Domain.Entities
{
    public class Lesson
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? AudioFilePath { get; set; }

        public string? VideoFilePath { get; set; }

        public string? ThumbnailPath { get; set; }

        public int? DurationInMinutes { get; set; }

        public DateTime? PublishDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
}
