using abuzarelqalamony.Domain.Entities;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IArticleRepository
    {
        Task<(IReadOnlyList<Article> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct = default);
        Task<Article?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<Article> AddAsync(Article article, CancellationToken ct = default);
        Task UpdateAsync(Article article, CancellationToken ct = default);
        Task DeleteAsync(Article article, CancellationToken ct = default);
        Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    }
}
