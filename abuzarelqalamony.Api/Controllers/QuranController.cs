using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Quran;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class QuranController : ControllerBase
    {
        private readonly IQuranService _quranService;

        public QuranController(IQuranService quranService)
            => _quranService = quranService;

        // GET /api/quran?page=1&pageSize=10&categoryId=...&search=...&sort=latest
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<QuranResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] QuranQueryParams query, CancellationToken ct)
        {
            var result = await _quranService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/quran/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<QuranResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _quranService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/quran/category/{categoryId}?page=1&pageSize=10
        [HttpGet("category/{categoryId:int}")]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<QuranResponseDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByCategory(
            int categoryId, [FromQuery] QuranQueryParams query, CancellationToken ct)
        {
            var result = await _quranService.GetPagedByCategoryIdAsync(categoryId, query, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
