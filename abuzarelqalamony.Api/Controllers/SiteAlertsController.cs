using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.SiteAlerts;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/site-alerts")]
    [ApiController]
    public class SiteAlertsController : ControllerBase
    {
        private readonly ISiteAlertService _siteAlertService;

        public SiteAlertsController(ISiteAlertService siteAlertService)
            => _siteAlertService = siteAlertService;

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SiteAlertResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActiveAlerts(CancellationToken ct)
        {
            var result = await _siteAlertService.GetActiveAlertsAsync(ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
