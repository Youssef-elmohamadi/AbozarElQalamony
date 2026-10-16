using abuzarelqalamony.Domain.Entities;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ISiteAlertRepository
    {
        Task<IReadOnlyList<SiteAlert>> GetAllAsync(CancellationToken ct = default);
        Task<IReadOnlyList<SiteAlert>> GetActiveAlertsAsync(CancellationToken ct = default);
        Task<SiteAlert?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<SiteAlert> AddAsync(SiteAlert alert, CancellationToken ct = default);
        Task UpdateAsync(SiteAlert alert, CancellationToken ct = default);
        Task DeleteAsync(SiteAlert alert, CancellationToken ct = default);
        Task<bool> ExistsAsync(int id, CancellationToken ct = default);
    }
}
