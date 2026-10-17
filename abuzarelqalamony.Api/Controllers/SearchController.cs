using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Search;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [Route("api/public/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        /// <summary>
        /// البحث العام في جميع محتويات المنصة (التصنيفات، الدروس، الخطب، الكتب، القرآن الكريم، المقالات، التنبيهات)
        /// مع دعم الترتيب حسب الأحدث أو الأقدم، وتحديد القسم.
        /// </summary>
        /// <param name="query">بارامترات البحث</param>
        /// <param name="ct">إلغاء الطلب</param>
        /// <returns>نتائج البحث المجمعة حسب الأقسام</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<GlobalSearchResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GlobalSearch([FromQuery] GlobalSearchQueryParams query, CancellationToken ct)
        {
            var result = await _searchService.GlobalSearchAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
