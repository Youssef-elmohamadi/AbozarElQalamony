using System.ComponentModel.DataAnnotations;

namespace abuzarelqalamony.Application.DTOs
{
    public class UserQueryParams
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0.")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
        public int PageSize { get; set; } = 10;

        public int? RoleId { get; set; }

        public string? Name { get; set; }

        public string? Search { get; set; }
    }
}
