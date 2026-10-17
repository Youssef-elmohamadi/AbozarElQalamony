using abuzarelqalamony.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace abuzarelqalamony.Infrastructure.Data.Configurations
{
    internal class QuranConfiguration : IEntityTypeConfiguration<Quran>
    {
        public void Configure(EntityTypeBuilder<Quran> builder)
        {
            builder.HasKey(q => q.Id);

            builder.Property(q => q.Title)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(q => q.Description)
                   .HasMaxLength(4000);

            builder.Property(q => q.AudioFilePath)
                   .HasMaxLength(500);

            builder.Property(q => q.VideoFilePath)
                   .HasMaxLength(500);

            builder.Property(q => q.ThumbnailPath)
                   .HasMaxLength(500);

            builder.Property(q => q.SurahName)
                   .HasMaxLength(200);

            builder.Property(q => q.DurationInMinutes);
            builder.Property(q => q.SurahNumber);
            builder.Property(q => q.PublishDate);

            builder.Property(q => q.CreatedAt)
                   .IsRequired();

            builder.HasOne(q => q.Category)
                   .WithMany(c => c.Qurans)
                   .HasForeignKey(q => q.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
