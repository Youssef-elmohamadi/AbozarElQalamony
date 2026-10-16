using abuzarelqalamony.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace abuzarelqalamony.Infrastructure.Data.Configurations
{
    internal class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            {
                builder.HasKey(u => u.Id);
                builder.Property(u => u.Name)
                       .IsRequired()
                       .HasMaxLength(200);
                builder.Property(u => u.Email)
                       .IsRequired()
                       .HasMaxLength(200);
                builder.HasIndex(u => u.Email)
                       .IsUnique();
                builder.Property(u => u.PasswordHash)
                       .IsRequired();
                builder.Property(u => u.ProfileImagePath)
                       .HasMaxLength(500);
            }
        }
    }
}
