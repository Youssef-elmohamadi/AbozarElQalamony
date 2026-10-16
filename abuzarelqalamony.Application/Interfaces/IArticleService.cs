using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Articles;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IArticleService
    {
        Task<ApiResponse<PagedResult<ArticleResponseDto>>> GetPagedAsync(ArticleQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<ArticleResponseDto>> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ApiResponse<ArticleResponseDto>> CreateAsync(CreateArticleDto dto, CancellationToken ct = default);
        Task<ApiResponse<ArticleResponseDto>> UpdateAsync(int id, UpdateArticleDto dto, CancellationToken ct = default);
        Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default);
    }
}
