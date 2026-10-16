using System.Collections.Generic;

namespace abuzarelqalamony.Application.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }

    public ApiResponse()
    {
    }

    public ApiResponse(T? data, string message = "", int statusCode = 200)
    {
        Success = true;
        StatusCode = statusCode;
        Message = message;
        Data = data;
        Errors = null;
    }

    public static ApiResponse<T> SuccessResult(T? data, string message = "Operation completed successfully.", int statusCode = 200)
    {
        return new ApiResponse<T>
        {
            Success = true,
            StatusCode = statusCode,
            Message = message,
            Data = data,
            Errors = null
        };
    }

    public static ApiResponse<T> FailureResult(
        string message,
        int statusCode = 400,
        IDictionary<string, string[]>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            StatusCode = statusCode,
            Message = message,
            Data = default,
            Errors = errors
        };
    }

    public static ApiResponse<T> FailureResult(
        string message,
        string key,
        string error,
        int statusCode = 400)
    {
        return new ApiResponse<T>
        {
            Success = false,
            StatusCode = statusCode,
            Message = message,
            Data = default,
            Errors = new Dictionary<string, string[]>
            {
                { key, new[] { error } }
            }
        };
    }
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse SuccessResult(string message = "Operation completed successfully.", int statusCode = 200)
    {
        return new ApiResponse
        {
            Success = true,
            StatusCode = statusCode,
            Message = message,
            Data = null,
            Errors = null
        };
    }

    public static new ApiResponse FailureResult(
        string message,
        int statusCode = 400,
        IDictionary<string, string[]>? errors = null)
    {
        return new ApiResponse
        {
            Success = false,
            StatusCode = statusCode,
            Message = message,
            Data = null,
            Errors = errors
        };
    }

    public static new ApiResponse FailureResult(
        string message,
        string key,
        string error,
        int statusCode = 400)
    {
        return new ApiResponse
        {
            Success = false,
            StatusCode = statusCode,
            Message = message,
            Data = null,
            Errors = new Dictionary<string, string[]>
            {
                { key, new[] { error } }
            }
        };
    }
}
