using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Categories;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
            => _categoryRepository = categoryRepository;

        public async Task<ApiResponse<IEnumerable<CategoryDto>>> GetAllAsync(
            CategoryType? type = null, string? search = null, CancellationToken ct = default)
        {
            var categories = await _categoryRepository.GetAllAsync(type, search, ct);
            var dtos = categories.Select(MapToDto);
            return ApiResponse<IEnumerable<CategoryDto>>.SuccessResult(dtos, "Categories retrieved successfully.");
        }

        public async Task<ApiResponse<PagedResult<CategoryWithChildrenDto>>> GetRootCategoriesAsync(
            CategoryQueryParams query, CancellationToken ct = default)
        {
            var search = !string.IsNullOrWhiteSpace(query.Name) ? query.Name : query.Search;

            var (items, totalCount) = await _categoryRepository.GetRootByTypePagedAsync(
                query.Type, query.Page, query.PageSize, search, ct);

            var dtos = items.Select(MapToWithChildren).ToList();
            var paged = PagedResult<CategoryWithChildrenDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<CategoryWithChildrenDto>>.SuccessResult(paged, "Categories retrieved successfully.");
        }

        public async Task<ApiResponse<IEnumerable<CategoryDto>>> GetChildrenAsync(
            int parentId, string? search = null, CancellationToken ct = default)
        {
            var parentExists = await _categoryRepository.ExistsAsync(parentId, ct);
            if (!parentExists)
                return ApiResponse<IEnumerable<CategoryDto>>.FailureResult(
                    "Category not found.", "parentId", $"Category with ID '{parentId}' does not exist.", statusCode: 404);

            var children = await _categoryRepository.GetChildrenAsync(parentId, search, ct);
            return ApiResponse<IEnumerable<CategoryDto>>.SuccessResult(
                children.Select(MapToDto), "Sub-categories retrieved successfully.");
        }

        public async Task<ApiResponse<CategoryDto>> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var category = await _categoryRepository.GetByIdAsync(id, ct);
            if (category is null)
                return ApiResponse<CategoryDto>.FailureResult(
                    "Category not found.", "id", $"Category with ID '{id}' does not exist.", statusCode: 404);

            return ApiResponse<CategoryDto>.SuccessResult(MapToDto(category), "Category retrieved successfully.");
        }

        public async Task<ApiResponse<CategoryDto>> CreateAsync(
            CreateCategoryDto dto, CancellationToken ct = default)
        {
            if (!Enum.IsDefined(typeof(CategoryType), dto.Type))
                return ApiResponse<CategoryDto>.FailureResult(
                    "Invalid category type.", "type", "Allowed values: Book (1), Lesson (2), Sermon (3), Quran (4).");

            if (dto.ParentId.HasValue)
            {
                var parent = await _categoryRepository.GetByIdAsync(dto.ParentId.Value, ct);

                if (parent is null)
                    return ApiResponse<CategoryDto>.FailureResult(
                        "Parent category not found.", "parentId", $"Parent category with ID '{dto.ParentId.Value}' does not exist.", statusCode: 404);

                if (parent.Type != dto.Type)
                    return ApiResponse<CategoryDto>.FailureResult(
                        "Category type mismatch.",
                        "type", $"Parent category is of type '{parent.Type}', but new category is declared as '{dto.Type}'.");
            }

            var category = new Category
            {
                Name = dto.Name.Trim(),
                Type = dto.Type,
                ParentId = dto.ParentId
            };

            var created = await _categoryRepository.AddAsync(category, ct);
            return ApiResponse<CategoryDto>.SuccessResult(MapToDto(created), "Category created successfully.", statusCode: 201);
        }

        public async Task<ApiResponse<CategoryDto>> UpdateAsync(
            int id, UpdateCategoryDto dto, CancellationToken ct = default)
        {
            var category = await _categoryRepository.GetByIdAsync(id, ct);
            if (category is null)
                return ApiResponse<CategoryDto>.FailureResult(
                    "Category not found.", "id", $"Category with ID '{id}' does not exist.", statusCode: 404);

            if (dto.Type.HasValue && !Enum.IsDefined(typeof(CategoryType), dto.Type.Value))
                return ApiResponse<CategoryDto>.FailureResult(
                    "Invalid category type.", "type", "Allowed values: Book (1), Lesson (2), Sermon (3), Quran (4).");

            var targetType = dto.Type ?? category.Type;

            if (dto.ParentId.HasValue)
            {
                if (dto.ParentId.Value == id)
                    return ApiResponse<CategoryDto>.FailureResult(
                        "Invalid parent category.", "parentId", "A category cannot be its own parent.");

                var parent = await _categoryRepository.GetByIdAsync(dto.ParentId.Value, ct);

                if (parent is null)
                    return ApiResponse<CategoryDto>.FailureResult(
                        "Parent category not found.", "parentId", $"Parent category with ID '{dto.ParentId.Value}' does not exist.", statusCode: 404);

                if (parent.Type != targetType)
                    return ApiResponse<CategoryDto>.FailureResult(
                        "Category type mismatch.",
                        "type", $"Parent category is of type '{parent.Type}', but this category is set to '{targetType}'.");
            }

            category.Name = dto.Name.Trim();
            category.ParentId = dto.ParentId;

            if (dto.Type.HasValue && dto.Type.Value != category.Type)
            {
                category.Type = dto.Type.Value;
                foreach (var child in category.Children)
                {
                    child.Type = dto.Type.Value;
                }
            }

            await _categoryRepository.UpdateAsync(category, ct);
            return ApiResponse<CategoryDto>.SuccessResult(MapToDto(category), "Category updated successfully.");
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default)
        {
            var category = await _categoryRepository.GetByIdAsync(id, ct);
            if (category is null)
                return ApiResponse<object>.FailureResult(
                    "Category not found.", "id", $"Category with ID '{id}' does not exist.", statusCode: 404);

            try
            {
                await _categoryRepository.DeleteAsync(category, ct);
                return ApiResponse<object>.SuccessResult(null, "Category deleted successfully.");
            }
            catch (DbUpdateException)
            {
                return ApiResponse<object>.FailureResult(
                    "Cannot delete category.",
                    "category",
                    "Cannot delete this category because it has associated items or sub-categories.",
                    statusCode: 409);
            }
        }


        private static CategoryDto MapToDto(Category c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Type = c.Type,
            ParentId = c.ParentId
        };

        private static CategoryWithChildrenDto MapToWithChildren(Category c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Type = c.Type,
            ParentId = c.ParentId,
            Children = c.Children.Select(MapToDto).ToList()
        };
    }
}
