using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Quran;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IQuranService
    {
        Task<ApiResponse<PagedResult<QuranResponseDto>>> GetPagedAsync(QuranQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<PagedResult<QuranResponseDto>>> GetPagedByCategoryIdAsync(int categoryId, QuranQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<QuranResponseDto>> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ApiResponse<QuranResponseDto>> CreateAsync(CreateQuranDto dto, CancellationToken ct = default);
        Task<ApiResponse<QuranResponseDto>> UpdateAsync(int id, UpdateQuranDto dto, CancellationToken ct = default);
        Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default);
    }
}
