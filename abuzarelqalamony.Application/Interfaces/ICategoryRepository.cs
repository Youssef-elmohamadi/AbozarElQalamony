using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IReadOnlyList<Category>> GetAllAsync(CategoryType? type = null, string? search = null, CancellationToken ct = default);
        Task<(IReadOnlyList<Category> Items, int TotalCount)> GetRootByTypePagedAsync(CategoryType? type, int page, int pageSize, string? search = null, CancellationToken ct = default);
        Task<IReadOnlyList<Category>> GetChildrenAsync(int parentId, string? search = null, CancellationToken ct = default);
        Task<Category?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<bool> ExistsAsync(int id, CancellationToken ct = default);
        Task<Category> AddAsync(Category category, CancellationToken ct = default);
        Task UpdateAsync(Category category, CancellationToken ct = default);
        Task DeleteAsync(Category category, CancellationToken ct = default);
    }
}
