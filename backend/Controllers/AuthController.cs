using GreenGrow.Api.Data;
using GreenGrow.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Controllers;

public record LoginRequest(string Email, string Password);
public record UserLoginResponse(int UserID, string Fname, string Lname, string Email);

public record EmployeeLoginRequest(int EmployeeID, string Password);
public record EmployeeLoginResponse(int EmployeeID, string Fname, string Lname, string JobPosition);

/// <summary>
/// Light-weight login endpoints. Passwords are verified against the BCrypt
/// hash stored in the database. No JWT yet — the point is to prove that the
/// Password column (new for Employee per teacher feedback) is being used.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly GreenGrowContext _db;
    public AuthController(GreenGrowContext db) => _db = db;

    [HttpPost("login/user")]
    public async Task<ActionResult<UserLoginResponse>> UserLogin(LoginRequest req)
    {
        // Find the user by one of their email addresses (multi-valued attribute).
        var hit = await _db.UserEmails
            .Include(ue => ue.User)
            .FirstOrDefaultAsync(ue => ue.Email == req.Email);

        if (hit?.User is null || !PasswordService.Verify(req.Password, hit.User.Password))
            return Unauthorized(new { message = "Invalid email or password." });

        return new UserLoginResponse(hit.User.UserID, hit.User.Fname, hit.User.Lname, hit.Email);
    }

    [HttpPost("login/employee")]
    public async Task<ActionResult<EmployeeLoginResponse>> EmployeeLogin(EmployeeLoginRequest req)
    {
        var emp = await _db.Employees.FindAsync(req.EmployeeID);
        if (emp is null || !PasswordService.Verify(req.Password, emp.Password))
            return Unauthorized(new { message = "Invalid employee ID or password." });

        return new EmployeeLoginResponse(emp.EmployeeID, emp.Fname, emp.Lname, emp.JobPosition);
    }
}
