using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Sermons;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [Authorize]
    [Route("api/admin/sermons")]
    [ApiController]
    public class AdminSermonsController : ControllerBase
    {
        private readonly ISermonService _sermonService;

        public AdminSermonsController(ISermonService sermonService)
            => _sermonService = sermonService;

        // GET /api/admin/sermons
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<SermonResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] SermonQueryParams query, CancellationToken ct)
        {
            var result = await _sermonService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/admin/sermons/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<SermonResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _sermonService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        // POST /api/admin/sermons
        [HttpPost]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [ProducesResponseType(typeof(ApiResponse<SermonResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create([FromForm] CreateSermonDto dto, CancellationToken ct)
        {
            var result = await _sermonService.CreateAsync(dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // PUT /api/admin/sermons/{id}
        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [ProducesResponseType(typeof(ApiResponse<SermonResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateSermonDto dto, CancellationToken ct)
        {
            var result = await _sermonService.UpdateAsync(id, dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // DELETE /api/admin/sermons/{id}
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _sermonService.DeleteAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
