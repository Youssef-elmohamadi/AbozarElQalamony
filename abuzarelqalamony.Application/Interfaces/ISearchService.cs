using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Search;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface ISearchService
    {
        Task<ApiResponse<GlobalSearchResponseDto>> GlobalSearchAsync(GlobalSearchQueryParams query, CancellationToken ct = default);
    }
}
