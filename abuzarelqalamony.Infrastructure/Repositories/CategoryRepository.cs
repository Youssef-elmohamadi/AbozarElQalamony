using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryRepository(ApplicationDbContext context) => _context = context;

        public async Task<IReadOnlyList<Category>> GetAllAsync(CategoryType? type = null, string? search = null, CancellationToken ct = default)
        {
            var query = _context.Categories.AsNoTracking();

            if (type.HasValue)
                query = query.Where(c => c.Type == type.Value);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(c => c.Name.Contains(term));
            }

            return await query
                .OrderBy(c => c.Type)
                .ThenBy(c => c.Name)
                .ToListAsync(ct);
        }

        public async Task<(IReadOnlyList<Category> Items, int TotalCount)> GetRootByTypePagedAsync(
            CategoryType? type, int page, int pageSize, string? search = null, CancellationToken ct = default)
        {
            var query = _context.Categories
                .AsNoTracking()
                .Where(c => c.ParentId == null);

            if (type.HasValue)
            {
                query = query.Where(c => c.Type == type.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(c => c.Name.Contains(term) || c.Children.Any(ch => ch.Name.Contains(term)));
            }

            query = query
                .Include(c => c.Children)
                .OrderBy(c => c.Name);

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<IReadOnlyList<Category>> GetChildrenAsync(int parentId, string? search = null, CancellationToken ct = default)
        {
            var query = _context.Categories
                .AsNoTracking()
                .Where(c => c.ParentId == parentId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(c => c.Name.Contains(term));
            }

            return await query
                .OrderBy(c => c.Name)
                .ToListAsync(ct);
        }

        public async Task<Category?> GetByIdAsync(int id, CancellationToken ct = default) =>
            await _context.Categories
                .AsNoTracking()
                .Include(c => c.Children)
                .FirstOrDefaultAsync(c => c.Id == id, ct);

        public async Task<bool> ExistsAsync(int id, CancellationToken ct = default) =>
            await _context.Categories.AnyAsync(c => c.Id == id, ct);

        public async Task<Category> AddAsync(Category category, CancellationToken ct = default)
        {
            await _context.Categories.AddAsync(category, ct);
            await _context.SaveChangesAsync(ct);
            return category;
        }

        public async Task UpdateAsync(Category category, CancellationToken ct = default)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Category category, CancellationToken ct = default)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync(ct);
        }
    }
}
