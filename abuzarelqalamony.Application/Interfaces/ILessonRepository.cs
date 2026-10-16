using abuzarelqalamony.Domain.Entities;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ILessonRepository
    {
        Task<(IReadOnlyList<Lesson> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId = null,
            string? categoryName = null,
            string? title = null,
            string? search = null,
            CancellationToken ct = default);

        Task<(IReadOnlyList<Lesson> Items, int TotalCount)> GetPagedByCategoryIdAsync(
            int categoryId,
            int page,
            int pageSize,
            string? search = null,
            CancellationToken ct = default);
        Task<Lesson?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<Lesson> AddAsync(Lesson lesson, CancellationToken ct = default);
        Task UpdateAsync(Lesson lesson, CancellationToken ct = default);
        Task DeleteAsync(Lesson lesson, CancellationToken ct = default);
        Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    }
}
