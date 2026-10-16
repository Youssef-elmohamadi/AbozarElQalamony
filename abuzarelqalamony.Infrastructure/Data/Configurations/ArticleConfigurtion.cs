using abuzarelqalamony.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace abuzarelqalamony.Infrastructure.Data.Configurations
{
    internal class ArticleConfiguration : IEntityTypeConfiguration<Article>
    {
        public void Configure(EntityTypeBuilder<Article> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Title)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(a => a.Description)
                   .HasMaxLength(4000);

            builder.Property(a => a.Body)
                   .IsRequired();

            builder.Property(a => a.PublishDate)
                   .IsRequired();

            builder.Property(a => a.CreatedAt)
                   .IsRequired();

            builder.HasIndex(a => a.PublishDate);
        }
    }
}
