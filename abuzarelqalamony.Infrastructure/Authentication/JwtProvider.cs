using abuzarelqalamony.Application.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace abuzarelqalamony.Infrastructure.Authentication;

public class JwtProvider : IJwtProvider
{

	private readonly JwtOptions _options;
	public JwtProvider(IOptions<JwtOptions> options)
	{
		_options = options.Value;
	}

	public string GenerateToken(string userId, string email,string role/*, IEnumerable<string> roles, IEnumerable<string> permissions*/)
	{

		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Sub, userId),
			new(JwtRegisteredClaimNames.Email, email),
			new(ClaimTypes.Role, role),
		    new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) 
	};
        //foreach (var role in roles)
        //{
        //	claims.Add(new Claim(ClaimTypes.Role, role));
        //      }

        //if (permissions != null) {
        //	foreach (var permission in permissions)
        //	{
        //		claims.Add(new Claim("permission", permission));
        //          }
        //      }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
		var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
		var tokenDescriptor = new SecurityTokenDescriptor
		{
			Subject = new ClaimsIdentity(claims),
			Issuer = _options.Issuer,
			Audience = _options.Audience,
			Expires = DateTime.UtcNow.AddMinutes(_options.DurationInMinutes),
			SigningCredentials = signingCredentials
		};

                var tokenHandler = new JwtSecurityTokenHandler();
        var securityToken = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(securityToken);
    }
    }
