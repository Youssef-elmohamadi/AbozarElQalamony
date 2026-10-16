using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Articles;
using abuzarelqalamony.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [Authorize]
    [Route("api/admin/articles")]
    [ApiController]
    public class AdminArticlesController : ControllerBase
    {
        private readonly IArticleService _articleService;

        public AdminArticlesController(IArticleService articleService)
            => _articleService = articleService;

        // POST /api/admin/articles
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<ArticleResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateArticleDto dto, CancellationToken ct)
        {
            var result = await _articleService.CreateAsync(dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // PUT /api/admin/articles/{id}
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<ArticleResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateArticleDto dto, CancellationToken ct)
        {
            var result = await _articleService.UpdateAsync(id, dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        // DELETE /api/admin/articles/{id}
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _articleService.DeleteAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
