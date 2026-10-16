using abuzarelqalamony.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace abuzarelqalamony.Infrastructure.Data.Configurations
{
    internal class SermonConfiguration : IEntityTypeConfiguration<Sermon>
    {
        public void Configure(EntityTypeBuilder<Sermon> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Title)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(s => s.Description)
                   .HasMaxLength(4000);

            builder.Property(s => s.KhutbahDate)
                   .IsRequired();

            builder.Property(s => s.AudioFilePath)
                   .HasMaxLength(500);

            builder.Property(s => s.VideoFilePath)
                   .HasMaxLength(500);

            builder.Property(s => s.PublishDate);

            builder.Property(s => s.CreatedAt)
                   .IsRequired();

            builder.HasOne(s => s.Category)
                   .WithMany(c => c.Sermons)
                   .HasForeignKey(s => s.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
