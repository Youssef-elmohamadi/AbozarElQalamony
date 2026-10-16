using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.SiteAlerts;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [Authorize]
    [Route("api/admin/site-alerts")]
    [ApiController]
    public class AdminSiteAlertsController : ControllerBase
    {
        private readonly ISiteAlertService _siteAlertService;

        public AdminSiteAlertsController(ISiteAlertService siteAlertService)
            => _siteAlertService = siteAlertService;

        // GET /api/admin/site-alerts
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteAlertResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var result = await _siteAlertService.GetAllAsync(ct);
            return StatusCode(result.StatusCode, result);
        }

        // POST /api/admin/site-alerts
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<SiteAlertResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateSiteAlertDto dto, CancellationToken ct)
        {
            var result = await _siteAlertService.CreateAsync(dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // PUT /api/admin/site-alerts/{id}
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<SiteAlertResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSiteAlertDto dto, CancellationToken ct)
        {
            var result = await _siteAlertService.UpdateAsync(id, dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // DELETE /api/admin/site-alerts/{id}
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _siteAlertService.DeleteAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
