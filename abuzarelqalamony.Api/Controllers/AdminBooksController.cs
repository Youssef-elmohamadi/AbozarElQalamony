using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Books;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [Authorize]
    [Route("api/admin/books")]
    [ApiController]
    public class AdminBooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public AdminBooksController(IBookService bookService)
            => _bookService = bookService;

        // GET /api/admin/books
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<BookResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] BookQueryParams query, CancellationToken ct)
        {
            var result = await _bookService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/admin/books/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<BookResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _bookService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        // POST /api/admin/books
        [HttpPost]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [ProducesResponseType(typeof(ApiResponse<BookResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create([FromForm] CreateBookDto dto, CancellationToken ct)
        {
            var result = await _bookService.CreateAsync(dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // PUT /api/admin/books/{id}
        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [ProducesResponseType(typeof(ApiResponse<BookResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateBookDto dto, CancellationToken ct)
        {
            var result = await _bookService.UpdateAsync(id, dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // DELETE /api/admin/books/{id}
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _bookService.DeleteAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
