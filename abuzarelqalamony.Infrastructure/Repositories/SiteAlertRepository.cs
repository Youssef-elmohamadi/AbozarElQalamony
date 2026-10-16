using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Repositories
{
    public class SiteAlertRepository : ISiteAlertRepository
    {
        private readonly ApplicationDbContext _context;

        public SiteAlertRepository(ApplicationDbContext context) => _context = context;

        public async Task<IReadOnlyList<SiteAlert>> GetAllAsync(CancellationToken ct = default) =>
            await _context.SiteAlerts
                .AsNoTracking()
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(ct);

        public async Task<IReadOnlyList<SiteAlert>> GetActiveAlertsAsync(CancellationToken ct = default) =>
            await _context.SiteAlerts
                .AsNoTracking()
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(ct);

        public async Task<SiteAlert?> GetByIdAsync(int id, CancellationToken ct = default) =>
            await _context.SiteAlerts
                .FirstOrDefaultAsync(a => a.Id == id, ct);

        public async Task<bool> ExistsAsync(int id, CancellationToken ct = default) =>
            await _context.SiteAlerts.AnyAsync(a => a.Id == id, ct);

        public async Task<SiteAlert> AddAsync(SiteAlert alert, CancellationToken ct = default)
        {
            await _context.SiteAlerts.AddAsync(alert, ct);
            await _context.SaveChangesAsync(ct);
            return alert;
        }

        public async Task UpdateAsync(SiteAlert alert, CancellationToken ct = default)
        {
            _context.SiteAlerts.Update(alert);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(SiteAlert alert, CancellationToken ct = default)
        {
            _context.SiteAlerts.Remove(alert);
            await _context.SaveChangesAsync(ct);
        }
    }
}
