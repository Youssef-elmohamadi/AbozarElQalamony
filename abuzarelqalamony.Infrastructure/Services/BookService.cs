using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs.Books;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IFileService _fileService;

        private const string UploadFolder = "uploads/books";

        public BookService(
            IBookRepository bookRepository,
            ICategoryRepository categoryRepository,
            IFileService fileService)
        {
            _bookRepository = bookRepository;
            _categoryRepository = categoryRepository;
            _fileService = fileService;
        }

        public async Task<ApiResponse<PagedResult<BookResponseDto>>> GetPagedAsync(
            BookQueryParams query, CancellationToken ct = default)
        {
            var title = !string.IsNullOrWhiteSpace(query.Title) ? query.Title : query.Name;
            var (items, totalCount) = await _bookRepository.GetPagedAsync(
                query.Page,
                query.PageSize,
                query.CategoryId,
                query.CategoryName,
                title,
                query.AuthorName,
                query.Search,
                query.Sort,
                ct);

            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<BookResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<BookResponseDto>>.SuccessResult(paged, "Books retrieved successfully.");
        }

        public async Task<ApiResponse<PagedResult<BookResponseDto>>> GetPagedByCategoryIdAsync(
            int categoryId, BookQueryParams query, CancellationToken ct = default)
        {
            var categoryExists = await _categoryRepository.ExistsAsync(categoryId, ct);
            if (!categoryExists)
                return ApiResponse<PagedResult<BookResponseDto>>.FailureResult(
                    "Category not found.", "categoryId", $"Category with ID '{categoryId}' does not exist.", statusCode: 404);

            var searchTerm = !string.IsNullOrWhiteSpace(query.Title)
                ? query.Title
                : (!string.IsNullOrWhiteSpace(query.Name) ? query.Name : query.Search);

            var (items, totalCount) = await _bookRepository.GetPagedByCategoryIdAsync(
                categoryId, query.Page, query.PageSize, searchTerm, query.Sort, ct);

            var dtos = items.Select(MapToDto).ToList();
            var paged = PagedResult<BookResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<BookResponseDto>>.SuccessResult(paged, "Books retrieved successfully.");
        }

        public async Task<ApiResponse<BookResponseDto>> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var book = await _bookRepository.GetByIdAsync(id, ct);
            if (book is null)
                return ApiResponse<BookResponseDto>.FailureResult(
                    "Book not found.", "id", $"Book with ID '{id}' does not exist.", statusCode: 404);

            return ApiResponse<BookResponseDto>.SuccessResult(MapToDto(book), "Book retrieved successfully.");
        }

        public async Task<ApiResponse<BookResponseDto>> CreateAsync(
            CreateBookDto dto, CancellationToken ct = default)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, ct);
            if (category is null)
                return ApiResponse<BookResponseDto>.FailureResult(
                    "Category not found.", "CategoryId", $"No category found with ID '{dto.CategoryId}'.", statusCode: 404);

            if (category.Type != CategoryType.Book)
                return ApiResponse<BookResponseDto>.FailureResult(
                    "Invalid category type.", "CategoryId", $"Category '{category.Name}' is not a Book category.", statusCode: 400);

            string? pdfPath = null;
            string? coverImagePath = null;

            try
            {
                if (dto.PdfFile != null && dto.PdfFile.Length > 0)
                    pdfPath = await _fileService.SaveFileAsync(dto.PdfFile, UploadFolder);

                if (dto.CoverImageFile != null && dto.CoverImageFile.Length > 0)
                    coverImagePath = await _fileService.SaveFileAsync(dto.CoverImageFile, UploadFolder);

                var book = new Book
                {
                    Title = dto.Title.Trim(),
                    AuthorName = dto.AuthorName.Trim(),
                    Description = dto.Description?.Trim(),
                    PublishDate = dto.PublishDate ?? DateTime.UtcNow,
                    CategoryId = dto.CategoryId,
                    PdfFilePath = pdfPath,
                    CoverImagePath = coverImagePath,
                    PagesCount = dto.PagesCount,
                    FileSizeInMB = dto.FileSizeInMB,
                    TableOfContentsJson = dto.TableOfContentsJson,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _bookRepository.AddAsync(book, ct);
                return ApiResponse<BookResponseDto>.SuccessResult(MapToDto(created), "Book created successfully.", statusCode: 201);
            }
            catch
            {
                _fileService.DeleteFile(pdfPath);
                _fileService.DeleteFile(coverImagePath);
                throw;
            }
        }

        public async Task<ApiResponse<BookResponseDto>> UpdateAsync(
            int id, UpdateBookDto dto, CancellationToken ct = default)
        {
            var book = await _bookRepository.GetByIdAsync(id, ct);
            if (book is null)
                return ApiResponse<BookResponseDto>.FailureResult(
                    "Book not found.", "id", $"Book with ID '{id}' does not exist.", statusCode: 404);

            if (dto.CategoryId != book.CategoryId)
            {
                var category = await _categoryRepository.GetByIdAsync(dto.CategoryId, ct);
                if (category is null)
                    return ApiResponse<BookResponseDto>.FailureResult(
                        "Category not found.", "CategoryId", $"No category found with ID '{dto.CategoryId}'.", statusCode: 404);

                if (category.Type != CategoryType.Book)
                    return ApiResponse<BookResponseDto>.FailureResult(
                        "Invalid category type.", "CategoryId", $"Category '{category.Name}' is not a Book category.", statusCode: 400);

                book.CategoryId = dto.CategoryId;
            }

            string? newPdfPath = null;
            string? newCoverPath = null;

            try
            {
                if (dto.PdfFile != null && dto.PdfFile.Length > 0)
                {
                    newPdfPath = await _fileService.SaveFileAsync(dto.PdfFile, UploadFolder);
                    _fileService.DeleteFile(book.PdfFilePath);
                    book.PdfFilePath = newPdfPath;
                }

                if (dto.CoverImageFile != null && dto.CoverImageFile.Length > 0)
                {
                    newCoverPath = await _fileService.SaveFileAsync(dto.CoverImageFile, UploadFolder);
                    _fileService.DeleteFile(book.CoverImagePath);
                    book.CoverImagePath = newCoverPath;
                }

                book.Title = dto.Title.Trim();
                book.AuthorName = dto.AuthorName.Trim();
                book.Description = dto.Description?.Trim();
                if (dto.PublishDate.HasValue)
                    book.PublishDate = dto.PublishDate.Value;

                if (dto.PagesCount.HasValue)
                    book.PagesCount = dto.PagesCount.Value;
                if (dto.FileSizeInMB.HasValue)
                    book.FileSizeInMB = dto.FileSizeInMB.Value;
                if (dto.TableOfContentsJson != null)
                    book.TableOfContentsJson = dto.TableOfContentsJson;

                await _bookRepository.UpdateAsync(book, ct);
                return ApiResponse<BookResponseDto>.SuccessResult(MapToDto(book), "Book updated successfully.");
            }
            catch
            {
                _fileService.DeleteFile(newPdfPath);
                _fileService.DeleteFile(newCoverPath);
                throw;
            }
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id, CancellationToken ct = default)
        {
            var book = await _bookRepository.GetByIdAsync(id, ct);
            if (book is null)
                return ApiResponse<object>.FailureResult(
                    "Book not found.", "id", $"Book with ID '{id}' does not exist.", statusCode: 404);

            _fileService.DeleteFile(book.PdfFilePath);
            _fileService.DeleteFile(book.CoverImagePath);

            await _bookRepository.DeleteAsync(book, ct);
            return ApiResponse<object>.SuccessResult(null, "Book deleted successfully.");
        }

        private static BookResponseDto MapToDto(Book b) => new()
        {
            Id = b.Id,
            Title = b.Title,
            AuthorName = b.AuthorName,
            Description = b.Description,
            PdfFilePath = b.PdfFilePath,
            CoverImagePath = b.CoverImagePath,
            PublishDate = b.PublishDate,
            CreatedAt = b.CreatedAt,
            PagesCount = b.PagesCount,
            FileSizeInMB = b.FileSizeInMB,
            TableOfContentsJson = b.TableOfContentsJson,
            CategoryId = b.CategoryId,
            CategoryName = b.Category?.Name ?? string.Empty
        };
    }
}
