using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace abuzarelqalamony.Infrastructure.Data.Configurations
{
    internal class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(300);

            builder.Property(c => c.Type)
                   .IsRequired()
                   .HasConversion<int>()
                   .HasColumnName("Type");

            builder.Property(c => c.ParentId)
                   .IsRequired(false);

            builder.HasOne(c => c.Parent)
                   .WithMany(c => c.Children)
                   .HasForeignKey(c => c.ParentId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false);

            builder.HasIndex(c => c.Type);

            builder.HasIndex(c => c.ParentId);

            builder.HasIndex(c => new { c.Type, c.ParentId });
        }
    }
}
