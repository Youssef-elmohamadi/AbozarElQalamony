using abuzarelqalamony.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace abuzarelqalamony.Infrastructure.Data.Configurations
{
    internal class BookConfiguration : IEntityTypeConfiguration<Book>
    {
        public void Configure(EntityTypeBuilder<Book> builder)
        {
            builder.HasKey(b => b.Id);

            builder.Property(b => b.Title)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(b => b.AuthorName)
                   .IsRequired()
                   .HasMaxLength(300);

            builder.Property(b => b.Description)
                   .HasMaxLength(4000);

            builder.Property(b => b.CoverImagePath)
                   .HasMaxLength(500);

            builder.Property(b => b.PdfFilePath)
                   .HasMaxLength(500);

            builder.Property(b => b.PublishDate);

            builder.Property(b => b.CreatedAt)
                   .IsRequired();

            builder.HasOne(b => b.Category)
                   .WithMany(c => c.Books)
                   .HasForeignKey(b => b.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
