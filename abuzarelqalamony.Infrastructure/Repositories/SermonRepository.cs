using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Repositories
{
    public class SermonRepository : ISermonRepository
    {
        private readonly ApplicationDbContext _context;

        public SermonRepository(ApplicationDbContext context) => _context = context;

        public async Task<(IReadOnlyList<Sermon> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId = null,
            string? categoryName = null,
            string? title = null,
            string? search = null,
            CancellationToken ct = default)
        {
            var query = _context.Sermons
                .AsNoTracking()
                .Include(s => s.Category)
                .AsQueryable();

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(s => s.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(categoryName))
            {
                var catTerm = categoryName.Trim();
                query = query.Where(s => s.Category.Name.Contains(catTerm));
            }

            if (!string.IsNullOrWhiteSpace(title))
            {
                var titleTerm = title.Trim();
                query = query.Where(s => s.Title.Contains(titleTerm));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(s => s.Title.Contains(term)
                    || (s.Description != null && s.Description.Contains(term))
                    || s.Category.Name.Contains(term));
            }

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .OrderByDescending(s => s.KhutbahDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<(IReadOnlyList<Sermon> Items, int TotalCount)> GetPagedByCategoryIdAsync(
            int categoryId,
            int page,
            int pageSize,
            string? search = null,
            CancellationToken ct = default)
        {
            var query = _context.Sermons
                .AsNoTracking()
                .Include(s => s.Category)
                .Where(s => s.CategoryId == categoryId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(s => s.Title.Contains(term)
                    || (s.Description != null && s.Description.Contains(term)));
            }

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .OrderByDescending(s => s.KhutbahDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<Sermon?> GetByIdAsync(int id, CancellationToken ct = default) =>
            await _context.Sermons
                .Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.Id == id, ct);

        public async Task<bool> ExistsAsync(int id, CancellationToken ct = default) =>
            await _context.Sermons.AnyAsync(s => s.Id == id, ct);

        public async Task<Sermon> AddAsync(Sermon sermon, CancellationToken ct = default)
        {
            await _context.Sermons.AddAsync(sermon, ct);
            await _context.SaveChangesAsync(ct);
            await _context.Entry(sermon).Reference(s => s.Category).LoadAsync(ct);
            return sermon;
        }

        public async Task UpdateAsync(Sermon sermon, CancellationToken ct = default)
        {
            _context.Sermons.Update(sermon);
            await _context.SaveChangesAsync(ct);
            await _context.Entry(sermon).Reference(s => s.Category).LoadAsync(ct);
        }

        public async Task DeleteAsync(Sermon sermon, CancellationToken ct = default)
        {
            _context.Sermons.Remove(sermon);
            await _context.SaveChangesAsync(ct);
        }
    }
}
