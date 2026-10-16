using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Lessons;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly ILessonService _lessonService;

        public LessonsController(ILessonService lessonService)
            => _lessonService = lessonService;

        // GET /api/lessons?page=1&pageSize=10
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<LessonResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] LessonQueryParams query, CancellationToken ct)
        {
            var result = await _lessonService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/lessons/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _lessonService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/lessons/category/{categoryId}?page=1&pageSize=10
        [HttpGet("category/{categoryId:int}")]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<LessonResponseDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByCategory(
            int categoryId, [FromQuery] LessonQueryParams query, CancellationToken ct)
        {
            var result = await _lessonService.GetPagedByCategoryIdAsync(categoryId, query, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
