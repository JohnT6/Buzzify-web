using Buzzify.Core.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace Buzzify.API.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = HttpStatusCode.InternalServerError;
            var result = string.Empty;

            switch (exception)
            {
                case ValidationException validationException:
                    statusCode = HttpStatusCode.BadRequest;
                    result = JsonSerializer.Serialize(new { message = "Lỗi dữ liệu", details = validationException.Errors });
                    break;
                case BadRequestException badRequestException:
                    statusCode = HttpStatusCode.BadRequest;
                    result = JsonSerializer.Serialize(new { message = badRequestException.Message });
                    break;
                case NotFoundException notFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    result = JsonSerializer.Serialize(new { message = notFoundException.Message });
                    break;
                case UnauthorizedException unauthorizedException:
                    statusCode = HttpStatusCode.Unauthorized;
                    result = JsonSerializer.Serialize(new { message = unauthorizedException.Message });
                    break;
                default:
                    statusCode = HttpStatusCode.InternalServerError;
                    var detailMessage = exception.Message;
                    var currentInner = exception.InnerException;
                    while (currentInner != null)
                    {
                        detailMessage += " | Inner: " + currentInner.Message;
                        currentInner = currentInner.InnerException;
                    }
                    result = JsonSerializer.Serialize(new { 
                        message = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.", 
                        details = detailMessage 
                    });
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            return context.Response.WriteAsync(result);
        }
    }
}
