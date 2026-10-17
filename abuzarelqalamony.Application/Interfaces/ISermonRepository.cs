using abuzarelqalamony.Domain.Entities;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ISermonRepository
    {
        Task<(IReadOnlyList<Sermon> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId = null,
            string? categoryName = null,
            string? title = null,
            string? search = null,
            string? sort = null,
            CancellationToken ct = default);

        Task<(IReadOnlyList<Sermon> Items, int TotalCount)> GetPagedByCategoryIdAsync(
            int categoryId,
            int page,
            int pageSize,
            string? search = null,
            string? sort = null,
            CancellationToken ct = default);
        Task<Sermon?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<Sermon> AddAsync(Sermon sermon, CancellationToken ct = default);
        Task UpdateAsync(Sermon sermon, CancellationToken ct = default);
        Task DeleteAsync(Sermon sermon, CancellationToken ct = default);
        Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    }
}
