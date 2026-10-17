using abuzarelqalamony.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Sermon> Sermons { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<SiteAlert> SiteAlerts { get; set; }
        public DbSet<Quran> Qurans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }
}
