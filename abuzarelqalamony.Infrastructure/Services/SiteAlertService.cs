using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.SiteAlerts;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class SiteAlertService : ISiteAlertService
    {
        private readonly ISiteAlertRepository _siteAlertRepository;

        public SiteAlertService(ISiteAlertRepository siteAlertRepository)
        {
            _siteAlertRepository = siteAlertRepository;
        }

        public async Task<ApiResponse<IReadOnlyList<SiteAlertResponseDto>>> GetAllAsync(CancellationToken ct = default)
        {
            var alerts = await _siteAlertRepository.GetAllAsync(ct);
            var dtos = alerts.Select(MapToDto).ToList();

            return ApiResponse<IReadOnlyList<SiteAlertResponseDto>>.SuccessResult(
                dtos, "Site alerts retrieved successfully.");
        }

        public async Task<ApiResponse<IReadOnlyList<SiteAlertResponseDto>>> GetActiveAlertsAsync(CancellationToken ct = default)
        {
            var alerts = await _siteAlertRepository.GetActiveAlertsAsync(ct);
            var dtos = alerts.Select(MapToDto).ToList();

            return ApiResponse<IReadOnlyList<SiteAlertResponseDto>>.SuccessResult(
                dtos, "Active site alerts retrieved successfully.");
        }

        public async Task<ApiResponse<SiteAlertResponseDto>> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var alert = await _siteAlertRepository.GetByIdAsync(id, ct);
            if (alert is null)
                return ApiResponse<SiteAlertResponseDto>.FailureResult(
                    "Site alert not found.", "id", $"Site alert with ID '{id}' does not exist.", statusCode: 404);

            return ApiResponse<SiteAlertResponseDto>.SuccessResult(
                MapToDto(alert), "Site alert retrieved successfully.");
        }

        public async Task<ApiResponse<SiteAlertResponseDto>> CreateAsync(
            CreateSiteAlertDto dto, CancellationToken ct = default)
        {
            var alert = new SiteAlert
            {
                Title = dto.Title.Trim(),
                Content = dto.Content,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _siteAlertRepository.AddAsync(alert, ct);
            return ApiResponse<SiteAlertResponseDto>.SuccessResult(
                MapToDto(created), "Site alert created successfully.", statusCode: 201);
        }

        public async Task<ApiResponse<SiteAlertResponseDto>> UpdateAsync(
            int id, UpdateSiteAlertDto dto, CancellationToken ct = default)
        {
            var alert = await _siteAlertRepository.GetByIdAsync(id, ct);
            if (alert is null)
                return ApiResponse<SiteAlertResponseDto>.FailureResult(
                    "Site alert not found.", "id", $"Site alert with ID '{id}' does not exist.", statusCode: 404);

            alert.Title = dto.Title.Trim();
            alert.Content = dto.Content;
            alert.IsActive = dto.IsActive;

            await _siteAlertRepository.UpdateAsync(alert, ct);
            return ApiResponse<SiteAlertResponseDto>.SuccessResult(
                MapToDto(alert), "Site alert updated successfully.");
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default)
        {
            var alert = await _siteAlertRepository.GetByIdAsync(id, ct);
            if (alert is null)
                return ApiResponse<object>.FailureResult(
                    "Site alert not found.", "id", $"Site alert with ID '{id}' does not exist.", statusCode: 404);

            await _siteAlertRepository.DeleteAsync(alert, ct);
            return ApiResponse<object>.SuccessResult(null, "Site alert deleted successfully.");
        }

        private static SiteAlertResponseDto MapToDto(SiteAlert a) => new()
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt
        };
    }
}
