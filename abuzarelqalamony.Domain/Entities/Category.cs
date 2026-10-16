using abuzarelqalamony.Domain.Enums;

namespace abuzarelqalamony.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public CategoryType Type { get; set; }
        public int? ParentId { get; set; }
        public Category? Parent { get; set; }
        public ICollection<Category> Children { get; set; } = new List<Category>();

        public ICollection<Book> Books { get; set; } = new List<Book>();
        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
        public ICollection<Sermon> Sermons { get; set; } = new List<Sermon>();
    }
}
