using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Home;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [Route("api/public/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly IHomeService _homeService;

        public HomeController(IHomeService homeService)
        {
            _homeService = homeService;
        }

        /// <summary>
        /// جلب بيانات الصفحة الرئيسية للمستخدم (أكثر التصنيفات محتوى، أحدث الدروس، الخطب، الكتب، المقالات، التنبيهات)
        /// </summary>
        /// <param name="query">خيارات التحكم في عدد العناصر لكل قسم</param>
        /// <param name="ct">إلغاء الطلب</param>
        /// <returns>بيانات الصفحة الرئيسية الشاملة</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<HomeResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetHomeData([FromQuery] HomeQueryParams query, CancellationToken ct)
        {
            var result = await _homeService.GetHomeDataAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
