using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Articles;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly IArticleService _articleService;

        public ArticlesController(IArticleService articleService)
            => _articleService = articleService;

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<ArticleResponseDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] ArticleQueryParams query, CancellationToken ct)
        {
            var result = await _articleService.GetPagedAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<ArticleResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _articleService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
