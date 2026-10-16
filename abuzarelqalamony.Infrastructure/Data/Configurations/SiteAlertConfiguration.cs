using abuzarelqalamony.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace abuzarelqalamony.Infrastructure.Data.Configurations
{
    internal class SiteAlertConfiguration : IEntityTypeConfiguration<SiteAlert>
    {
        public void Configure(EntityTypeBuilder<SiteAlert> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Title)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(a => a.Content)
                   .IsRequired();

            builder.Property(a => a.IsActive)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(a => a.CreatedAt)
                   .IsRequired();

            builder.HasIndex(a => a.IsActive);
        }
    }
}
