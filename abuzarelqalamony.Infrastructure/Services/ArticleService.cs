using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Articles;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class ArticleService : IArticleService
    {
        private readonly IArticleRepository _articleRepository;

        public ArticleService(IArticleRepository articleRepository)
        {
            _articleRepository = articleRepository;
        }

        public async Task<ApiResponse<PagedResult<ArticleResponseDto>>> GetPagedAsync(
            ArticleQueryParams query, CancellationToken ct = default)
        {
            var searchTerm = !string.IsNullOrWhiteSpace(query.Search) ? query.Search : query.Title;
            var (items, totalCount) = await _articleRepository.GetPagedAsync(query.Page, query.PageSize, searchTerm, query.Sort, ct);
            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<ArticleResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<ArticleResponseDto>>.SuccessResult(paged, "Articles retrieved successfully.");
        }

        public async Task<ApiResponse<ArticleResponseDto>> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var article = await _articleRepository.GetByIdAsync(id, ct);
            if (article is null)
                return ApiResponse<ArticleResponseDto>.FailureResult(
                    "Article not found.", "id", $"Article with ID '{id}' does not exist.", statusCode: 404);

            return ApiResponse<ArticleResponseDto>.SuccessResult(MapToDto(article), "Article retrieved successfully.");
        }

        public async Task<ApiResponse<ArticleResponseDto>> CreateAsync(
            CreateArticleDto dto, CancellationToken ct = default)
        {
            var article = new Article
            {
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                Body = dto.Body, 
                PublishDate = dto.PublishDate ?? DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _articleRepository.AddAsync(article, ct);
            return ApiResponse<ArticleResponseDto>.SuccessResult(MapToDto(created), "Article created successfully.", statusCode: 201);
        }

        public async Task<ApiResponse<ArticleResponseDto>> UpdateAsync(
            int id, UpdateArticleDto dto, CancellationToken ct = default)
        {
            var article = await _articleRepository.GetByIdAsync(id, ct);
            if (article is null)
                return ApiResponse<ArticleResponseDto>.FailureResult(
                    "Article not found.", "id", $"Article with ID '{id}' does not exist.", statusCode: 404);

            article.Title = dto.Title.Trim();
            article.Description = dto.Description?.Trim();
            article.Body = dto.Body; // Preserving rich text HTML content

            if (dto.PublishDate.HasValue)
                article.PublishDate = dto.PublishDate.Value;

            await _articleRepository.UpdateAsync(article, ct);
            return ApiResponse<ArticleResponseDto>.SuccessResult(MapToDto(article), "Article updated successfully.");
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default)
        {
            var article = await _articleRepository.GetByIdAsync(id, ct);
            if (article is null)
                return ApiResponse<object>.FailureResult(
                    "Article not found.", "id", $"Article with ID '{id}' does not exist.", statusCode: 404);

            await _articleRepository.DeleteAsync(article, ct);
            return ApiResponse<object>.SuccessResult(null, "Article deleted successfully.");
        }

        private static ArticleResponseDto MapToDto(Article a) => new()
        {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            Body = a.Body,
            PublishDate = a.PublishDate,
            CreatedAt = a.CreatedAt
        };
    }
}
