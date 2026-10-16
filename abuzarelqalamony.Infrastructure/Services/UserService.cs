using abuzarelqalamony.Application.Common;
using abuzarelqalamony.Application.DTOs;
using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Infrastructure.Authentication;
using System;
using System.Collections.Generic;
using System.Text;

namespace abuzarelqalamony.Infrastructure.Services
{
    public class UserService: IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IHashPassword _hashPassword;
        private readonly IFileService _fileService;
        private readonly IJwtProvider _jwtProvider;

        public UserService(
            IUserRepository userRepository,
            IHashPassword passwordHasher,
            IFileService fileService,
            IJwtProvider jwtProvider
            )
        {
            _userRepository = userRepository;
            _hashPassword = passwordHasher;
            _fileService = fileService;
            _jwtProvider = jwtProvider;
        }
        public async Task<ApiResponse<UserResponseDto>> RegisterAsync(RegisterUserDto dto)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return ApiResponse<UserResponseDto>.FailureResult(
                    "Registration failed.",
                    "Email",
                    "This email address is already registered.",
                    statusCode: 400
                );
            }

            var roleExists = await _userRepository.RoleExistsAsync(dto.RoleId);
            if (!roleExists)
            {
                return ApiResponse<UserResponseDto>.FailureResult(
                    "Registration failed.",
                    "RoleId",
                    $"Role with ID '{dto.RoleId}' does not exist.",
                    statusCode: 400
                );
            }

            var hashedPassword = _hashPassword.HashPassword(dto.Password);
            string? profileImagePath = null;

            if (dto.ProfileImage != null && dto.ProfileImage.Length >0)
            {
                profileImagePath = _fileService.SaveFile(dto.ProfileImage, "ProfileImages",dto.Name);

            }

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = hashedPassword,
                RoleId = dto.RoleId,
                ProfileImagePath = profileImagePath
            };

            try
            {
                var createdUser = await _userRepository.AddAsync(user);

                return ApiResponse<UserResponseDto>.SuccessResult(
                    MapToDto(createdUser),
                    message: "Account created successfully.",
                    statusCode: 201
                );
           }
            catch
            {
                if (!string.IsNullOrWhiteSpace(profileImagePath))
                {
                    _fileService.DeleteFile(profileImagePath);
                }
                throw;
            }
        }

        public async Task<ApiResponse<UserResponseDto>> GetByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<UserResponseDto>.FailureResult(
                    "User not found.",
                    "Id",
                    $"No user exists with ID '{id}'.",
                    statusCode: 404
                );
            }

            return ApiResponse<UserResponseDto>.SuccessResult(
                MapToDto(user),
                message: "User retrieved successfully."
            );
        }

        public async Task<ApiResponse<PagedResult<UserResponseDto>>> GetPagedAsync(UserQueryParams query, CancellationToken ct = default)
        {
            var searchName = !string.IsNullOrWhiteSpace(query.Name) ? query.Name : query.Search;
            var (items, totalCount) = await _userRepository.GetPagedAsync(
                query.Page,
                query.PageSize,
                query.RoleId,
                searchName,
                ct
            );

            var dtos = items.Select(MapToDto).ToList();
            var pagedResult = PagedResult<UserResponseDto>.Create(dtos, totalCount, query.Page, query.PageSize);

            return ApiResponse<PagedResult<UserResponseDto>>.SuccessResult(
                pagedResult,
                message: "Users retrieved successfully."
            );
        }

        public async Task<ApiResponse<List<UserResponseDto>>> GetAllAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var dtos = users.Select(MapToDto).ToList();

            return ApiResponse<List<UserResponseDto>>.SuccessResult(
                dtos,
                message: "Users retrieved successfully."
            );
        }

        public async Task<ApiResponse<UserResponseDto>> UpdateAsync(int id, UpdateUserDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<UserResponseDto>.FailureResult(
                    "Update failed.",
                    "Id",
                    $"No user exists with ID '{id}'.",
                    statusCode: 404
                );
            }

            if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
                if (existingUser != null && existingUser.Id != id)
                {
                    return ApiResponse<UserResponseDto>.FailureResult(
                        "Update failed.",
                        "Email",
                        "This email address is already in use by another user.",
                        statusCode: 400
                    );
                }
            }

            var roleExists = await _userRepository.RoleExistsAsync(dto.RoleId);
            if (!roleExists)
            {
                return ApiResponse<UserResponseDto>.FailureResult(
                    "Update failed.",
                    "RoleId",
                    $"Role with ID '{dto.RoleId}' does not exist.",
                    statusCode: 400
                );
            }

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.RoleId = dto.RoleId;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.PasswordHash = _hashPassword.HashPassword(dto.Password);
            }

            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                var oldImagePath = user.ProfileImagePath;
                var newImagePath = _fileService.SaveFile(dto.ProfileImage, "ProfileImages", dto.Name);
                user.ProfileImagePath = newImagePath;

                if (!string.IsNullOrWhiteSpace(oldImagePath))
                {
                    _fileService.DeleteFile(oldImagePath);
                }
            }

            await _userRepository.UpdateAsync(user);

            var updatedUser = await _userRepository.GetByIdAsync(id);

            return ApiResponse<UserResponseDto>.SuccessResult(
                MapToDto(updatedUser ?? user),
                message: "User updated successfully."
            );
        }

        public async Task<ApiResponse<UserResponseDto>> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<UserResponseDto>.FailureResult(
                    "Profile not found.",
                    "Id",
                    "User profile does not exist.",
                    statusCode: 404
                );
            }

            return ApiResponse<UserResponseDto>.SuccessResult(
                MapToDto(user),
                message: "Profile retrieved successfully."
            );
        }

        public async Task<ApiResponse<UserResponseDto>> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<UserResponseDto>.FailureResult(
                    "Profile update failed.",
                    "Id",
                    "User profile does not exist.",
                    statusCode: 404
                );
            }

            // Verify current password before allowing any profile modifications
            if (!_hashPassword.VerifyPassword(user.PasswordHash, dto.CurrentPassword))
            {
                return ApiResponse<UserResponseDto>.FailureResult(
                    "Profile update failed.",
                    "CurrentPassword",
                    "The current password you provided is incorrect.",
                    statusCode: 400
                );
            }

            // If email is changed, ensure it's not already in use by another user
            if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
                if (existingUser != null && existingUser.Id != userId)
                {
                    return ApiResponse<UserResponseDto>.FailureResult(
                        "Profile update failed.",
                        "Email",
                        "This email address is already in use by another account.",
                        statusCode: 400
                    );
                }
            }

            user.Name = dto.Name;
            user.Email = dto.Email;

            // If new password is provided, update password hash
            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                user.PasswordHash = _hashPassword.HashPassword(dto.NewPassword);
            }

            // If new profile image is uploaded, save new and delete old
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                var oldImagePath = user.ProfileImagePath;
                var newImagePath = _fileService.SaveFile(dto.ProfileImage, "ProfileImages", dto.Name);
                user.ProfileImagePath = newImagePath;

                if (!string.IsNullOrWhiteSpace(oldImagePath))
                {
                    _fileService.DeleteFile(oldImagePath);
                }
            }

            await _userRepository.UpdateAsync(user);

            var updatedUser = await _userRepository.GetByIdAsync(userId);

            return ApiResponse<UserResponseDto>.SuccessResult(
                MapToDto(updatedUser ?? user),
                message: "Profile updated successfully."
            );
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<object>.FailureResult(
                    "Deletion failed.",
                    "Id",
                    $"No user exists with ID '{id}'.",
                    statusCode: 404
                );
            }

            if (!string.IsNullOrWhiteSpace(user.ProfileImagePath))
            {
                _fileService.DeleteFile(user.ProfileImagePath);
            }

            await _userRepository.DeleteAsync(user);

            return ApiResponse<object>.SuccessResult(
                null,
                message: "User deleted successfully."
            );
        }

        public async Task<ApiResponse<string>> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null || !_hashPassword.VerifyPassword(user.PasswordHash, dto.Password))
            {
                return ApiResponse<string>.FailureResult(
                    "Authentication failed.",
                    "Credentials",
                    "Invalid email or password.",
                    statusCode: 401
                );
            }

            var token = _jwtProvider.GenerateToken(user.Id.ToString(), user.Email, user.Role?.Name ?? "User");

            return ApiResponse<string>.SuccessResult(
                token,
                message: "Login successful."
            );
        }

        private static UserResponseDto MapToDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                ProfileImagePath = user.ProfileImagePath,
                RoleId = user.RoleId,
                RoleName = user.Role?.Name
            };
        }
    }
}
