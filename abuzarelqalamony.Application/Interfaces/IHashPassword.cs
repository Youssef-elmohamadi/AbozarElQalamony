namespace abuzarelqalamony.Application.Interfaces
{
    public interface IHashPassword
    {
        string HashPassword(string password);
        bool VerifyPassword(string hashedPassword,string providedPassword);
    }
}
