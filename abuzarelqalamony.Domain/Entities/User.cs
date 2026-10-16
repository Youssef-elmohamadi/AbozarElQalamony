using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Text;

namespace abuzarelqalamony.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string? ProfileImagePath { get; set; }

        // Foreign key to Role (one-to-many)
        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;
    }
}
