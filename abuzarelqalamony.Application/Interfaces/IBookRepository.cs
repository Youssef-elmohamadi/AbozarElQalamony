using abuzarelqalamony.Domain.Entities;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IBookRepository
    {
        Task<(IReadOnlyList<Book> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId = null,
            string? categoryName = null,
            string? title = null,
            string? authorName = null,
            string? search = null,
            string? sort = null,
            CancellationToken ct = default);

        Task<(IReadOnlyList<Book> Items, int TotalCount)> GetPagedByCategoryIdAsync(
            int categoryId,
            int page,
            int pageSize,
            string? search = null,
            string? sort = null,
            CancellationToken ct = default);
        Task<Book?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<Book> AddAsync(Book book, CancellationToken ct = default);
        Task UpdateAsync(Book book, CancellationToken ct = default);
        Task DeleteAsync(Book book, CancellationToken ct = default);
        Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    }
}
