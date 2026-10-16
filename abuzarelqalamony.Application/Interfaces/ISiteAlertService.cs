using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.SiteAlerts;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ISiteAlertService
    {
        Task<ApiResponse<IReadOnlyList<SiteAlertResponseDto>>> GetAllAsync(CancellationToken ct = default);
        Task<ApiResponse<IReadOnlyList<SiteAlertResponseDto>>> GetActiveAlertsAsync(CancellationToken ct = default);
        Task<ApiResponse<SiteAlertResponseDto>> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ApiResponse<SiteAlertResponseDto>> CreateAsync(CreateSiteAlertDto dto, CancellationToken ct = default);
        Task<ApiResponse<SiteAlertResponseDto>> UpdateAsync(int id, UpdateSiteAlertDto dto, CancellationToken ct = default);
        Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default);
    }
}
