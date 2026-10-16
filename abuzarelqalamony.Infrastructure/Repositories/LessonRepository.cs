using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Repositories
{
    public class LessonRepository : ILessonRepository
    {
        private readonly ApplicationDbContext _context;

        public LessonRepository(ApplicationDbContext context) => _context = context;

        public async Task<(IReadOnlyList<Lesson> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId = null,
            string? categoryName = null,
            string? title = null,
            string? search = null,
            CancellationToken ct = default)
        {
            var query = _context.Lessons
                .AsNoTracking()
                .Include(l => l.Category)
                .AsQueryable();

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(l => l.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(categoryName))
            {
                var catTerm = categoryName.Trim();
                query = query.Where(l => l.Category.Name.Contains(catTerm));
            }

            if (!string.IsNullOrWhiteSpace(title))
            {
                var titleTerm = title.Trim();
                query = query.Where(l => l.Title.Contains(titleTerm));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(l => l.Title.Contains(term)
                    || (l.Description != null && l.Description.Contains(term))
                    || l.Category.Name.Contains(term));
            }

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .OrderByDescending(l => l.PublishDate ?? l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<(IReadOnlyList<Lesson> Items, int TotalCount)> GetPagedByCategoryIdAsync(
            int categoryId,
            int page,
            int pageSize,
            string? search = null,
            CancellationToken ct = default)
        {
            var query = _context.Lessons
                .AsNoTracking()
                .Include(l => l.Category)
                .Where(l => l.CategoryId == categoryId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(l => l.Title.Contains(term) || (l.Description != null && l.Description.Contains(term)));
            }

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .OrderByDescending(l => l.PublishDate ?? l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<Lesson?> GetByIdAsync(int id, CancellationToken ct = default) =>
            await _context.Lessons
                .Include(l => l.Category)
                .FirstOrDefaultAsync(l => l.Id == id, ct);

        public async Task<bool> ExistsAsync(int id, CancellationToken ct = default) =>
            await _context.Lessons.AnyAsync(l => l.Id == id, ct);

        public async Task<Lesson> AddAsync(Lesson lesson, CancellationToken ct = default)
        {
            await _context.Lessons.AddAsync(lesson, ct);
            await _context.SaveChangesAsync(ct);
            await _context.Entry(lesson).Reference(l => l.Category).LoadAsync(ct);
            return lesson;
        }

        public async Task UpdateAsync(Lesson lesson, CancellationToken ct = default)
        {
            _context.Lessons.Update(lesson);
            await _context.SaveChangesAsync(ct);
            await _context.Entry(lesson).Reference(l => l.Category).LoadAsync(ct);
        }

        public async Task DeleteAsync(Lesson lesson, CancellationToken ct = default)
        {
            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync(ct);
        }
    }
}
