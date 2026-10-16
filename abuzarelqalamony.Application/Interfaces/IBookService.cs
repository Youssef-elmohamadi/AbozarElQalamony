using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Books;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IBookService
    {
        Task<ApiResponse<PagedResult<BookResponseDto>>> GetPagedAsync(BookQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<PagedResult<BookResponseDto>>> GetPagedByCategoryIdAsync(int categoryId, BookQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<BookResponseDto>> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ApiResponse<BookResponseDto>> CreateAsync(CreateBookDto dto, CancellationToken ct = default);
        Task<ApiResponse<BookResponseDto>> UpdateAsync(int id, UpdateBookDto dto, CancellationToken ct = default);
        Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default);
    }
}
