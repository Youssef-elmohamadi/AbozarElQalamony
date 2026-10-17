using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Repositories
{
    public class ArticleRepository : IArticleRepository
    {
        private readonly ApplicationDbContext _context;

        public ArticleRepository(ApplicationDbContext context) => _context = context;

        public async Task<(IReadOnlyList<Article> Items, int TotalCount)> GetPagedAsync(
            int page, int pageSize, string? search = null, string? sort = null, CancellationToken ct = default)
        {
            var query = _context.Articles.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(a => a.Title.Contains(term)
                    || (a.Description != null && a.Description.Contains(term))
                    || a.Body.Contains(term));
            }

            var isOldest = string.Equals(sort, "oldest", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(sort, "asc", StringComparison.OrdinalIgnoreCase);

            query = isOldest
                ? query.OrderBy(a => a.PublishDate)
                : query.OrderByDescending(a => a.PublishDate);

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<Article?> GetByIdAsync(int id, CancellationToken ct = default) =>
            await _context.Articles
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id, ct);

        public async Task<bool> ExistsAsync(int id, CancellationToken ct = default) =>
            await _context.Articles.AnyAsync(a => a.Id == id, ct);

        public async Task<Article> AddAsync(Article article, CancellationToken ct = default)
        {
            await _context.Articles.AddAsync(article, ct);
            await _context.SaveChangesAsync(ct);
            return article;
        }

        public async Task UpdateAsync(Article article, CancellationToken ct = default)
        {
            _context.Articles.Update(article);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Article article, CancellationToken ct = default)
        {
            _context.Articles.Remove(article);
            await _context.SaveChangesAsync(ct);
        }
    }
}
