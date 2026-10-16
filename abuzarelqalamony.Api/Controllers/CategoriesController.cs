using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Categories;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace abuzarelqalamony.Api.Controllers
{
    [Authorize]
    [Route("api/admin/[controller]")]
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
            => _categoryService = categoryService;

        [AllowAnonymous]
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<CategoryWithChildrenDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetRootCategories(
            [FromQuery] CategoryQueryParams query, CancellationToken ct)
        {
            var result = await _categoryService.GetRootCategoriesAsync(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [AllowAnonymous]
        [HttpGet("all")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
            [FromQuery] CategoryType? type,
            [FromQuery] string? name,
            [FromQuery] string? search,
            CancellationToken ct)
        {
            var searchTerm = !string.IsNullOrWhiteSpace(name) ? name : search;
            var result = await _categoryService.GetAllAsync(type, searchTerm, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _categoryService.GetByIdAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:int}/children")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetChildren(
            int id,
            [FromQuery] string? name,
            [FromQuery] string? search,
            CancellationToken ct)
        {
            var searchTerm = !string.IsNullOrWhiteSpace(name) ? name : search;
            var result = await _categoryService.GetChildrenAsync(id, searchTerm, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto, CancellationToken ct)
        {
            var result = await _categoryService.CreateAsync(dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto, CancellationToken ct)
        {
            var result = await _categoryService.UpdateAsync(id, dto, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _categoryService.DeleteAsync(id, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}