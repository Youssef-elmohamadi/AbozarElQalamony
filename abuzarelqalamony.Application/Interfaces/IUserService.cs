using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs;
using abuzarelqalamony.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace abuzarelqalamony.Application.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponse<UserResponseDto>> RegisterAsync(RegisterUserDto dto);
        Task<ApiResponse<PagedResult<UserResponseDto>>> GetPagedAsync(UserQueryParams query, CancellationToken ct = default);
        Task<ApiResponse<List<UserResponseDto>>> GetAllAsync();
        Task<ApiResponse<UserResponseDto>> GetByIdAsync(int id);
        Task<ApiResponse<UserResponseDto>> UpdateAsync(int id, UpdateUserDto dto);
        Task<ApiResponse<UserResponseDto>> GetProfileAsync(int userId);
        Task<ApiResponse<UserResponseDto>> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<ApiResponse<object>> DeleteAsync(int id);
        Task<ApiResponse<string>> LoginAsync(LoginDto dto);
    }
}
