namespace GreenGrow.Api.Services;

/// <summary>
/// Wraps BCrypt so controllers don't reference it directly.
/// Passwords are always hashed before they hit MySQL.
/// </summary>
public static class PasswordService
{
    public static string Hash(string plain) =>
        BCrypt.Net.BCrypt.HashPassword(plain);

    public static bool Verify(string plain, string hash)
    {
        if (string.IsNullOrEmpty(hash)) return false;
        try { return BCrypt.Net.BCrypt.Verify(plain, hash); }
        catch { return false; } // malformed hash (e.g. legacy seed rows)
    }
}
