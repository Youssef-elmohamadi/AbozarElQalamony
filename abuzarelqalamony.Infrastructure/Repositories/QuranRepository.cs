using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Repositories
{
    public class QuranRepository : IQuranRepository
    {
        private readonly ApplicationDbContext _context;

        public QuranRepository(ApplicationDbContext context) => _context = context;

        public async Task<(IReadOnlyList<Quran> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId = null,
            string? categoryName = null,
            string? title = null,
            string? search = null,
            int? surahNumber = null,
            string? surahName = null,
            string? sort = null,
            CancellationToken ct = default)
        {
            var query = _context.Qurans
                .AsNoTracking()
                .Include(q => q.Category)
                .AsQueryable();

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(q => q.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(categoryName))
            {
                var catTerm = categoryName.Trim();
                query = query.Where(q => q.Category.Name.Contains(catTerm));
            }

            if (!string.IsNullOrWhiteSpace(title))
            {
                var titleTerm = title.Trim();
                query = query.Where(q => q.Title.Contains(titleTerm));
            }

            if (surahNumber.HasValue && surahNumber.Value > 0)
            {
                query = query.Where(q => q.SurahNumber == surahNumber.Value);
            }

            if (!string.IsNullOrWhiteSpace(surahName))
            {
                var surahTerm = surahName.Trim();
                query = query.Where(q => q.SurahName != null && q.SurahName.Contains(surahTerm));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(q => q.Title.Contains(term)
                    || (q.Description != null && q.Description.Contains(term))
                    || (q.SurahName != null && q.SurahName.Contains(term))
                    || q.Category.Name.Contains(term));
            }

            var isOldest = string.Equals(sort, "oldest", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(sort, "asc", StringComparison.OrdinalIgnoreCase);

            query = isOldest
                ? query.OrderBy(q => q.PublishDate ?? q.CreatedAt)
                : query.OrderByDescending(q => q.PublishDate ?? q.CreatedAt);

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<(IReadOnlyList<Quran> Items, int TotalCount)> GetPagedByCategoryIdAsync(
            int categoryId,
            int page,
            int pageSize,
            string? search = null,
            string? sort = null,
            CancellationToken ct = default)
        {
            var query = _context.Qurans
                .AsNoTracking()
                .Include(q => q.Category)
                .Where(q => q.CategoryId == categoryId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(q => q.Title.Contains(term)
                    || (q.Description != null && q.Description.Contains(term))
                    || (q.SurahName != null && q.SurahName.Contains(term))
                    || q.Category.Name.Contains(term));
            }

            var isOldest = string.Equals(sort, "oldest", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(sort, "asc", StringComparison.OrdinalIgnoreCase);

            query = isOldest
                ? query.OrderBy(q => q.PublishDate ?? q.CreatedAt)
                : query.OrderByDescending(q => q.PublishDate ?? q.CreatedAt);

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<Quran?> GetByIdAsync(int id, CancellationToken ct = default) =>
            await _context.Qurans
                .AsNoTracking()
                .Include(q => q.Category)
                .FirstOrDefaultAsync(q => q.Id == id, ct);

        public async Task<Quran> AddAsync(Quran quran, CancellationToken ct = default)
        {
            await _context.Qurans.AddAsync(quran, ct);
            await _context.SaveChangesAsync(ct);
            return quran;
        }

        public async Task UpdateAsync(Quran quran, CancellationToken ct = default)
        {
            _context.Qurans.Update(quran);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Quran quran, CancellationToken ct = default)
        {
            _context.Qurans.Remove(quran);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<bool> ExistsAsync(int id, CancellationToken ct = default) =>
            await _context.Qurans.AnyAsync(q => q.Id == id, ct);
    }
}
