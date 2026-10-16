namespace abuzarelqalamony.Domain.Entities
{
    public class Book
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string AuthorName { get; set; } = string.Empty;

        public string? PdfFilePath { get; set; }

        public string? CoverImagePath { get; set; }

        public DateTime? PublishDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
}
