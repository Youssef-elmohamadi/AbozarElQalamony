namespace abuzarelqalamony.Application.Options;

    public class JwtOptions	
{
    public const string SectionName = "JwtSettings";
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience {  get; set; } = string.Empty;
    public int DurationInMinutes { get; set; } = 43200;
}
