using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Repositories
{
    public class BookRepository : IBookRepository
    {
        private readonly ApplicationDbContext _context;

        public BookRepository(ApplicationDbContext context) => _context = context;

        public async Task<(IReadOnlyList<Book> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId = null,
            string? categoryName = null,
            string? title = null,
            string? authorName = null,
            string? search = null,
            CancellationToken ct = default)
        {
            var query = _context.Books
                .AsNoTracking()
                .Include(b => b.Category)
                .AsQueryable();

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(b => b.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(categoryName))
            {
                var catTerm = categoryName.Trim();
                query = query.Where(b => b.Category.Name.Contains(catTerm));
            }

            if (!string.IsNullOrWhiteSpace(title))
            {
                var titleTerm = title.Trim();
                query = query.Where(b => b.Title.Contains(titleTerm));
            }

            if (!string.IsNullOrWhiteSpace(authorName))
            {
                var authorTerm = authorName.Trim();
                query = query.Where(b => b.AuthorName.Contains(authorTerm));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(b => b.Title.Contains(term)
                    || b.AuthorName.Contains(term)
                    || (b.Description != null && b.Description.Contains(term))
                    || b.Category.Name.Contains(term));
            }

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .OrderByDescending(b => b.PublishDate ?? b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<(IReadOnlyList<Book> Items, int TotalCount)> GetPagedByCategoryIdAsync(
            int categoryId,
            int page,
            int pageSize,
            string? search = null,
            CancellationToken ct = default)
        {
            var query = _context.Books
                .AsNoTracking()
                .Include(b => b.Category)
                .Where(b => b.CategoryId == categoryId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(b => b.Title.Contains(term)
                    || b.AuthorName.Contains(term)
                    || (b.Description != null && b.Description.Contains(term)));
            }

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .OrderByDescending(b => b.PublishDate ?? b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<Book?> GetByIdAsync(int id, CancellationToken ct = default) =>
            await _context.Books
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id, ct);

        public async Task<bool> ExistsAsync(int id, CancellationToken ct = default) =>
            await _context.Books.AnyAsync(b => b.Id == id, ct);

        public async Task<Book> AddAsync(Book book, CancellationToken ct = default)
        {
            await _context.Books.AddAsync(book, ct);
            await _context.SaveChangesAsync(ct);
            await _context.Entry(book).Reference(b => b.Category).LoadAsync(ct);
            return book;
        }

        public async Task UpdateAsync(Book book, CancellationToken ct = default)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync(ct);
            await _context.Entry(book).Reference(b => b.Category).LoadAsync(ct);
        }

        public async Task DeleteAsync(Book book, CancellationToken ct = default)
        {
            _context.Books.Remove(book);
            await _context.SaveChangesAsync(ct);
        }
    }
}
