using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Lessons;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [Authorize]
    [Route("api/admin/lessons")]
    [ApiController]
    public class AdminLessonsController : ControllerBase
    {
        private readonly ILessonService _lessonService;

        public AdminLessonsController(ILessonService lessonService)
            => _lessonService = lessonService;

        // GET /api/admin/lessons
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<LessonResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] LessonQueryParams query, CancellationToken ct)
        {
            var result = await _lessonService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/admin/lessons/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _lessonService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        // POST /api/admin/lessons
        [HttpPost]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create([FromForm] CreateLessonDto dto, CancellationToken ct)
        {
            var result = await _lessonService.CreateAsync(dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // PUT /api/admin/lessons/{id}
        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateLessonDto dto, CancellationToken ct)
        {
            var result = await _lessonService.UpdateAsync(id, dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // DELETE /api/admin/lessons/{id}
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _lessonService.DeleteAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
