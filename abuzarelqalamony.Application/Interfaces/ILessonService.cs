using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Lessons;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ILessonService
    {
        Task<ApiResponse<PagedResult<LessonResponseDto>>> GetPagedAsync(LessonQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<PagedResult<LessonResponseDto>>> GetPagedByCategoryIdAsync(int categoryId, LessonQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<LessonResponseDto>> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ApiResponse<LessonResponseDto>> CreateAsync(CreateLessonDto dto, CancellationToken ct = default);
        Task<ApiResponse<LessonResponseDto>> UpdateAsync(int id, UpdateLessonDto dto, CancellationToken ct = default);
        Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default);
    }
}
