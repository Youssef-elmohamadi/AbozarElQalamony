using abuzarelqalamony.Domain.Entities;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IQuranRepository
    {
        Task<(IReadOnlyList<Quran> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId = null,
            string? categoryName = null,
            string? title = null,
            string? search = null,
            int? surahNumber = null,
            string? surahName = null,
            string? sort = null,
            CancellationToken ct = default);

        Task<(IReadOnlyList<Quran> Items, int TotalCount)> GetPagedByCategoryIdAsync(
            int categoryId,
            int page,
            int pageSize,
            string? search = null,
            string? sort = null,
            CancellationToken ct = default);

        Task<Quran?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<Quran> AddAsync(Quran quran, CancellationToken ct = default);
        Task UpdateAsync(Quran quran, CancellationToken ct = default);
        Task DeleteAsync(Quran quran, CancellationToken ct = default);
        Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    }
}
