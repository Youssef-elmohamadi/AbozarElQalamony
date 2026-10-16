using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "Name is required.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address (e.g. user@example.com).")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Current password is required to verify your identity.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [MinLength(6, ErrorMessage = "New password must be at least 6 characters long.")]
    public string? NewPassword { get; set; }

    [Compare(nameof(NewPassword), ErrorMessage = "New password and confirmation password do not match.")]
    public string? ConfirmNewPassword { get; set; }

    public IFormFile? ProfileImage { get; set; }
}
