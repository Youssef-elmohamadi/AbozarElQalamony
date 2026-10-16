using abuzarelqalamony.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User> AddAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task<IReadOnlyList<User>> GetAllAsync();
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> RoleExistsAsync(int roleId);
        Task<(IReadOnlyList<User> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? roleId = null,
            string? name = null,
            CancellationToken ct = default);
    }
}
