using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Sermons;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class SermonsController : ControllerBase
    {
        private readonly ISermonService _sermonService;

        public SermonsController(ISermonService sermonService)
            => _sermonService = sermonService;

        // GET /api/sermons?page=1&pageSize=10
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<SermonResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] SermonQueryParams query, CancellationToken ct)
        {
            var result = await _sermonService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/sermons/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<SermonResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _sermonService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/sermons/category/{categoryId}?page=1&pageSize=10
        [HttpGet("category/{categoryId:int}")]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<SermonResponseDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByCategory(
            int categoryId, [FromQuery] SermonQueryParams query, CancellationToken ct)
        {
            var result = await _sermonService.GetPagedByCategoryIdAsync(categoryId, query, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
