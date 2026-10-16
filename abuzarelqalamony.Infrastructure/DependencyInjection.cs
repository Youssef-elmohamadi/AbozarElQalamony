using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Infrastructure.Authentication;
using abuzarelqalamony.Infrastructure.Services;
using abuzarelqalamony.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace abuzarelqalamony.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            services.AddScoped<IJwtProvider, JwtProvider>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IHashPassword, PasswordHasher>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ILessonRepository, LessonRepository>();
            services.AddScoped<ILessonService, LessonService>();
            services.AddScoped<IBookRepository, BookRepository>();
            services.AddScoped<IBookService, BookService>();
            services.AddScoped<ISermonRepository, SermonRepository>();
            services.AddScoped<ISermonService, SermonService>();
            services.AddScoped<IArticleRepository, ArticleRepository>();
            services.AddScoped<IArticleService, ArticleService>();
            services.AddScoped<ISiteAlertRepository, SiteAlertRepository>();
            services.AddScoped<ISiteAlertService, SiteAlertService>();
            services.AddScoped<IHomeService, HomeService>();
            return services;
        }
    }
}
