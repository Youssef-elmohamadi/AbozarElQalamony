using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Books;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
            => _bookService = bookService;

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<BookResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] BookQueryParams query, CancellationToken ct)
        {
            var result = await _bookService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<BookResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _bookService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("category/{categoryId:int}")]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<BookResponseDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByCategory(
            int categoryId, [FromQuery] BookQueryParams query, CancellationToken ct)
        {
            var result = await _bookService.GetPagedByCategoryIdAsync(categoryId, query, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
