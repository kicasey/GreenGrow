using GreenGrow.Api.Data;
using GreenGrow.Api.Dtos;
using GreenGrow.Api.Models;
using GreenGrow.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly GreenGrowContext _db;
    public UsersController(GreenGrowContext db) => _db = db;

    [HttpGet]
    public async Task<IEnumerable<UserDto>> Get() =>
        await _db.Users
            .Include(u => u.Emails)
            .Include(u => u.Phones)
            .Select(u => new UserDto(
                u.UserID, u.Fname, u.Lname,
                u.Emails.Select(e => e.Email),
                u.Phones.Select(p => p.PhoneNumber)))
            .ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetOne(int id)
    {
        var u = await _db.Users
            .Include(x => x.Emails)
            .Include(x => x.Phones)
            .FirstOrDefaultAsync(x => x.UserID == id);
        if (u is null) return NotFound();
        return new UserDto(u.UserID, u.Fname, u.Lname,
            u.Emails.Select(e => e.Email),
            u.Phones.Select(p => p.PhoneNumber));
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(UserCreateDto dto)
    {
        // Password is hashed with BCrypt before it ever hits MySQL.
        var u = new User
        {
            Fname = dto.Fname,
            Lname = dto.Lname,
            Password = PasswordService.Hash(dto.Password),
            Emails = (dto.Emails ?? Array.Empty<string>())
                .Select(e => new UserEmail { Email = e }).ToList(),
            Phones = (dto.Phones ?? Array.Empty<string>())
                .Select(p => new UserPhone { PhoneNumber = p }).ToList(),
        };
        _db.Users.Add(u);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = u.UserID },
            new UserDto(u.UserID, u.Fname, u.Lname,
                u.Emails.Select(e => e.Email),
                u.Phones.Select(p => p.PhoneNumber)));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UserCreateDto dto)
    {
        var u = await _db.Users
            .Include(x => x.Emails)
            .Include(x => x.Phones)
            .FirstOrDefaultAsync(x => x.UserID == id);
        if (u is null) return NotFound();

        u.Fname = dto.Fname;
        u.Lname = dto.Lname;
        if (!string.IsNullOrWhiteSpace(dto.Password))
            u.Password = PasswordService.Hash(dto.Password);

        _db.UserEmails.RemoveRange(u.Emails);
        _db.UserPhones.RemoveRange(u.Phones);
        u.Emails = (dto.Emails ?? Array.Empty<string>())
            .Select(e => new UserEmail { Email = e, UserID = id }).ToList();
        u.Phones = (dto.Phones ?? Array.Empty<string>())
            .Select(p => new UserPhone { PhoneNumber = p, UserID = id }).ToList();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u is null) return NotFound();
        _db.Users.Remove(u);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
