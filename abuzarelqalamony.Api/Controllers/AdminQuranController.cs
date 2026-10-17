using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Quran;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [Authorize]
    [Route("api/admin/quran")]
    [ApiController]
    public class AdminQuranController : ControllerBase
    {
        private readonly IQuranService _quranService;

        public AdminQuranController(IQuranService quranService)
            => _quranService = quranService;

        // GET /api/admin/quran
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<QuranResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] QuranQueryParams query, CancellationToken ct)
        {
            var result = await _quranService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        // GET /api/admin/quran/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<QuranResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _quranService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        // POST /api/admin/quran
        [HttpPost]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [ProducesResponseType(typeof(ApiResponse<QuranResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create([FromForm] CreateQuranDto dto, CancellationToken ct)
        {
            var result = await _quranService.CreateAsync(dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // PUT /api/admin/quran/{id}
        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [ProducesResponseType(typeof(ApiResponse<QuranResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateQuranDto dto, CancellationToken ct)
        {
            var result = await _quranService.UpdateAsync(id, dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // DELETE /api/admin/quran/{id}
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _quranService.DeleteAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
