using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Categories;
using abuzarelqalamony.Domain.Enums;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<ApiResponse<IEnumerable<CategoryDto>>> GetAllAsync(CategoryType? type = null, string? search = null, CancellationToken ct = default);
        Task<ApiResponse<PagedResult<CategoryWithChildrenDto>>> GetRootCategoriesAsync(CategoryQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<IEnumerable<CategoryDto>>> GetChildrenAsync(int parentId, string? search = null, CancellationToken ct = default);
        Task<ApiResponse<CategoryDto>> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ApiResponse<CategoryDto>> CreateAsync(CreateCategoryDto dto, CancellationToken ct = default);
        Task<ApiResponse<CategoryDto>> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken ct = default);
        Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default);
    }
}
