using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Sermons;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ISermonService
    {
        Task<ApiResponse<PagedResult<SermonResponseDto>>> GetPagedAsync(SermonQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<PagedResult<SermonResponseDto>>> GetPagedByCategoryIdAsync(int categoryId, SermonQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<SermonResponseDto>> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ApiResponse<SermonResponseDto>> CreateAsync(CreateSermonDto dto, CancellationToken ct = default);
        Task<ApiResponse<SermonResponseDto>> UpdateAsync(int id, UpdateSermonDto dto, CancellationToken ct = default);
        Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default);
    }
}
