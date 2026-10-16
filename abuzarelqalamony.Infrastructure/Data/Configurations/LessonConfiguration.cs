using abuzarelqalamony.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace abuzarelqalamony.Infrastructure.Data.Configurations
{
    internal class LessonConfiguration : IEntityTypeConfiguration<Lesson>
    {
        public void Configure(EntityTypeBuilder<Lesson> builder)
        {
            builder.HasKey(l => l.Id);

            builder.Property(l => l.Title)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(l => l.Description)
                   .HasMaxLength(4000);

            builder.Property(l => l.AudioFilePath)
                   .HasMaxLength(500);

            builder.Property(l => l.VideoFilePath)
                   .HasMaxLength(500);

            builder.Property(l => l.ThumbnailPath)
                   .HasMaxLength(500);

            builder.Property(l => l.DurationInMinutes);

            builder.Property(l => l.PublishDate);

            builder.Property(l => l.CreatedAt)
                   .IsRequired();

            builder.HasOne(l => l.Category)
                   .WithMany(c => c.Lessons)
                   .HasForeignKey(l => l.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
