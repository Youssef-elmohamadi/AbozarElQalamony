using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace abuzarelqalamony.Infrastructure.Repositories
{
    public class UserRepository: IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context) => _context = context;

        public async Task<User> AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            if (user.Role == null && user.RoleId > 0)
            {
                await _context.Entry(user).Reference(u => u.Role).LoadAsync();
            }
            return user;
        }

        public async Task<User?> GetByIdAsync(int id) =>
            await _context.Users.Include(u => u.Role)
                                .FirstOrDefaultAsync(u => u.Id == id);

        public async Task<IReadOnlyList<User>> GetAllAsync() =>
            await _context.Users.Include(u => u.Role).ToListAsync();

        public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? roleId = null,
            string? name = null,
            CancellationToken ct = default)
        {
            var query = _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .AsQueryable();

            if (roleId.HasValue && roleId.Value > 0)
            {
                query = query.Where(u => u.RoleId == roleId.Value);
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                var term = name.Trim();
                query = query.Where(u => u.Name.Contains(term));
            }

            var totalCount = await query.CountAsync(ct);
            var items = await query
                .OrderByDescending(u => u.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users.Include(u => u.Role)
                                .FirstOrDefaultAsync(u => u.Email == email);

        public async Task<bool> RoleExistsAsync(int roleId) =>
            await _context.Roles.AnyAsync(r => r.Id == roleId);
    }
}
