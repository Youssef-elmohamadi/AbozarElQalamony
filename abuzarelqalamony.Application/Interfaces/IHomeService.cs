using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Home;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IHomeService
    {
        Task<ApiResponse<HomeResponseDto>> GetHomeDataAsync(HomeQueryParams query, CancellationToken ct = default);
    }
}
